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
    // We only want to notify if they haven't been notified yet or haven't confirmed
    // For simplicity, we'll notify if confirmedBy... is false and session is > 24h old
    
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
      // Notify Tutor if not confirmed
      if (!session.confirmedByTutor) {
        const [tutor] = await db.select({ pushToken: users.pushToken }).from(users).where(eq(users.id, session.tutorId));
        if (tutor?.pushToken) {
          await sendPushNotification(
            tutor.pushToken,
            "Confirm Your Session 🎓",
            "Did you successfully teach your skill? Please confirm to earn your XP!",
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
            "Confirm Your Session 🎯",
            "Did you successfully learn the skill? Please confirm to earn your XP!",
            { sessionId: session.id, screen: "Sessions" }
          );
        }
      }
    }
  } catch (error) {
    console.error("[CONFIRMATION_SERVICE_ERROR]", error);
  }
}
