import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middleware/validate";
import { contactLimiter } from "../middleware/rateLimiter";
import { requireAuth, requireAdmin, requireCsrf } from "../middleware/auth";
import { sendContactEmail } from "../utils/mailer";

const router = Router();

const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(5000),
});

/**
 * POST /api/contact
 * Public. Rate-limited 5/hour per IP. Stores message + sends email (or
 * logs to console in demo mode, see utils/mailer.ts).
 */
router.post(
  "/",
  contactLimiter,
  validateBody(contactSchema),
  asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    const saved = await prisma.message.create({
      data: { name, email, subject, message },
    });

    await sendContactEmail({ name, email, subject, message });

    res.status(201).json({ success: true, id: saved.id });
  })
);

/**
 * GET /api/contact (admin) - list all messages, newest first
 */
router.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const messages = await prisma.message.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ messages });
  })
);

/**
 * PUT /api/contact/:id/read (admin) - toggle read status
 */
router.put(
  "/:id/read",
  requireAuth,
  requireAdmin,
  requireCsrf,
  asyncHandler(async (req, res) => {
    const existing = await prisma.message.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Message not found." });

    const message = await prisma.message.update({
      where: { id: req.params.id },
      data: { read: !existing.read },
    });
    res.json({ message });
  })
);

/**
 * DELETE /api/contact/:id (admin)
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  requireCsrf,
  asyncHandler(async (req, res) => {
    await prisma.message.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
