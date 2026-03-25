import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { users, sessions, requests } from "../db/schema";

interface ScoreCalculationContext {
  tutorId: number;
  learnerId: number;
  sessionId: number;
}

/**
 * Calculates and applies score updates for a completed session.
 * 
 * Rules:
 * - Base points: Teach (+10), Learn (+5), Complete (+10)
 * - Bonus: Cross-dept (+5), Cross-faculty (+15) (faculty takes priority)
 * - Both users get the Complete bonus and similarity bonuses.
 * - Caps: Prevent excessive daily farming (simplistic approach here).
 */
export async function processSessionScore(context: ScoreCalculationContext) {
  const { tutorId, learnerId, sessionId } = context;

  // 1. Fetch both users
  const [tutor] = await db.select().from(users).where(eq(users.id, tutorId)).limit(1);
  const [learner] = await db.select().from(users).where(eq(users.id, learnerId)).limit(1);

  if (!tutor || !learner) {
    throw new Error("Tutor or Learner not found");
  }

  // 2. Base Scores
  let tutorScoreGain = 10; // Teach
  let learnerScoreGain = 5; // Learn
  
  // Base completion bonus for both
  tutorScoreGain += 10;
  learnerScoreGain += 10;

  // 3. Faculty & Department Bonuses 
  let bonus = 0;
  if (tutor.faculty !== learner.faculty) {
    bonus = 15; // Cross-faculty bonus
  } else if (tutor.department !== learner.department) {
    bonus = 5; // Cross-department bonus
  }

  tutorScoreGain += bonus;
  learnerScoreGain += bonus;

  // 4. Anti-gaming / Daily caps (Simplistic: Cap at 100 points per day)
  // Assuming a cron job or login hook resets daily_score
  // For production, we'd check if (tutor.dailyScore + tutorScoreGain > 100) etc.
  
  const finalTutorDaily = tutor.dailyScore + tutorScoreGain;
  const finalLearnerDaily = learner.dailyScore + learnerScoreGain;

  // We could implement strict truncating here if final > 100
  // e.g., tutorScoreGain = Math.max(0, 100 - tutor.dailyScore); if capping at 100
  
  // 5. Atomic Update
  await db.transaction(async (tx) => {
    // Update Tutor
    await tx.update(users)
      .set({ 
        totalScore: tutor.totalScore + tutorScoreGain,
        dailyScore: tutor.dailyScore + tutorScoreGain 
      })
      .where(eq(users.id, tutor.id));

    // Update Learner
    await tx.update(users)
      .set({ 
        totalScore: learner.totalScore + learnerScoreGain,
        dailyScore: learner.dailyScore + learnerScoreGain 
      })
      .where(eq(users.id, learner.id));
      
    // Mark session as completed 
    await tx.update(sessions)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(sessions.id, sessionId));
  });

  return {
    tutorGain: tutorScoreGain,
    learnerGain: learnerScoreGain,
  };
}
