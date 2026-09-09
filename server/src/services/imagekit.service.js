import ImageKit from "imagekit";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const uploadPdf = async (file) => {
  if (!file?.buffer) {
    throw new Error("PDF file buffer is required");
  }

  const result = await imagekit.upload({
    file: file.buffer,
    fileName: `${Date.now()}-${file.originalname}`,
    folder: "/pdf-rag",
    useUniqueFileName: true,
  });

  return {
    fileId: result.fileId,
    filePath: result.filePath,
    url: result.url,
    name: result.name,
    size: result.size,
  };
};
