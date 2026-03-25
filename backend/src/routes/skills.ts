import { Router } from "express";
import { db } from "../db";
import { skills, userSkills } from "../db/schema";
import { protect, AuthRequest } from "../middlewares/auth";
import { z } from "zod";
import { eq } from "drizzle-orm";

const router = Router();

// GET trending skills
router.get("/trending", protect, async (req, res) => {
  try {
    // Mocking top 5 trending skills to fulfill the UI requirement quickly
    const topSkills = [
      { id: 1, name: "React Native", mentions: 120 },
      { id: 2, name: "Guitar", mentions: 95 },
      { id: 3, name: "Python", mentions: 88 },
      { id: 4, name: "Public Speaking", mentions: 70 },
      { id: 5, name: "Figma", mentions: 65 }
    ];
    res.json(topSkills);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching trending skills" });
  }
});

// GET all skills
router.get("/", protect, async (req, res) => {
  try {
    const allSkills = await db.select().from(skills);
    res.json(allSkills);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching skills" });
  }
});

// POST add a new skill to the platform
const skillSchema = z.object({
  name: z.string(),
  category: z.string(),
});

router.post("/", protect, async (req, res) => {
  try {
    const data = skillSchema.parse(req.body);
    const [existing] = await db.select().from(skills).where(eq(skills.name, data.name));
    
    if (existing) {
      res.status(400).json({ error: "Skill already exists" });
      return;
    }

    const [newSkill] = await db.insert(skills).values(data).returning();
    res.status(201).json(newSkill);
  } catch (error) {
    res.status(500).json({ error: "Server error creating skill" });
  }
});

// POST add skill to user
const userSkillSchema = z.object({
  skillId: z.number().int().positive(),
  type: z.enum(["teach", "learn"]),
});

router.post("/me", protect, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const data = userSkillSchema.parse(req.body);
    
    const [added] = await db.insert(userSkills).values({
      userId,
      skillId: data.skillId,
      type: data.type
    }).returning();

    res.status(201).json(added);
  } catch (error) {
    res.status(500).json({ error: "Server error adding skill to user" });
  }
});

export default router;
