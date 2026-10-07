import { Router } from "express";
import { authMiddleware } from "../../core/middleware";
import { 
  getDocuments, 
  createDocument, 
  getDocumentShares, 
  shareDocument, 
  removeShare, 
  deleteDocument
} from "./documents.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getDocuments);
router.post("/", createDocument);
router.get("/:id/shares", getDocumentShares);
router.post("/:id/share", shareDocument);
router.delete("/:id/share", removeShare);
router.delete("/:id", deleteDocument);

export default router;
