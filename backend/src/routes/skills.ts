import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middleware/validate";
import { requireAuth, requireAdmin, requireCsrf } from "../middleware/auth";

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1).max(80),
});

const skillSchema = z.object({
  name: z.string().min(1).max(80),
  icon: z.string().default(""),
  level: z.number().min(0).max(100).default(50),
  description: z.string().default(""),
  categoryId: z.string().uuid(),
});

/**
 * GET /api/skills
 * Public: returns categories with nested skills, ordered.
 */
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const categories = await prisma.skillCategory.findMany({
      orderBy: { order: "asc" },
      include: { skills: { orderBy: { order: "asc" } } },
    });
    res.json({ categories });
  })
);

/**
 * POST /api/skills/categories (admin)
 */
router.post(
  "/categories",
  requireAuth,
  requireAdmin,
  requireCsrf,
  validateBody(categorySchema),
  asyncHandler(async (req, res) => {
    const maxOrder = await prisma.skillCategory.aggregate({ _max: { order: true } });
    const category = await prisma.skillCategory.create({
      data: { name: req.body.name, order: (maxOrder._max.order ?? 0) + 1 },
    });
    res.status(201).json({ category });
  })
);

/**
 * PUT /api/skills/categories/:id (admin)
 */
router.put(
  "/categories/:id",
  requireAuth,
  requireAdmin,
  requireCsrf,
  validateBody(categorySchema.partial()),
  asyncHandler(async (req, res) => {
    const category = await prisma.skillCategory.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ category });
  })
);

/**
 * DELETE /api/skills/categories/:id (admin)
 */
router.delete(
  "/categories/:id",
  requireAuth,
  requireAdmin,
  requireCsrf,
  asyncHandler(async (req, res) => {
    await prisma.skillCategory.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

/**
 * POST /api/skills/categories/reorder (admin)
 * body: { order: [{ id, order }, ...] }
 */
router.post(
  "/categories/reorder",
  requireAuth,
  requireAdmin,
  requireCsrf,
  asyncHandler(async (req, res) => {
    const items: { id: string; order: number }[] = req.body.order || [];
    await prisma.$transaction(
      items.map((item) =>
        prisma.skillCategory.update({ where: { id: item.id }, data: { order: item.order } })
      )
    );
    res.json({ success: true });
  })
);

/**
 * POST /api/skills (admin) - create individual skill
 */
router.post(
  "/",
  requireAuth,
  requireAdmin,
  requireCsrf,
  validateBody(skillSchema),
  asyncHandler(async (req, res) => {
    const maxOrder = await prisma.skill.aggregate({
      _max: { order: true },
      where: { categoryId: req.body.categoryId },
    });
    const skill = await prisma.skill.create({
      data: { ...req.body, order: (maxOrder._max.order ?? 0) + 1 },
    });
    res.status(201).json({ skill });
  })
);

/**
 * PUT /api/skills/:id (admin)
 */
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  requireCsrf,
  validateBody(skillSchema.partial()),
  asyncHandler(async (req, res) => {
    const skill = await prisma.skill.update({ where: { id: req.params.id }, data: req.body });
    res.json({ skill });
  })
);

/**
 * DELETE /api/skills/:id (admin)
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  requireCsrf,
  asyncHandler(async (req, res) => {
    await prisma.skill.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

/**
 * POST /api/skills/reorder (admin)
 * body: { order: [{ id, order }, ...] }
 */
router.post(
  "/reorder",
  requireAuth,
  requireAdmin,
  requireCsrf,
  asyncHandler(async (req, res) => {
    const items: { id: string; order: number }[] = req.body.order || [];
    await prisma.$transaction(
      items.map((item) => prisma.skill.update({ where: { id: item.id }, data: { order: item.order } }))
    );
    res.json({ success: true });
  })
);

export default router;
