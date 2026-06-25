import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { Request } from "express";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "public/uploads";
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 2);

const absoluteUploadDir = path.join(process.cwd(), UPLOAD_DIR);
if (!fs.existsSync(absoluteUploadDir)) {
  fs.mkdirSync(absoluteUploadDir, { recursive: true });
}

/**
 * ---------------------------------------------------------------------
 * STORAGE BACKEND
 * ---------------------------------------------------------------------
 * This is the ONLY place that needs to change to move from local disk
 * storage to a cloud provider.
 *
 * To use AWS S3:
 *   import multerS3 from "multer-s3";
 *   import { S3Client } from "@aws-sdk/client-s3";
 *   const s3 = new S3Client({ region: process.env.AWS_REGION });
 *   export const storage = multerS3({
 *     s3,
 *     bucket: process.env.AWS_S3_BUCKET!,
 *     key: (req, file, cb) => cb(null, `uploads/${Date.now()}-${file.originalname}`),
 *   });
 *
 * To use Cloudinary:
 *   import { CloudinaryStorage } from "multer-storage-cloudinary";
 *   import cloudinary from "../utils/cloudinary";
 *   export const storage = new CloudinaryStorage({ cloudinary, params: { folder: "portfolio" } });
 * ---------------------------------------------------------------------
 */
export const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, absoluteUploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const hash = crypto.randomBytes(8).toString("hex");
    cb(null, `${Date.now()}-${hash}${ext}`);
  },
});

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new Error("Unsupported file type. Use JPEG, PNG, WebP, GIF, or PDF."));
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
});

export function publicUrlForFile(filename: string): string {
  return `/uploads/${filename}`;
}
