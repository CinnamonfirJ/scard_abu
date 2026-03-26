import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { getFullProfile } from "../utils/user";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  matric: z.string(),
  phone: z.string(),
  department: z.string(),
  faculty: z.string(),
  year: z.number().int().positive(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    
    // Check if user exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, data.email));
    if (existingUser) {
       res.status(400).json({ error: "Email already in use" });
       return;
    }

    const [existingMatric] = await db.select().from(users).where(eq(users.matric, data.matric));
    if (existingMatric) {
       res.status(400).json({ error: "Matric already in use" });
       return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const [newUser] = await db.insert(users).values({
      ...data,
      password: hashedPassword,
    }).returning();

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || "supersecret_jwt_key_here",
      { expiresIn: "30d" }
    );

    const fullUser = await getFullProfile(newUser.id);

    res.status(201).json({ token, user: fullUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ error: error.issues });
       return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const [user] = await db.select().from(users).where(eq(users.email, data.email));
    if (!user) {
       res.status(401).json({ error: "Invalid credentials" });
       return;
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
       res.status(401).json({ error: "Invalid credentials" });
       return;
    }
    
    // Update lastLogin and reset dailyScore if new day
    const lastLoginDate = user.lastLogin ? new Date(user.lastLogin).toDateString() : null;
    const today = new Date().toDateString();
    
    const updates: any = { lastLogin: new Date() };
    if (lastLoginDate !== today) {
      updates.dailyScore = 0;
    }

    await db.update(users).set(updates).where(eq(users.id, user.id));

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "supersecret_jwt_key_here",
      { expiresIn: "30d" }
    );

    const fullUser = await getFullProfile(user.id);

    res.json({ token, user: fullUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ error: error.issues });
       return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
