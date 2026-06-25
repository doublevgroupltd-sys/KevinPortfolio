import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middleware/validate";
import { requireAuth, requireAdmin, requireCsrf } from "../middleware/auth";

const router = Router();

const testimonialSchema = z.object({
  name: z.string().min(1).max(120),
  title: z.string().default(""),
  photo: z.string().default(""),
  text: z.string().min(5),
  rating: z.number().min(1).max(5).default(5),
  visible: z.boolean().default(true),
});

/**
 * GET /api/testimonials
 * Public: only visible testimonials.
 */
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const testimonials = await prisma.testimonial.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
    });
    res.json({ testimonials });
  })
);

/**
 * GET /api/testimonials/all (admin)
 */
router.get(
  "/all",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
    res.json({ testimonials });
  })
);

/**
 * POST /api/testimonials (admin)
 */
router.post(
  "/",
  requireAuth,
  requireAdmin,
  requireCsrf,
  validateBody(testimonialSchema),
  asyncHandler(async (req, res) => {
    const maxOrder = await prisma.testimonial.aggregate({ _max: { order: true } });
    const testimonial = await prisma.testimonial.create({
      data: { ...req.body, order: (maxOrder._max.order ?? 0) + 1 },
    });
    res.status(201).json({ testimonial });
  })
);

/**
 * PUT /api/testimonials/:id (admin)
 */
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  requireCsrf,
  validateBody(testimonialSchema.partial()),
  asyncHandler(async (req, res) => {
    const testimonial = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ testimonial });
  })
);

/**
 * DELETE /api/testimonials/:id (admin)
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  requireCsrf,
  asyncHandler(async (req, res) => {
    await prisma.testimonial.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
