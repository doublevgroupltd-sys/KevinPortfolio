import { MetadataRoute } from "next";
import { apiFetch } from "@/lib/api";
import { Project, Post } from "@/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), priority: 1 },
    { url: `${SITE_URL}/work`, lastModified: new Date(), priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), priority: 0.7 },
  ];

  try {
    const [{ projects }, { posts }] = await Promise.all([
      apiFetch<{ projects: Project[] }>("/projects"),
      apiFetch<{ posts: Post[] }>("/blog?limit=100"),
    ]);

    const projectRoutes = projects.map((p) => ({
      url: `${SITE_URL}/work/${p.slug}`,
      lastModified: new Date(p.updatedAt ?? Date.now()),
      priority: 0.6,
    }));

    const postRoutes = posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.publishedAt ?? Date.now()),
      priority: 0.5,
    }));

    return [...staticRoutes, ...projectRoutes, ...postRoutes];
  } catch {
    return staticRoutes;
  }
}
