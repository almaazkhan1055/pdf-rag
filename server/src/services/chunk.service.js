import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

export const createChunks = async (text, metadata = {}) => {
  if (!text?.trim()) {
    return [];
  }

  const documents = await splitter.createDocuments([text], [metadata]);

  return documents.map((document, index) => ({
    ...document,
    metadata: {
      ...document.metadata,
      chunkIndex: index,
    },
  }));
};
