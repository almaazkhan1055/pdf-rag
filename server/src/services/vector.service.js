import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "./embedding.service.js";

let vectorStorePromise;

export const getVectorStore = async () => {
  if (!vectorStorePromise) {
    vectorStorePromise = QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
      collectionName: process.env.QDRANT_COLLECTION,
    });
  }

  return vectorStorePromise;
};
export const searchSimilarDocuments = async (query, limit = 5) => {
  if (!query?.trim()) {
    throw new Error("Query is required");
  }
  const vectorStore = await getVectorStore();
  const results = await vectorStore.similaritySearchWithScore(query, limit);
  return results;
};
