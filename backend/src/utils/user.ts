import { db } from "../db";
import { users, userSkills, skills } from "../db/schema";
import { eq } from "drizzle-orm";

/**
 * Fetches the complete profile for a user including their skills and virtual fields.
 */
export async function getFullProfile(userId: number) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return null;

  // Fetch all user skills in one go
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

  return {
    ...user,
    // Avoid returning sensitive fields
    password: undefined,
    skills: allUserSkills,
    skillsTeach,
    skillsLearn,
    achievements: [], // Placeholder for now
    avatar: user.avatar,
    engagementScore: user.totalScore || 0,
    weeklyGain: 0, // Placeholder
  };
}
