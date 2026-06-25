import { Router } from "express";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

/**
 * GET /api/dashboard/stats (admin)
 */
router.get(
  "/stats",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const [projects, posts, testimonials, banners, unreadMessages, totalMessages] = await Promise.all([
      prisma.project.count(),
      prisma.post.count(),
      prisma.testimonial.count(),
      prisma.banner.count(),
      prisma.message.count({ where: { read: false } }),
      prisma.message.count(),
    ]);

    const recentMessages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    res.json({
      stats: { projects, posts, testimonials, banners, unreadMessages, totalMessages },
      recentMessages,
    });
  })
);

export default router;
