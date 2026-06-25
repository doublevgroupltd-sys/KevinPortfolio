import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middleware/validate";
import { requireAuth, requireAdmin, requireCsrf } from "../middleware/auth";

const router = Router();

const experienceSchema = z.object({
  company: z.string().min(1).max(160),
  role: z.string().min(1).max(160),
  logo: z.string().default(""),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().min(1),
  details: z.string().default(""),
  type: z.enum(["work", "education"]).default("work"),
});

/**
 * GET /api/experience
 * Public, ordered chronologically (newest first by start date, then manual order).
 */
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const experience = await prisma.experience.findMany({
      orderBy: [{ order: "asc" }, { startDate: "desc" }],
    });
    res.json({ experience });
  })
);

/**
 * POST /api/experience (admin)
 */
router.post(
  "/",
  requireAuth,
  requireAdmin,
  requireCsrf,
  validateBody(experienceSchema),
  asyncHandler(async (req, res) => {
    const data = req.body;
    const maxOrder = await prisma.experience.aggregate({ _max: { order: true } });
    const experience = await prisma.experience.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    });
    res.status(201).json({ experience });
  })
);

/**
 * PUT /api/experience/:id (admin)
 */
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  requireCsrf,
  validateBody(experienceSchema.partial()),
  asyncHandler(async (req, res) => {
    const data: Record<string, unknown> = { ...req.body };
    if (data.startDate) data.startDate = new Date(data.startDate as string);
    if (data.endDate) data.endDate = new Date(data.endDate as string);

    const experience = await prisma.experience.update({ where: { id: req.params.id }, data });
    res.json({ experience });
  })
);

/**
 * DELETE /api/experience/:id (admin)
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  requireCsrf,
  asyncHandler(async (req, res) => {
    await prisma.experience.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
