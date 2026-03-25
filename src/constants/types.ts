export interface User {
  id: string;
  name: string;
  department: string;
  faculty: string;
  phone: string;
  email: string;
  matric: string;
  year: number;
  skillsTeach: string[];
  skillsLearn: string[];
  engagementScore: number;
  weeklyGain: number;
  achievements: string[];
  avatar?: string;
}

export interface Request {
  id: string;
  senderId: string;
  receiverId: string;
  type: "learn" | "exchange";
  status: "pending" | "accepted" | "rejected";
  message?: string;
  timestamp: number;
}

export interface Session {
  id: string;
  teacherId: string;
  learnerId: string;
  completed: boolean;
  rating?: number;
  timestamp: number;
}

export const DEPARTMENTS = [
  "Engineering",
  "Arts",
  "Science",
  "Business",
  "Medical",
  "Education",
];
