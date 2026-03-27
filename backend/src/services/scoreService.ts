import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { users, sessions, requests } from "../db/schema";
import { recordActivity } from "./activityService";

interface ScoreCalculationContext {
  tutorId: number;
  learnerId: number;
  sessionId: number;
}

/**
 * Calculates and applies score updates for a completed session.
 * 
 * Rules:
 * - Base Rules: Same faculty (10 XP), Different faculty (15 XP)
 * - Initiator Bonus: The user who sent the initial request receives a bonus of 0.25 × base XP.
 * - XP is awarded individually.
 */
export async function processSessionScore(context: ScoreCalculationContext) {
  const { tutorId, learnerId, sessionId } = context;

  // 1. Fetch both users and the session/request
  const [tutor] = await db.select().from(users).where(eq(users.id, tutorId)).limit(1);
  const [learner] = await db.select().from(users).where(eq(users.id, learnerId)).limit(1);
  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);

  if (!tutor || !learner || !session) {
    throw new Error("Tutor, Learner, or Session not found");
  }

  const [request] = await db.select().from(requests).where(eq(requests.id, session.requestId)).limit(1);
  if (!request) {
    throw new Error("Request not found");
  }

  // 2. Base XP Calculation
  let baseXP = 10; // Same faculty
  if (tutor.faculty !== learner.faculty) {
    baseXP = 15; // Different faculty
  }

  // 3. Award individually with Initiator Bonus
  let tutorScoreGain = baseXP;
  let learnerScoreGain = baseXP;

  const initiatorBonus = 0.25 * baseXP;

  if (request.senderId === tutorId) {
    tutorScoreGain += initiatorBonus;
  } else if (request.senderId === learnerId) {
    learnerScoreGain += initiatorBonus;
  }

  // 4. Atomic Update
  await db.transaction(async (tx) => {
    // Update Tutor
    await tx.update(users)
      .set({ 
        totalScore: (tutor.totalScore || 0) + tutorScoreGain,
        dailyScore: (tutor.dailyScore || 0) + tutorScoreGain 
      })
      .where(eq(users.id, tutor.id));

    // Update Learner
    await tx.update(users)
      .set({ 
        totalScore: (learner.totalScore || 0) + learnerScoreGain,
        dailyScore: (learner.dailyScore || 0) + learnerScoreGain 
      })
      .where(eq(users.id, learner.id));
      
    // Mark session as completed 
    await tx.update(sessions)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(sessions.id, sessionId));
    });

    // Record Activities
    await recordActivity({
      userId: tutor.id,
      type: "session_completed",
      description: `Completed a session with ${learner.name}. Earned ${tutorScoreGain} XP.`,
      xpGained: Math.floor(tutorScoreGain)
    });

    await recordActivity({
      userId: learner.id,
      type: "session_completed",
      description: `Completed a session with ${tutor.name}. Earned ${learnerScoreGain} XP.`,
      xpGained: Math.floor(learnerScoreGain)
    });

  return {
    tutorGain: tutorScoreGain,
    learnerGain: learnerScoreGain,
  };
}
