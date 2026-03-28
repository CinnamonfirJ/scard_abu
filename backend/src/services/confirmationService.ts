import { db } from "../db";
import { sessions, users } from "../db/schema";
import { eq, and, lte, or, isNull } from "drizzle-orm";
import { sendPushNotification } from "./notificationService";

/**
 * Checks for sessions created 24-72 hours ago that haven't been confirmed.
 * Sends a push notification to users prompting them to confirm the session.
 */
export async function checkPendingConfirmations() {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    
    // Fetch sessions that are older than 24h and still in 'scheduled' status
    const pendingSessions = await db.select().from(sessions).where(
      and(
        lte(sessions.createdAt, twentyFourHoursAgo),
        eq(sessions.status, "scheduled"),
        or(
          eq(sessions.confirmedByTutor, false),
          eq(sessions.confirmedByLearner, false)
        )
      )
    );

    console.log(`[CONFIRMATION_SERVICE] Found ${pendingSessions.length} sessions pending confirmation.`);

    for (const session of pendingSessions) {
      const isVeryOld = session.createdAt <= fortyEightHoursAgo;
      
      // Notify Tutor if not confirmed
      if (!session.confirmedByTutor) {
        const [tutor] = await db.select({ pushToken: users.pushToken }).from(users).where(eq(users.id, session.tutorId));
        if (tutor?.pushToken) {
          await sendPushNotification(
            tutor.pushToken,
            isVeryOld ? "Final Reminder! ⚠️" : "Confirm Your Session 🎓",
            isVeryOld 
              ? "Your teaching session is still pending confirmation. Please verify it now to claim your XP!"
              : "Did you successfully teach your skill? Confirm now to earn your XP!",
            { sessionId: session.id, screen: "Sessions" }
          );
        }
      }

      // Notify Learner if not confirmed
      if (!session.confirmedByLearner) {
        const [learner] = await db.select({ pushToken: users.pushToken }).from(users).where(eq(users.id, session.learnerId));
        if (learner?.pushToken) {
          await sendPushNotification(
            learner.pushToken,
            isVeryOld ? "Final Reminder! ⚠️" : "Confirm Your Session 🎯",
            isVeryOld
              ? "Your learning session is still pending confirmation. Please verify it now!"
              : "Did you successfully learn the skill? Confirm now to earn your XP!",
            { sessionId: session.id, screen: "Sessions" }
          );
        }
      }
    }
  } catch (error) {
    console.error("[CONFIRMATION_SERVICE_ERROR]", error);
  }
}
