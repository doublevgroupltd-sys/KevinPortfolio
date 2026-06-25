import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { signToken } from "../utils/jwt";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middleware/validate";
import { loginLimiter } from "../middleware/rateLimiter";
import { requireAuth, requireCsrf, AuthedRequest } from "../middleware/auth";

const router = Router();

const COOKIE_NAME = process.env.COOKIE_NAME || "portfolio_token";
const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * GET /api/auth/csrf
 * Issues a CSRF token cookie (readable by JS) that the frontend echoes
 * back in the X-CSRF-Token header on mutating requests.
 */
router.get("/csrf", (req, res) => {
  const token = crypto.randomBytes(24).toString("hex");
  res.cookie("csrf_token", token, {
    httpOnly: false,
    secure: isProd,
    sameSite: "strict",
    path: "/",
  });
  res.json({ csrfToken: token });
});

/**
 * POST /api/auth/login
 */
router.post(
  "/login",
  loginLimiter,
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.cookie(COOKIE_NAME, token, cookieOptions);

    return res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  })
);

/**
 * POST /api/auth/logout
 */
router.post("/logout", requireAuth, requireCsrf, (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ success: true });
});

/**
 * GET /api/auth/me
 */
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  })
);

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

/**
 * POST /api/auth/change-password
 */
router.post(
  "/change-password",
  requireAuth,
  requireCsrf,
  validateBody(changePasswordSchema),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) return res.status(404).json({ error: "User not found." });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect." });

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    return res.json({ success: true });
  })
);

export default router;
