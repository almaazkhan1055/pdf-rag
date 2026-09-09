import fs from "node:fs/promises";
import { PDFParse } from "pdf-parse";

export const extractPdfText = async (filePath) => {
  if (!filePath) {
    throw new Error("PDF file path is required");
  }
  const pdfBuffer = await fs.readFile(filePath);
  const parser = new PDFParse({
    data: pdfBuffer,
  });

  try {
    const result = await parser.getText();
    return {
      text: result.text,
      pages: result.total,
    };
  } finally {
    await parser.destroy();
  }
};
