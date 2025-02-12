import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload }  from 'jsonwebtoken';

// Middleware to verify JWT
const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1] || '';
  
    if (!token) { 
      res.sendStatus(401);
    }
  
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || '');
      (req as any).user = payload as JwtPayload;
      next();
    } catch (err) {
      res.sendStatus(403);
    }
  };

export default authenticateToken;