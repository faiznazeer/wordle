import express, { Request, Response } from "express";
import axios from "axios";
import cors from "cors";
import serverless from "serverless-http";
import { PrismaClient } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import authenticateToken from "./middleware";

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

app.use(cors());
app.use(express.json());

// Google OAuth login endpoint
app.post("/auth/google", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ error: 'Missing Token' });
  }
  
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid token payload');
    }

    const { email, name, sub: googleId } = payload;

    let user = await prisma.user.findUnique({ 
      where: { googleId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email!,  // Non-null assertion as email is required in our schema
          name: name || 'Anonymous',
          googleId
        }
      });
    }

    const jwtToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token: jwtToken, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }); 
  } catch (error) {
    console.log('Error in google login: ', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Protected route to get user profile
app.get("/auth/profile", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user?.userId },
      select: {
        id: true,
        email: true,
        name: true,
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Combined endpoint to get word and start game
app.get("/get_word", authenticateToken, async (req: Request, res: Response) => {
  try {
    // First check for any in-progress game
    const existingGame = await prisma.game.findFirst({
      where: {
        userId: (req as any).user.userId,
        status: 'IN_PROGRESS'
      }
    });

    // If there's an existing game, return it and stop execution
    if (existingGame) {
      res.json({
        word: existingGame.word,
        gameId: existingGame.id
      });
      return;
    }

    // If no existing game, create a new one
    const response = await axios.get("https://gist.githubusercontent.com/faiznazeer/74d88006748a622aa696bdee811f38fd/raw/60531ab531c4db602dacaa4f6c0ebf2590b123da/wordle-nyt-answers-alphabetical.txt");
    const wordList = response.data.split("\n");
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    
    // Create game record
    const game = await prisma.game.create({
      data: {
        userId: (req as any).user.userId,
        word: randomWord,
        status: 'IN_PROGRESS'
      }
    });

    res.json({
      word: randomWord,
      gameId: game.id
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update game status
app.patch("/game/:id", authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { won, attempts } = req.body;
  
  try {
    await prisma.game.update({
      where: { id: parseInt(id) },
      data: {
        status: won ? 'WON' : 'LOST',
        attempts,
        completedAt: new Date()
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.log('Error in updating game details: ', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
});

// Add this new endpoint before the module.exports
app.get("/game/history", authenticateToken, async (req: Request, res: Response) => {
  try {
    const games = await prisma.game.groupBy({
      by: ['status', 'attempts'],
      where: {
        userId: (req as any).user.userId,
        status: {
          not: 'IN_PROGRESS'
        }
      },
      _count: {
        _all: true
      }
    });
    
    res.json(games);
  } catch (error) {
    console.error('Error fetching game history:', error);
    res.status(500).json({ error: 'Failed to fetch game history' });
  }
});

if (process.env.NODE_ENV === 'dev') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports.handler = serverless(app);