import { PDFParse } from "pdf-parse";

export const extractPdfText = async (fileUrl) => {
  if (!fileUrl) {
    throw new Error("PDF file URL is required");
  }

  console.log("Downloading PDF from:", fileUrl);

  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to download PDF: ${response.status} ${response.statusText}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();

  const pdfBuffer = Buffer.from(arrayBuffer);

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
