import { Router } from "express";
import { db } from "../db";
import { sessions } from "../db/schema";
import { protect, AuthRequest } from "../middlewares/auth";
import { eq, or } from "drizzle-orm";
import { processSessionScore } from "../services/scoreService";

const router = Router();

// GET my sessions
router.get("/", protect, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const mySessions = await db.select().from(sessions).where(
      or(eq(sessions.tutorId, userId), eq(sessions.learnerId, userId))
    );
    res.json(mySessions);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching sessions" });
  }
});

// PATCH confirm session
router.patch("/:id/confirm", protect, async (req: AuthRequest, res) => {
  try {
    const sessionId = parseInt(req.params.id as string);
    const userId = req.user!.userId;

    const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    if (session.status === "completed") {
      res.status(400).json({ error: "Session already completed" });
      return;
    }

    let isTutor = session.tutorId === userId;
    let isLearner = session.learnerId === userId;

    if (!isTutor && !isLearner) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    const updates: any = {};
    if (isTutor) updates.confirmedByTutor = true;
    if (isLearner) updates.confirmedByLearner = true;

    const [updated] = await db.update(sessions).set(updates).where(eq(sessions.id, sessionId)).returning();

    // If both confirmed, complete it and process scores
    if (updated.confirmedByTutor && updated.confirmedByLearner && updated.status !== "completed") {
      const { tutorGain, learnerGain } = await processSessionScore({
        tutorId: session.tutorId,
        learnerId: session.learnerId,
        sessionId: session.id
      });
      res.json({ message: "Session completed", session: updated, tutorGain, learnerGain });
      return;
    }

    res.json({ message: "Confirmation recorded", session: updated });
  } catch (error) {
    res.status(500).json({ error: "Server error confirming session" });
  }
});

export default router;
