import { Router } from "express";
import { db } from "../db";
import { users, userSkills, skills } from "../db/schema";
import { eq, ne } from "drizzle-orm";
import { protect, AuthRequest } from "../middlewares/auth";

const router = Router();

// GET top teachers 
router.get("/top-teachers", protect, async (req: AuthRequest, res) => {
  try {
    const { desc } = await import("drizzle-orm");
    const top = await db.select({
      id: users.id,
      name: users.name,
      department: users.department,
      faculty: users.faculty,
      year: users.year,
      totalScore: users.totalScore,
      avatar: users.avatar
    }).from(users).orderBy(desc(users.totalScore)).limit(10);
    res.json(top);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching top teachers" });
  }
});

// GET current user profile
router.get("/me", protect, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const allUserSkills = await db.select({
      id: userSkills.id,
      skillId: userSkills.skillId,
      name: skills.name,
      type: userSkills.type
    }).from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, userId));
    
    const skillsTeach = allUserSkills.filter(s => s.type === 'teach').map(s => s.name);
    const skillsLearn = allUserSkills.filter(s => s.type === 'learn').map(s => s.name);

    res.json({
      ...user,
      skills: allUserSkills,
      skillsTeach,
      skillsLearn,
      achievements: [],
      avatar: user.avatar,
      engagementScore: user.totalScore || 0,
      weeklyGain: 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching profile" });
  }
});

// GET my activities (mocking simple recent sessions for now)
router.get("/me/activities", protect, async (req: AuthRequest, res) => {
  try {
    // Generate some dynamic mock activities based on user ID since we don't have a rigid activity table
    // For production, we would union requests and sessions
    res.json([
      { id: 1, text: "You completed a session successfully!", time: "2 hours ago", avatar: null },
      { id: 2, text: "Your request to learn React was accepted.", time: "1 day ago", avatar: null }
    ]);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching activities" });
  }
});

// GET all users (can be used for discovery)
router.get("/", protect, async (req: AuthRequest, res) => {
  try {
    const currentUserId = req.user?.userId;
    const allUsers = currentUserId 
      ? await db.select({
          id: users.id,
          name: users.name,
          department: users.department,
          faculty: users.faculty,
          year: users.year,
          totalScore: users.totalScore,
          avatar: users.avatar
        }).from(users).where(ne(users.id, currentUserId))
      : await db.select({
          id: users.id,
          name: users.name,
          department: users.department,
          faculty: users.faculty,
          year: users.year,
          totalScore: users.totalScore,
          avatar: users.avatar
        }).from(users);

    // Fetch skills for all these users
    const userIds = allUsers.map(u => u.id);
    if (userIds.length === 0) {
      res.json([]);
      return;
    }

    const { inArray } = await import("drizzle-orm");
    const allSkills = await db.select({
      userId: userSkills.userId,
      name: skills.name,
      type: userSkills.type
    }).from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.id))
      .where(inArray(userSkills.userId, userIds));

    const usersWithSkills = allUsers.map(user => ({
      ...user,
      skillsTeach: allSkills.filter(s => s.userId === user.id && s.type === 'teach').map(s => s.name),
      skillsLearn: allSkills.filter(s => s.userId === user.id && s.type === 'learn').map(s => s.name),
      avatar: user.avatar,
    }));

    res.json(usersWithSkills);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching users" });
  }
});

// GET user by ID with their skills
router.get("/:id", protect, async (req, res) => {
  try {
    const userId = parseInt(req.params.id as string);
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      department: users.department,
      faculty: users.faculty,
      year: users.year,
      totalScore: users.totalScore,
      avatar: users.avatar,
      createdAt: users.createdAt
    }).from(users).where(eq(users.id, userId));

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const userSkillsWithNames = await db.select({
      id: userSkills.id,
      skillId: userSkills.skillId,
      name: skills.name,
      type: userSkills.type
    }).from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, userId));
    
    res.json({ ...user, avatar: user.avatar, skills: userSkillsWithNames });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching user" });
  }
});

// POST sync skills
router.post("/me/sync-skills", protect, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { skillsTeach, skillsLearn } = req.body; // Arrays of strings (names)
    const { inArray } = await import("drizzle-orm");

    // 1. Delete old skills
    await db.delete(userSkills).where(eq(userSkills.userId, userId));

    const syncTypes = [
      { list: skillsTeach || [], type: 'teach' },
      { list: skillsLearn || [], type: 'learn' }
    ];

    for (const item of syncTypes) {
      for (const skillName of item.list) {
        const trimmed = skillName.trim();
        if (!trimmed) continue;

        // Find or create skill
        let [skill] = await db.select().from(skills).where(eq(skills.name, trimmed));
        if (!skill) {
          [skill] = await db.insert(skills).values({ name: trimmed, category: "General" }).returning();
        }

        // Link to user
        await db.insert(userSkills).values({
          userId,
          skillId: skill.id,
          type: item.type
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error syncing skills" });
  }
});

// PUT update user profile
router.put("/:id", protect, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.id as string);
    if (req.user?.userId !== userId) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    const { name, phone, department, faculty, year, avatar } = req.body;
    
    const [updatedUser] = await db.update(users).set({
      name, phone, department, faculty, year, avatar
    }).where(eq(users.id, userId)).returning({
      id: users.id,
      name: users.name,
      department: users.department,
      faculty: users.faculty,
      year: users.year,
      avatar: users.avatar
    });

    if (!updatedUser) {
      res.status(404).json({ error: "User profile not found. Please log in again." });
      return;
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Server error updating profile" });
  }
});

// POST update push token
router.post("/me/push-token", protect, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const { pushToken } = req.body;
    if (!userId || !pushToken) {
      res.status(400).json({ error: "Missing token" });
      return;
    }

    await db.update(users).set({ pushToken }).where(eq(users.id, userId));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Server error updating token" });
  }
});

export default router;
