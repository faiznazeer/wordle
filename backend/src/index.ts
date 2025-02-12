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

// Protected route to get random word
app.get("/get_word", authenticateToken, async (req: Request, res: Response) => {
  try {
    const response = await axios.get("https://gist.githubusercontent.com/faiznazeer/74d88006748a622aa696bdee811f38fd/raw/60531ab531c4db602dacaa4f6c0ebf2590b123da/wordle-nyt-answers-alphabetical.txt");
    const wordList = response.data.split("\n");
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    res.json({
      word: randomWord
    });
  } catch (error) {
    console.error('Word fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch word' });
  }
});

if (process.env.NODE_ENV === 'dev') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports.handler = serverless(app);