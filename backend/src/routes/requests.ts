import { Router } from "express";
import { db } from "../db";
import { requests, sessions, users } from "../db/schema";
import { protect, AuthRequest } from "../middlewares/auth";
import { z } from "zod";
import { eq, or, aliasedTable } from "drizzle-orm";
import { sendPushNotification } from "../services/notificationService";

const router = Router();

// GET my requests (both as sender and receiver)
router.get("/", protect, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    
    const sender = aliasedTable(users, "sender");
    const receiver = aliasedTable(users, "receiver");

    const myRequests = await db.select({
      id: requests.id,
      senderId: requests.senderId,
      receiverId: requests.receiverId,
      skillId: requests.skillId,
      type: requests.type,
      status: requests.status,
      message: requests.message,
      createdAt: requests.createdAt,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      receiverName: receiver.name,
      receiverAvatar: receiver.avatar
    }).from(requests)
      .innerJoin(sender, eq(requests.senderId, sender.id))
      .innerJoin(receiver, eq(requests.receiverId, receiver.id))
      .where(or(eq(requests.senderId, userId), eq(requests.receiverId, userId)));
      
    res.json(myRequests);
  } catch (error) {
    console.error("[REQUESTS_FETCH_ERROR]", error);
    res.status(500).json({ error: "Server error fetching requests" });
  }
});

// POST create request
const createRequestSchema = z.object({
  receiverId: z.number().int().positive(),
  skillId: z.number().int().positive(),
  type: z.enum(["learn", "exchange"]),
  message: z.string().optional(),
});

router.post("/", protect, async (req: AuthRequest, res) => {
  try {
    const data = createRequestSchema.parse(req.body);
    const senderId = req.user!.userId;

    if (senderId === data.receiverId) {
      res.status(400).json({ error: "Cannot send request to yourself" });
      return;
    }

    const [newRequest] = await db.insert(requests).values({
      senderId,
      receiverId: data.receiverId,
      skillId: data.skillId,
      type: data.type,
      status: "pending",
      message: data.message
    }).returning();

    // Send notification to receiver
    const [receiver] = await db.select({ pushToken: users.pushToken, name: users.name }).from(users).where(eq(users.id, data.receiverId));
    const [sender] = await db.select({ name: users.name }).from(users).where(eq(users.id, senderId));
    
    if (receiver?.pushToken) {
      sendPushNotification(
        receiver.pushToken,
        "New Request! 🎓",
        `${sender?.name || "Someone"} wants to ${data.type} with you.`,
        { requestId: newRequest.id }
      );
    }

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("[REQUEST_CREATE_ERROR]", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    const errorMessage = error instanceof Error ? error.message : "Server error creating request";
    res.status(500).json({ error: errorMessage });
  }
});

// PATCH accept/reject request
const patchRequestSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
});

router.patch("/:id", protect, async (req: AuthRequest, res) => {
  try {
    const requestId = parseInt(req.params.id as string);
    const data = patchRequestSchema.parse(req.body);
    const userId = req.user!.userId;

    const [existing] = await db.select().from(requests).where(eq(requests.id, requestId));
    if (!existing || existing.receiverId !== userId) {
      res.status(404).json({ error: "Request not found or unauthorized" });
      return;
    }

    const [updated] = await db.update(requests).set({ status: data.status }).where(eq(requests.id, requestId)).returning();

    // Notify the sender
    const [sender] = await db.select({ pushToken: users.pushToken, name: users.name }).from(users).where(eq(users.id, updated.senderId));
    const [receiver] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId));

    if (sender?.pushToken) {
      sendPushNotification(
        sender.pushToken,
        data.status === "accepted" ? "Request Accepted! 🎉" : "Request Update",
        `${receiver?.name || "Common User"} has ${data.status} your request.`,
        { requestId: updated.id, status: data.status }
      );
    }

    if (data.status === "accepted") {
      let tutorId, learnerId;
      if (updated.type === "learn") {
        tutorId = updated.receiverId;
        learnerId = updated.senderId;
      } else {
        tutorId = updated.receiverId;
        learnerId = updated.senderId;
      }
      
      await db.insert(sessions).values({
        requestId: updated.id,
        tutorId,
        learnerId,
        status: "scheduled"
      });
    }

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    res.status(500).json({ error: "Server error updating request" });
  }
});

export default router;
