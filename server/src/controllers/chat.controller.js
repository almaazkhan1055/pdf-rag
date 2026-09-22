import OpenAI from "openai";

import { searchSimilarDocuments } from "../services/vector.service.js";
import { buildRagPrompt } from "../services/prompt.js";
import ConversationsList from "../models/conversationsList.model.js";

const ai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";

export const chat = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    // Create conversation record
    const conversation = await ConversationsList.create({
      userId,
      title: question,
    });

    console.log("MongoDB conversation record created:", conversation);

    const results = await searchSimilarDocuments(question, 5);

    const context = results
      .map(([document]) => document.pageContent)
      .join("\n\n");

    const prompt = buildRagPrompt({
      context,
      question,
    });

    const response = await ai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const answer = response.choices[0]?.message?.content || "";

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
