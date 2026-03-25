import { db } from "./index";
import { users, skills, userSkills } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");
  
  // Clean up
  await db.delete(userSkills);
  await db.delete(skills);
  await db.delete(users);

  // Insert Skills
  const insertedSkills = await db.insert(skills).values([
    { name: "React Native", category: "Programming" },
    { name: "Node.js", category: "Programming" },
    { name: "UI/UX Design", category: "Design" },
    { name: "Public Speaking", category: "Soft Skills" },
  ]).returning();

  // Create Users
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const insertedUsers = await db.insert(users).values([
    {
      name: "Alice Johnson",
      email: "alice@example.com",
      password: hashedPassword,
      matric: "U2021/1000",
      phone: "1234567890",
      department: "Computer Science",
      faculty: "Science",
      year: 3,
      totalScore: 50,
    },
    {
      name: "Bob Smith",
      email: "bob@example.com",
      password: hashedPassword,
      matric: "U2021/1001",
      phone: "0987654321",
      department: "Software Engineering",
      faculty: "Science",
      year: 3,
      totalScore: 20,
    },
    {
      name: "Charlie Davis",
      email: "charlie@example.com",
      password: hashedPassword,
      matric: "U2022/2000",
      phone: "1112223333",
      department: "Economics",
      faculty: "Social Sciences",
      year: 2,
      totalScore: 10,
    }
  ]).returning();

  // Insert User Skills
  await db.insert(userSkills).values([
    { userId: insertedUsers[0].id, skillId: insertedSkills[0].id, type: "teach" },
    { userId: insertedUsers[0].id, skillId: insertedSkills[1].id, type: "learn" },
    
    { userId: insertedUsers[1].id, skillId: insertedSkills[0].id, type: "learn" },
    { userId: insertedUsers[1].id, skillId: insertedSkills[1].id, type: "teach" },
    
    { userId: insertedUsers[2].id, skillId: insertedSkills[2].id, type: "teach" },
    { userId: insertedUsers[2].id, skillId: insertedSkills[3].id, type: "learn" },
  ]);

  console.log("Seeding completed.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
