import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middleware/validate";
import { requireAuth, requireAdmin, requireCsrf } from "../middleware/auth";

const router = Router();

const settingsSchema = z.object({
  siteName: z.string().min(1).max(120).optional(),
  tagline: z.string().max(200).optional(),
  bio: z.string().max(4000).optional(),
  funFacts: z.array(z.string()).optional(),
  profilePhoto: z.string().optional(),
  resumeUrl: z.string().optional(),
  yearsExperience: z.number().min(0).max(80).optional(),
  projectsCompleted: z.number().min(0).optional(),
  clientsServed: z.number().min(0).optional(),
  linesOfCode: z.number().min(0).optional(),
  githubUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  dribbbleUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  email: z.string().optional(),
  defaultTheme: z.enum(["light", "dark", "system"]).optional(),
});

/**
 * GET /api/settings
 * Public - site-wide settings consumed by the public portfolio.
 */
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const settings = await prisma.settings.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    });
    res.json({ settings });
  })
);

/**
 * PUT /api/settings (admin)
 */
router.put(
  "/",
  requireAuth,
  requireAdmin,
  requireCsrf,
  validateBody(settingsSchema),
  asyncHandler(async (req, res) => {
    const settings = await prisma.settings.upsert({
      where: { id: "singleton" },
      update: req.body,
      create: { id: "singleton", ...req.body },
    });
    res.json({ settings });
  })
);

export default router;
