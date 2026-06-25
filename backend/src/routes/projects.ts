import { Router } from "express";
import { z } from "zod";
import slugify from "slugify";
import sanitizeHtml from "sanitize-html";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middleware/validate";
import { requireAuth, requireAdmin, requireCsrf } from "../middleware/auth";

const router = Router();

const projectSchema = z.object({
  title: z.string().min(2).max(160),
  category: z.enum(["Web Apps", "Mobile", "Design", "Open Source"]),
  thumbnail: z.string().min(1),
  gallery: z.array(z.string()).default([]),
  shortDesc: z.string().min(10).max(280),
  caseStudy: z.string().min(10),
  role: z.string().default(""),
  timeline: z.string().default(""),
  challenges: z.string().default(""),
  solution: z.string().default(""),
  techStack: z.array(z.string()).default([]),
  liveUrl: z.string().url().or(z.literal("")).default(""),
  githubUrl: z.string().url().or(z.literal("")).default(""),
  completedAt: z.string().optional(),
  featured: z.boolean().default(false),
});

function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "iframe"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder"],
    },
  });
}

/**
 * GET /api/projects
 * Public list, optional ?category= filter.
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { category } = req.query;
    const where = category && category !== "All" ? { category: String(category) } : {};
    const projects = await prisma.project.findMany({
      where,
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    });
    res.json({ projects });
  })
);

/**
 * GET /api/projects/:slug
 */
router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({ where: { slug: req.params.slug } });
    if (!project) return res.status(404).json({ error: "Project not found." });
    res.json({ project });
  })
);

/**
 * POST /api/projects (admin)
 */
router.post(
  "/",
  requireAuth,
  requireAdmin,
  requireCsrf,
  validateBody(projectSchema),
  asyncHandler(async (req, res) => {
    const data = req.body;
    const baseSlug = slugify(data.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.project.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const maxOrder = await prisma.project.aggregate({ _max: { order: true } });

    const project = await prisma.project.create({
      data: {
        ...data,
        caseStudy: sanitizeRichText(data.caseStudy),
        slug,
        completedAt: data.completedAt ? new Date(data.completedAt) : null,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    });

    res.status(201).json({ project });
  })
);

/**
 * PUT /api/projects/:id (admin)
 */
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  requireCsrf,
  validateBody(projectSchema.partial()),
  asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.caseStudy) data.caseStudy = sanitizeRichText(data.caseStudy);
    if (data.completedAt) data.completedAt = new Date(data.completedAt);

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ project });
  })
);

/**
 * DELETE /api/projects/:id (admin)
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  requireCsrf,
  asyncHandler(async (req, res) => {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

/**
 * POST /api/projects/reorder (admin)
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
      items.map((item) =>
        prisma.project.update({ where: { id: item.id }, data: { order: item.order } })
      )
    );
    res.json({ success: true });
  })
);

export default router;
