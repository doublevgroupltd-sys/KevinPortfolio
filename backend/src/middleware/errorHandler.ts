import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/asyncHandler";
import { MulterError } from "multer";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Prisma unique constraint, etc.
  if (typeof err === "object" && err !== null && "code" in err) {
    const prismaErr = err as { code?: string; meta?: { target?: string[] } };
    if (prismaErr.code === "P2002") {
      return res.status(409).json({
        error: `A record with this ${prismaErr.meta?.target?.join(", ") || "value"} already exists.`,
      });
    }
    if (prismaErr.code === "P2025") {
      return res.status(404).json({ error: "Record not found." });
    }
  }

  console.error("[Unhandled Error]", err);
  return res.status(500).json({ error: "Internal server error." });
}
