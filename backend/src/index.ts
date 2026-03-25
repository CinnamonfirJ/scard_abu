import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import skillsRoutes from "./routes/skills";
import requestsRoutes from "./routes/requests";
import sessionsRoutes from "./routes/sessions";
import leaderboardRoutes from "./routes/leaderboard";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*", // allow all for mobile
  }),
);
app.use(express.json());

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 20, // max 20 login/register requests per IP
  message: "Too many requests from this IP, please try again later",
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Routes
app.use("/auth", authLimiter, authRoutes);
app.use("/users", apiLimiter, usersRoutes);
app.use("/skills", apiLimiter, skillsRoutes);
app.use("/requests", apiLimiter, requestsRoutes);
app.use("/sessions", apiLimiter, sessionsRoutes);
app.use("/leaderboard", apiLimiter, leaderboardRoutes);

// General Error Handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something broke!" });
  },
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
