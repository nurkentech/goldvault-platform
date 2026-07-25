/**
 * File upload route for KYC documents and other user uploads.
 * Accepts multipart/form-data with a single "file" field.
 * Stores the file in S3 via storagePut and returns the URL.
 */
import { Router, Request, Response } from "express";
import multer from "multer";
import { storagePut } from "./storage";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Allowed: JPG, PNG, WebP, GIF, PDF"));
    }
  },
});

const uploadRouter = Router();

uploadRouter.post("/api/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    const ext = req.file.originalname.split(".").pop() || "bin";
    const key = `kyc/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);

    res.json({ url, key });
  } catch (err: any) {
    console.error("[Upload Error]", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

export { uploadRouter };
