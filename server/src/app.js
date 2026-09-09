import express from "express";
import cors from "cors";
import { config } from "dotenv";
import connectDB from "./db/db.js";
import ingestRoutes from "./routers/ingest.routes.js";
import chatRoutes from "./routers/chat.routes.js";
import documentRoutes from "./routers/document.routes.js";

config();

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

// Database
connectDB();

// Routes
app.use("/api", ingestRoutes);
app.use("/api", chatRoutes);
app.use("/api", documentRoutes);

export default app;
