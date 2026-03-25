import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export function protect(req: AuthRequest, res: Response, next: NextFunction) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
     res.status(401).json({ error: "Not authorized, no token" });
     return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret_jwt_key_here") as any;
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (error) {
     res.status(401).json({ error: "Not authorized, token failed" });
     return;
  }
}
