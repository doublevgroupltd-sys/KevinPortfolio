import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Post } from "@/lib/types";
import { apiAssetUrl } from "@/lib/api";

function readingTime(content: string) {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function BlogPreview({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section id="blog" className="section-padding container-luxury">
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Writing</p>
          <h2 className="mt-4 font-display text-display-2 font-semibold tracking-tight">
            From the blog
          </h2>
        </div>
        <Link href="/blog" className="inline-flex items-center gap-2 font-medium underline">
          View all posts <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {posts.slice(0, 3).map((post) => (
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
            <h3 className="mt-2 font-display text-xl font-semibold leading-snug group-hover:underline">
              {post.title}
            </h3>
            <p className="mt-2 text-muted-foreground line-clamp-2">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
