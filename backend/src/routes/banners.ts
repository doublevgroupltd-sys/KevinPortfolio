import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middleware/validate";
import { requireAuth, requireAdmin, requireCsrf } from "../middleware/auth";

const router = Router();

const bannerSchema = z.object({
  image: z.string().min(1),
  headline: z.string().min(2).max(160),
  subtext: z.string().default(""),
  ctaText: z.string().default("Learn More"),
  ctaLink: z.string().default("#"),
  active: z.boolean().default(true),
});

/**
 * GET /api/banners
 * Public: active banners only, ordered.
 */
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const banners = await prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    res.json({ banners });
  })
);

/**
 * GET /api/banners/all (admin) - includes inactive banners
 */
router.get(
  "/all",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const banners = await prisma.banner.findMany({ orderBy: { order: "asc" } });
    res.json({ banners });
  })
);

/**
 * POST /api/banners (admin)
 */
router.post(
  "/",
  requireAuth,
  requireAdmin,
  requireCsrf,
  validateBody(bannerSchema),
  asyncHandler(async (req, res) => {
    const maxOrder = await prisma.banner.aggregate({ _max: { order: true } });
    const banner = await prisma.banner.create({
      data: { ...req.body, order: (maxOrder._max.order ?? 0) + 1 },
    });
    res.status(201).json({ banner });
  })
);

/**
 * PUT /api/banners/:id (admin)
 */
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  requireCsrf,
  validateBody(bannerSchema.partial()),
  asyncHandler(async (req, res) => {
    const banner = await prisma.banner.update({ where: { id: req.params.id }, data: req.body });
    res.json({ banner });
  })
);

/**
 * DELETE /api/banners/:id (admin)
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  requireCsrf,
  asyncHandler(async (req, res) => {
    await prisma.banner.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

/**
 * POST /api/banners/reorder (admin)
 */
router.post(
  "/reorder",
  requireAuth,
  requireAdmin,
  requireCsrf,
  asyncHandler(async (req, res) => {
    const items: { id: string; order: number }[] = req.body.order || [];
    await prisma.$transaction(
      items.map((item) => prisma.banner.update({ where: { id: item.id }, data: { order: item.order } }))
    );
    res.json({ success: true });
  })
);

export default router;
