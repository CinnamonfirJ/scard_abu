import { Router } from "express";
import { db } from "../db";
import { users, sessions, requests, skills } from "../db/schema";
import { protect, AuthRequest } from "../middlewares/auth";
import { eq, or, aliasedTable } from "drizzle-orm";
import { processSessionScore } from "../services/scoreService";
import { sendPushNotification } from "../services/notificationService";

const router = Router();

// GET my sessions
router.get("/", protect, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    
    const tutor = aliasedTable(users, "tutor");
    const learner = aliasedTable(users, "learner");

    const mySessions = await db.select({
      id: sessions.id,
      requestId: sessions.requestId,
      tutorId: sessions.tutorId,
      learnerId: sessions.learnerId,
      status: sessions.status,
      confirmedByTutor: sessions.confirmedByTutor,
      confirmedByLearner: sessions.confirmedByLearner,
      createdAt: sessions.createdAt,
      completedAt: sessions.completedAt,
      skillId: requests.skillId,
      skillName: skills.name,
      tutorName: tutor.name,
      tutorPhone: tutor.phone,
      learnerName: learner.name,
      learnerPhone: learner.phone
    }).from(sessions)
      .innerJoin(requests, eq(sessions.requestId, requests.id))
      .innerJoin(skills, eq(requests.skillId, skills.id))
      .innerJoin(tutor, eq(sessions.tutorId, tutor.id))
      .innerJoin(learner, eq(sessions.learnerId, learner.id))
      .where(
        or(eq(sessions.tutorId, userId), eq(sessions.learnerId, userId))
      );
      
    res.json(mySessions);
  } catch (error) {
    console.error("[SESSIONS_FETCH_ERROR]", error);
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

    // Notify the OTHER party that a confirmation was made
    const otherUserId = isTutor ? updated.learnerId : updated.tutorId;
    const [otherUser] = await db.select({ pushToken: users.pushToken, name: users.name }).from(users).where(eq(users.id, otherUserId));
    const [currentUser] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId));

    if (otherUser?.pushToken && !updated.status.includes("completed")) {
      sendPushNotification(
        otherUser.pushToken,
        "Session Update 📝",
        `${currentUser?.name || "The other user"} has confirmed the session. Your turn!`,
        { sessionId: updated.id, screen: "Sessions" }
      );
    }

    // If both confirmed
    if (updated.confirmedByTutor && updated.confirmedByLearner) {
      // If both said "yes", process scores
      if (updated.tutorOutcome === "yes" && updated.learnerOutcome === "yes") {
        const { tutorGain, learnerGain } = await processSessionScore({
          tutorId: session.tutorId,
          learnerId: session.learnerId,
          sessionId: session.id
        });

        // Notify BOTH about completion and XP
        const [tutor] = await db.select({ pushToken: users.pushToken }).from(users).where(eq(users.id, session.tutorId));
        const [learner] = await db.select({ pushToken: users.pushToken }).from(users).where(eq(users.id, session.learnerId));

        if (tutor?.pushToken) {
          sendPushNotification(
            tutor.pushToken,
            "Success! 🌟",
            `Session verified! You earned ${Math.floor(tutorGain)} XP for teaching.`,
            { screen: "Leaderboard" }
          );
        }
        if (learner?.pushToken) {
          sendPushNotification(
            learner.pushToken,
            "Success! 🚀",
            `Session verified! You earned ${Math.floor(learnerGain)} XP for learning.`,
            { screen: "Leaderboard" }
          );
        }

        res.json({ message: "Session completed successfully", session: updated, tutorGain, learnerGain });
        return;
      } else {
        // Dispute flagged
        if (otherUser?.pushToken) {
          sendPushNotification(
            otherUser.pushToken,
            "Dispute Alert ⚠️",
            "A dispute has been flagged for your session. It will be reviewed.",
            { sessionId: updated.id, screen: "Sessions" }
          );
        }
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
