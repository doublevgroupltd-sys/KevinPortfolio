import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../utils/jwt";

const COOKIE_NAME = process.env.COOKIE_NAME || "portfolio_token";

export interface AuthedRequest extends Request {
  user?: TokenPayload;
}

/**
 * Requires a valid JWT in the HTTP-only cookie. Attaches decoded payload
 * to req.user on success; responds 401 on missing/invalid token.
 */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  try {
    const payload = verifyToken(token);
    // Normalize role to uppercase so all guards use a consistent format
    payload.role = payload.role.toUpperCase();
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Session expired or invalid. Please log in again." });
  }
}

/**
 * Requires the authenticated user to have the admin role.
 * Always used after requireAuth.
 */
export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required." });
  }
  return next();
}

/**
 * Verifies the X-CSRF-Token header against the value stored in the
 * non-httpOnly csrf cookie. Required on all mutating admin requests.
 */
export function requireCsrf(req: Request, res: Response, next: NextFunction) {
  const headerToken = req.headers["x-csrf-token"];
  const cookieToken = req.cookies?.["csrf_token"];

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({ error: "Invalid or missing CSRF token." });
  }
  return next();
}