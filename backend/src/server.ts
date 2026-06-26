import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";
import skillRoutes from "./routes/skills";
import bannerRoutes from "./routes/banners";
import testimonialRoutes from "./routes/testimonials";
import blogRoutes from "./routes/blog";
import contactRoutes from "./routes/contact";
import settingsRoutes from "./routes/settings";
import experienceRoutes from "./routes/experience";
import uploadRoutes from "./routes/upload";
import dashboardRoutes from "./routes/dashboard";

import { generalApiLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 4000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || "public/uploads";

// Allowed origins – add your production Vercel domain and keep localhost for dev
const allowedOrigins = [
  process.env.CORS_ORIGIN,        // production (e.g., https://...vercel.app)
  "http://localhost:3000",        // local development
].filter(Boolean);                // removes any undefined values

/**
 * Security headers. CSP is intentionally permissive for img-src/data: to
 * support local-disk uploads and inline blur placeholders; tighten this
 * if you move all media to a CDN.
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", ...allowedOrigins],   // allow API calls from these origins
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Dynamic CORS – returns the exact requesting origin if allowed, never "*"
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,   // allow cookies / authorization headers
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(generalApiLimiter);

// Static file serving for uploaded images/PDFs.
app.use("/uploads", express.static(path.join(process.cwd(), UPLOAD_DIR)));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Portfolio API listening on http://localhost:${PORT}`);
  console.log(`   Allowed CORS origins: ${allowedOrigins.join(", ")}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;