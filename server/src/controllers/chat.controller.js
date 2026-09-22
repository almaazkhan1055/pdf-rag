import { GoogleGenAI } from "@google/genai";
import { getAuth } from "@clerk/express";

import { searchSimilarDocuments } from "../services/vector.service.js";
import { buildRagPrompt } from "../services/prompt.js";
import ConversationsList from "../models/conversationsList.model.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = process.env.GEMINI_CHAT_MODEL || "gemini-3.6-flash";

export const chat = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { question } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    if (userId) {
      const conversation = await ConversationsList.create({
        userId,
        title: question,
      });
      console.log("MongoDB conversation record created:", conversation);
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

    const answer = response.text || "";

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

    const isRateLimit =
      error?.status === 429 ||
      error?.code === 429 ||
      error?.message?.includes("Rate limit") ||
      error?.message?.includes("RESOURCE_EXHAUSTED") ||
      error?.message?.includes("quota");

    return res.status(isRateLimit ? 429 : 500).json({
      success: false,
      message: isRateLimit
        ? "AI rate limit reached. Please try again later."
        : "Failed to generate answer",
    });
  }
};
