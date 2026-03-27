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
    const { outcome, feedback, evidence } = req.body; // outcome: "yes" | "no"

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
    if (isTutor) {
      updates.confirmedByTutor = true;
      updates.tutorOutcome = outcome;
      updates.tutorFeedback = feedback;
      updates.tutorEvidence = evidence;
    } else {
      updates.confirmedByLearner = true;
      updates.learnerOutcome = outcome;
      updates.learnerFeedback = feedback;
      updates.learnerEvidence = evidence;
    }

    // Set dispute flag if anyone rejects
    if (outcome === "no") {
      updates.disputeFlag = true;
    }

    const [updated] = await db.update(sessions).set(updates).where(eq(sessions.id, sessionId)).returning();

    // If both confirmed
    if (updated.confirmedByTutor && updated.confirmedByLearner) {
      // If both said "yes", process scores
      if (updated.tutorOutcome === "yes" && updated.learnerOutcome === "yes") {
        const { tutorGain, learnerGain } = await processSessionScore({
          tutorId: session.tutorId,
          learnerId: session.learnerId,
          sessionId: session.id
        });
        res.json({ message: "Session completed successfully", session: updated, tutorGain, learnerGain });
        return;
      } else {
        // If one or both said "no", it stays in scheduled/disputed state until handled
        res.json({ message: "Session flagged for dispute. No XP awarded.", session: updated });
        return;
      }
    }

    res.json({ message: "Confirmation recorded", session: updated });
  } catch (error) {
    console.error("[SESSION_CONFIRM_ERROR]", error);
    res.status(500).json({ error: "Server error confirming session" });
  }
});

export default router;
