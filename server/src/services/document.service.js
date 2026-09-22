import { PDFParse } from "pdf-parse";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const downloadPdfWithRetry = async (fileUrl) => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(
        `Downloading PDF - attempt ${attempt}/${MAX_RETRIES}:`,
        fileUrl,
      );

      const response = await fetch(fileUrl);

      console.log("PDF response status:", response.status);
      console.log(
        "PDF response content-type:",
        response.headers.get("content-type"),
      );

      if (!response.ok) {
        throw new Error(
          `Failed to download PDF: ${response.status} ${response.statusText}`,
        );
      }

      const arrayBuffer = await response.arrayBuffer();

      console.log(
        "PDF downloaded successfully:",
        arrayBuffer.byteLength,
        "bytes",
      );

      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error(`PDF download attempt ${attempt} failed`);
      console.error("Error:", error);
      console.error("Message:", error?.message);
      console.error("Cause:", error?.cause);
      console.error("Cause code:", error?.cause?.code);
      console.error("Cause message:", error?.cause?.message);

      if (attempt === MAX_RETRIES) {
        throw error;
      }

      const delay = INITIAL_RETRY_DELAY_MS * attempt;

      console.log(`Retrying PDF download in ${delay / 1000} seconds...`);

      await sleep(delay);
    }
  }

  throw new Error("Failed to download PDF");
};

export const extractPdfText = async (fileUrl) => {
  if (!fileUrl) {
    throw new Error("PDF file URL is required");
  }

  console.log("Starting PDF extraction");
  console.log("PDF URL:", fileUrl);

  const pdfBuffer = await downloadPdfWithRetry(fileUrl);

  console.log("Starting PDF parsing");

  const parser = new PDFParse({
    data: pdfBuffer,
  });

  try {
    const result = await parser.getText();

    console.log("PDF parsing completed");
    console.log("Pages:", result.total);
    console.log("Extracted text length:", result.text?.length || 0);

    return {
      text: result.text,
      pages: result.total,
    };
  } finally {
    await parser.destroy();
  }
};
