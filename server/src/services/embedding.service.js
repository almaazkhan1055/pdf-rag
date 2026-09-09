import { GoogleGenAI } from "@google/genai";
import { Embeddings } from "@langchain/core/embeddings";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";

const DIMENSIONS = Number(process.env.GEMINI_EMBEDDING_DIMENSIONS || 768);

const BATCH_SIZE = 100;

const MAX_RETRIES = 5;

const INITIAL_RETRY_DELAY_MS = 5000;

const BATCH_DELAY_MS = 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const embedBatchWithRetry = async (batch) => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.embedContent({
        model: MODEL,
        contents: batch,
        config: {
          taskType: "RETRIEVAL_DOCUMENT",
          outputDimensionality: DIMENSIONS,
        },
      });

      if (
        !response?.embeddings ||
        response.embeddings.length !== batch.length
      ) {
        throw new Error(
          `Gemini returned ${response?.embeddings?.length || 0} embeddings for ${batch.length} texts`,
        );
      }

      return response.embeddings.map((embedding) => embedding.values);
    } catch (error) {
      const isRateLimit =
        error?.status === 429 ||
        error?.code === 429 ||
        error?.message?.includes("RESOURCE_EXHAUSTED") ||
        error?.message?.includes("quota");

      if (!isRateLimit || attempt === MAX_RETRIES) {
        throw error;
      }

      const retryDelay = INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1);

      const delay = Math.min(retryDelay, 60000);

      console.log(
        `Gemini rate limit hit. Retry ${attempt}/${MAX_RETRIES} in ${
          delay / 1000
        }s...`,
      );

      await sleep(delay);
    }
  }

  throw new Error("Failed to generate embeddings");
};

class GeminiEmbeddings extends Embeddings {
  constructor() {
    super({});
  }

  async embedDocuments(texts) {
    if (!texts?.length) {
      return [];
    }

    const embeddings = [];

    console.log(`Generating embeddings for ${texts.length} chunks`);

    console.log(
      `Batch size: ${BATCH_SIZE}, batches: ${Math.ceil(
        texts.length / BATCH_SIZE,
      )}`,
    );

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);

      console.log(
        `Generating embeddings: ${i + 1}-${Math.min(
          i + BATCH_SIZE,
          texts.length,
        )} of ${texts.length}`,
      );

      const batchEmbeddings = await embedBatchWithRetry(batch);

      embeddings.push(...batchEmbeddings);

      console.log(`Embedded ${embeddings.length}/${texts.length} chunks`);

      if (i + BATCH_SIZE < texts.length) {
        console.log(`Waiting ${BATCH_DELAY_MS}ms before next batch...`);

        await sleep(BATCH_DELAY_MS);
      }
    }

    return embeddings;
  }

  async embedQuery(text) {
    if (!text?.trim()) {
      throw new Error("Query text is required");
    }

    const response = await ai.models.embedContent({
      model: MODEL,
      contents: text,
      config: {
        taskType: "RETRIEVAL_QUERY",
        outputDimensionality: DIMENSIONS,
      },
    });

    if (!response?.embeddings?.[0]?.values) {
      throw new Error("Gemini did not return a query embedding");
    }

    return response.embeddings[0].values;
  }
}

export const embeddings = new GeminiEmbeddings();
