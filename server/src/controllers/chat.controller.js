import { GoogleGenAI } from "@google/genai";
import crypto from "crypto";

import { searchSimilarDocuments } from "../services/vector.service.js";
import { buildRagPrompt } from "../services/prompt.js";

const keyFingerprint = process.env.GEMINI_API_KEY
  ? crypto
      .createHash("sha256")
      .update(process.env.GEMINI_API_KEY)
      .digest("hex")
      .slice(0, 12)
  : "missing";

console.log("Gemini key fingerprint:", keyFingerprint);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = process.env.GEMINI_CHAT_MODEL || "gemini-3.6-flash";

export const chat = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const results = await searchSimilarDocuments(question, 5);

    const context = results
      .map(([document]) => document.pageContent)
      .join("\n\n");

    const prompt = buildRagPrompt({
      context,
      question,
    });

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const answer = response.text;

    return res.status(200).json({
      success: true,
      question,
      answer,
      results: results.map(([document, score]) => ({
        score,
        content: document.pageContent,
        metadata: document.metadata,
      })),
    });
  } catch (error) {
    console.error("Chat error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate answer",
    });
  }
};

export const testGemini = async (req, res) => {
  console.log("Gemini key exists:", Boolean(process.env.GEMINI_API_KEY));
  console.log("Gemini key prefix:", process.env.GEMINI_API_KEY?.slice(0, 8));
  console.log("Gemini model:", MODEL);
  try {
    console.log("Testing Gemini...");
    console.log("Gemini model:", MODEL);

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: "Reply with exactly: Gemini test successful",
    });

    console.log("Gemini test response:", response.text);

    return res.status(200).json({
      success: true,
      model: MODEL,
      answer: response.text,
    });
  } catch (error) {
    console.error("Gemini test error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
      status: error.status,
    });
  }
};
