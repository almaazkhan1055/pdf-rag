import { Router } from "express";
import {
  getDocument,
  listDocuments,
} from "../controllers/document.controller.js";

const router = Router();

router.get("/documents", listDocuments);
router.get("/documents/:id", getDocument);

export default router;
