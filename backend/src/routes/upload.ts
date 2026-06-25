import { Router } from "express";
import { upload, publicUrlForFile } from "../middleware/upload";
import { requireAuth, requireAdmin, requireCsrf } from "../middleware/auth";

const router = Router();

/**
 * POST /api/upload (admin)
 * Accepts a single file under field name "file".
 * Returns { url } pointing to the publicly servable path.
 */
router.post(
  "/",
  requireAuth,
  requireAdmin,
  requireCsrf,
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    const url = publicUrlForFile(req.file.filename);
    return res.status(201).json({ url, filename: req.file.filename });
  }
);

export default router;
