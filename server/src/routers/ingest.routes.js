import express from "express";
import ingest from "../middlewares/ingest.middleware.js";
import { ingestDocument } from "../controllers/ingest.controller.js";

const router = express.Router();

router.post("/ingest", ingest.single("pdf"), ingestDocument);

export default router;
