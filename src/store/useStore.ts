import { create } from "zustand";
import { fetchClient, getToken, clearToken } from "../api/client";

// Define our actual types
export interface User {
  id: number;
  name: string;
  email: string;
  matric: string;
  phone: string;
  department: string;
  faculty: string;
  year: number;
  totalScore: number;
  createdAt: string;
  // Fallbacks for UI
  skillsTeach?: string[];
  skillsLearn?: string[];
  achievements?: string[];
  avatar?: string;
  engagementScore?: number;
  weeklyGain?: number;
  skills?: any[];
}

export interface Skill {
  id: number;
  name: string;
  category: string;
}

export interface Request {
  id: number;
  senderId: number;
  receiverId: number;
  skillId: number;
  type: "learn" | "exchange";
  status: "pending" | "accepted" | "rejected";
  message?: string;
  createdAt: string;
  senderName?: string;
  senderAvatar?: string;
  receiverName?: string;
  receiverAvatar?: string;
}

export interface Session {
  id: number;
  requestId: number;
  tutorId: number;
  learnerId: number;
  status: "scheduled" | "completed";
  confirmedByTutor: boolean;
  confirmedByLearner: boolean;
  createdAt: string;
}

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  requests: Request[];
  sessions: Session[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Async Actions
  authenticate: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  
  fetchCurrentUser: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  fetchSessions: () => Promise<void>;
  updatePushToken: (token: string) => Promise<void>;
  respondToRequest: (requestId: number, status: "accepted" | "rejected") => Promise<void>;
  
  // Synchronous setters (for auth mainly)
  setCurrentUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  setRequests: (requests: Request[]) => void;
  setSessions: (sessions: Session[]) => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  users: [],
  requests: [],
  sessions: [],
  activeTab: 'Activity',
  setActiveTab: (tab) => set({ activeTab: tab }),

  authenticate: (user) => set((state) => ({ 
    currentUser: { ...state.currentUser, ...user }, 
    isAuthenticated: true 
  })),
  logout: async () => {
    await clearToken();
    set({ currentUser: null, isAuthenticated: false });
  },
  checkAuth: async () => {
    const token = await getToken();
    if (token) {
      set({ isAuthenticated: true });
      await get().fetchCurrentUser();
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),
  setUsers: (users) => set({ users: users }),
  setRequests: (requests) => set({ requests: requests }),
  setSessions: (sessions) => set({ sessions: sessions }),

  fetchCurrentUser: async () => {
    try {
      // If we already have a reasonably complete profile, don't block
      const current = get().currentUser;
      const data = await fetchClient("/users/me");
      
      // Merge with current to preserve any locally updated fields if necessary
      set({ currentUser: { ...current, ...data }, isAuthenticated: true });
    } catch (error) {
      console.error("Error fetching current user", error);
      if ((error as Error).message.includes("User not found")) {
        await get().logout();
      }
    }
  },

  fetchUsers: async () => {
    try {
      const data = await fetchClient("/users");
      set({ users: data });
    } catch (error) {
      console.error("Error fetching users", error);
    }
  },

  fetchRequests: async () => {
    try {
      const data = await fetchClient("/requests");
      set({ requests: data });
    } catch (error) {
      console.error("Error fetching requests", error);
    }
  },

  fetchSessions: async () => {
    try {
      const data = await fetchClient("/sessions");
      set({ sessions: data });
    } catch (error) {
      console.error("Error fetching sessions", error);
    }
  },

  updatePushToken: async (token) => {
    try {
      await fetchClient("/users/me/push-token", {
        method: "POST",
        body: JSON.stringify({ pushToken: token }),
      });
    } catch (error) {
      console.error("Error updating push token", error);
    }
  },

  respondToRequest: async (requestId, status) => {
    try {
      await fetchClient(`/requests/${requestId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      // Refresh requests and sessions
      await get().fetchRequests();
      await get().fetchSessions();
      await get().fetchCurrentUser(); // Score might have changed
    } catch (error) {
      console.error("Error responding to request", error);
      throw error;
    }
  }
}));
