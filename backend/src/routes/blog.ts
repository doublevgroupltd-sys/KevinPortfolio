import { Router } from "express";
import { z } from "zod";
import slugify from "slugify";
import sanitizeHtml from "sanitize-html";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middleware/validate";
import { requireAuth, requireAdmin, requireCsrf } from "../middleware/auth";

const router = Router();

const postSchema = z.object({
  title: z.string().min(2).max(160),
  featuredImage: z.string().default(""),
  excerpt: z.string().max(400).default(""),
  content: z.string().min(10),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
});

function sanitizeMarkdownHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "pre", "code"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height"],
      code: ["class"],
    },
  });
}

/**
 * GET /api/blog?page=1&limit=6
 * Public: published posts only, paginated.
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(20, Number(req.query.limit) || 6);
    const skip = (page - 1) * limit;

    const where = { status: "published" as const };
    const [posts, total] = await Promise.all([
      prisma.post.findMany({ where, orderBy: { publishedAt: "desc" }, skip, take: limit }),
      prisma.post.count({ where }),
    ]);

    res.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
  })
);

/**
 * GET /api/blog/:slug
 */
router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const post = await prisma.post.findUnique({ where: { slug: req.params.slug } });
    if (!post || post.status !== "published") {
      return res.status(404).json({ error: "Post not found." });
    }
    res.json({ post });
  })
);

/**
 * GET /api/blog/admin/all (admin) - includes drafts
 */
router.get(
  "/admin/all",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ posts });
  })
);

/**
 * POST /api/blog (admin)
 */
router.post(
  "/",
  requireAuth,
  requireAdmin,
  requireCsrf,
  validateBody(postSchema),
  asyncHandler(async (req, res) => {
    const data = req.body;
    const baseSlug = slugify(data.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const post = await prisma.post.create({
      data: {
        ...data,
        content: sanitizeMarkdownHtml(data.content),
        slug,
        publishedAt: data.status === "published" ? new Date() : null,
      },
    });

    res.status(201).json({ post });
  })
);

/**
 * PUT /api/blog/:id (admin)
 */
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  requireCsrf,
  validateBody(postSchema.partial()),
  asyncHandler(async (req, res) => {
    const data: Record<string, unknown> = { ...req.body };
    if (data.content) data.content = sanitizeMarkdownHtml(data.content as string);

    const existing = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (existing && existing.status !== "published" && data.status === "published") {
      data.publishedAt = new Date();
    }

    const post = await prisma.post.update({ where: { id: req.params.id }, data });
    res.json({ post });
  })
);

/**
 * DELETE /api/blog/:id (admin)
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  requireCsrf,
  asyncHandler(async (req, res) => {
    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
