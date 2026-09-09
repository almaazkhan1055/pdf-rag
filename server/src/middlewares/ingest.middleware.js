import multer from "multer";
import path from "node:path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve("ingest"));
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const ingest = multer({
  storage,
});

export default ingest;
