import multer from "multer";
import path from "node:path";

const storage = multer.memoryStorage();

const ingest = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

export default ingest;
