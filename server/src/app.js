import express from "express";
import cors from "cors";
import { config } from "dotenv";
import connectDB from "./db/db.js";
import ingestRoutes from "./routers/ingest.routes.js";
import chatRoutes from "./routers/chat.routes.js";
import documentRoutes from "./routers/document.routes.js";
import conversationListRoutes from "./routers/conversations.routes.js";
import { clerkMiddleware } from "@clerk/express";

config();

const app = express();

// Global middleware

const allowedOrigins = process.env.CLIENT_URLS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(clerkMiddleware());

// Database
connectDB();

// Routes
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

app.use("/api", ingestRoutes);
app.use("/api", chatRoutes);
app.use("/api", documentRoutes);
app.use("/api", conversationListRoutes);

export default app;
