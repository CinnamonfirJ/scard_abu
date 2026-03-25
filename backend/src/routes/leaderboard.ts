import { Router } from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { desc } from "drizzle-orm";

const router = Router();

// Cache or limit query size in prod, but simple for now
router.get("/global", async (req, res) => {
  try {
    const topUsers = await db.select({
      id: users.id,
      name: users.name,
      department: users.department,
      faculty: users.faculty,
      totalScore: users.totalScore,
      avatar: users.avatar
    }).from(users).orderBy(desc(users.totalScore)).limit(50);

    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching leaderboard" });
  }
});

router.get("/department", async (req, res) => {
  try {
    const department = req.query.dept as string;
    if (!department) {
       res.status(400).json({ error: "Department query param ?dept=... is required" });
       return;
    }

    const { eq } = await import("drizzle-orm");
    const topUsers = await db.select({
      id: users.id,
      name: users.name,
      department: users.department,
      totalScore: users.totalScore,
      avatar: users.avatar
    }).from(users).where(eq(users.department, department)).orderBy(desc(users.totalScore)).limit(50);

    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching leaderboard" });
  }
});

router.get("/weekly", async (req, res) => {
  try {
    // Requires a `weekly_score` column and a cron job to reset it.
    // For now, we fallback to total_score for demonstration.
    const topUsers = await db.select({
      id: users.id,
      name: users.name,
      department: users.department,
      totalScore: users.totalScore, // replace with weekly_score when added
      avatar: users.avatar
    }).from(users).orderBy(desc(users.totalScore)).limit(50);

    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching weekly leaderboard" });
  }
});

export default router;
