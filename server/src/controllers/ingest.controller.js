import Document from "../models/document.model.js";
import { documentQueue } from "../queues/document.queue.js";
import { uploadPdf } from "../services/imagekit.service.js";

export const ingestDocument = async (req, res) => {
  console.log("req.file", req.file);
  console.log("req.body", req.body);

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required",
      });
    }

    const uploadedFile = await uploadPdf(req.file);
    console.log("PDF uploaded to ImageKit:", uploadedFile);

    // 1. Create document record
    const document = await Document.create({
      originalName: req.file.originalname,
      filename: uploadedFile.name,
      path: uploadedFile.url,
      mimetype: req.file.mimetype,
      size: req.file.size,
      status: "queued",
    });

    console.log("MongoDB document created:", document);

    // 2. Add document processing job
    const job = await documentQueue.add(
      "process-document",
      {
        documentId: document._id.toString(),
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: {
          count: 100,
        },
        removeOnFail: {
          count: 500,
        },
      },
    );

    console.log("Job added:", job.id);

    return res.status(202).json({
      success: true,
      message: "Document uploaded and queued for processing",
      documentId: document._id,
      jobId: job.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to queue document",
    });
  }
};
