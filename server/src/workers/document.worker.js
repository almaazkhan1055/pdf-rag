import "dotenv/config";

import { Worker } from "bullmq";
import IORedis from "ioredis";
import { QdrantVectorStore } from "@langchain/qdrant";
import connectDB from "../db/db.js";

import Document from "../models/document.model.js";
import { extractPdfText } from "../services/document.service.js";
import { createChunks } from "../services/chunk.service.js";
import { embeddings } from "../services/embedding.service.js";

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

connection.on("connect", () => {
  console.log("Valkey connected");
});

connection.on("ready", () => {
  console.log("Valkey ready");
});

connection.on("error", (error) => {
  console.error("Valkey error:", error.message);
});

await connectDB();
console.log("Worker MongoDB connection established");

const worker = new Worker(
  "document-processing",

  async (job) => {
    const { documentId } = job.data;

    console.log(`Processing job ${job.id} for document ${documentId}`);

    // --------------------------------------------------
    // 1. Get document from MongoDB
    // --------------------------------------------------

    const document = await Document.findById(documentId);

    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    // --------------------------------------------------
    // 2. Mark document as processing
    // --------------------------------------------------

    document.status = "processing";
    document.error = null;

    await document.save();

    try {
      console.log(`Processing file: ${document.originalName}`);

      // ------------------------------------------------
      // 3. Extract PDF text
      // ------------------------------------------------

      const { text, pages } = await extractPdfText(document.path);

      console.log(`PDF pages: ${pages}`);
      console.log(`Extracted characters: ${text.length}`);

      if (!text.trim()) {
        throw new Error("No text could be extracted from PDF");
      }

      // ------------------------------------------------
      // 4. Create LangChain documents/chunks
      // ------------------------------------------------

      const documents = await createChunks(text, {
        documentId: document._id.toString(),
        source: document.originalName,
        filename: document.filename,
        pages,
      });

      console.log(`Created ${documents.length} chunks`);

      if (!documents.length) {
        throw new Error("No chunks were created from PDF");
      }

      // ------------------------------------------------
      // 5. Generate embeddings + store in Qdrant
      // ------------------------------------------------

      await QdrantVectorStore.fromDocuments(documents, embeddings, {
        url: process.env.QDRANT_URL,
        collectionName: process.env.QDRANT_COLLECTION,
      });

      console.log(`Indexed ${documents.length} chunks in Qdrant`);

      // ------------------------------------------------
      // 6. Mark document as completed
      // ------------------------------------------------

      document.status = "completed";

      await document.save();

      // ------------------------------------------------
      // 7. Delete temporary PDF
      // ------------------------------------------------

      // We'll add the file deletion here next.
      // Keep the PDF for now until the entire
      // pipeline is verified.

      return {
        documentId,
        pages,
        chunks: documents.length,
      };
    } catch (error) {
      // ----------------------------------------------
      // Mark document as failed
      // ----------------------------------------------

      document.status = "failed";
      document.error = error.message;

      await document.save();

      throw error;
    }
  },

  {
    connection,
    concurrency: 3,
  },
);

worker.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed`, result);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});

worker.on("error", (error) => {
  console.error("Worker error:", error.message);
});

console.log("Document worker started");
