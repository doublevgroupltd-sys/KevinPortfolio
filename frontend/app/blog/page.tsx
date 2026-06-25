import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { apiFetch, apiAssetUrl } from "@/lib/api";
import { Post } from "@/lib/types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing on engineering, design systems, and building products.",
};

function readingTime(content: string) {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function BlogPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Number(searchParams.page) || 1;
  const { posts, totalPages } = await apiFetch<{ posts: Post[]; totalPages: number }>(
    `/blog?page=${page}&limit=6`,
    { revalidate: 300 }
  );

  return (
    <div className="container-luxury section-padding pt-32">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Writing</p>
      <h1 className="mt-4 font-display text-display-1 font-semibold tracking-tight">Blog</h1>

      {posts.length === 0 ? (
        <p className="mt-16 text-muted-foreground">No posts published yet — check back soon.</p>
      ) : (
        <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl2 bg-muted">
                {post.featuredImage && (
                  <Image
                    src={apiAssetUrl(post.featuredImage)}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
              </div>
              <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {readingTime(post.content)} min read
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold leading-snug group-hover:underline">
                {post.title}
              </h2>
              <p className="mt-2 text-muted-foreground line-clamp-2">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Blog pagination" className="mt-16 flex justify-center gap-3">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Link
              key={i}
              href={`/blog?page=${i + 1}`}
              aria-current={page === i + 1 ? "page" : undefined}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border text-sm font-medium ${
                page === i + 1 ? "border-accent bg-accent text-accent-foreground" : "border-border hover:bg-muted"
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
