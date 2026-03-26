import { db } from "../db";
import { activities } from "../db/schema";

export type ActivityType = 
  | "learn_skill" 
  | "teach_skill" 
  | "session_completed" 
  | "xp_gained" 
  | "profile_updated";

interface RecordActivityParams {
  userId: number;
  type: ActivityType;
  description: string;
  xpGained?: number;
}

/**
 * Records a user activity in the database.
 */
export async function recordActivity(params: RecordActivityParams) {
  try {
    const { userId, type, description, xpGained } = params;
    await db.insert(activities).values({
      userId,
      type,
      description,
      xpGained: xpGained || 0,
    });
  } catch (error) {
    console.error("Failed to record activity:", error);
    // We don't throw here to avoid breaking the main flow if activity logging fails
  }
}
