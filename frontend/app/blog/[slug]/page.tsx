import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Twitter, Linkedin, Link as LinkIcon } from "lucide-react";
import { apiFetch, apiAssetUrl } from "@/lib/api";
import { Post } from "@/lib/types";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function getPost(slug: string): Promise<Post | null> {
  try {
    const { post } = await apiFetch<{ post: Post }>(`/blog/${slug}`, { revalidate: 300 });
    return post;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const { posts } = await apiFetch<{ posts: Post[] }>("/blog?limit=100");
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [apiAssetUrl(post.featuredImage)] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

function readingTime(content: string) {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;

  return (
    <article className="pt-32">
      <div className="container-luxury max-w-3xl">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to blog
        </Link>

        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wide">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="mt-6 font-display text-display-2 font-semibold tracking-tight">{post.title}</h1>

        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
          <span aria-hidden="true">·</span>
          <span>{readingTime(post.content)} min read</span>
        </div>

        {post.featuredImage && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-xl2 bg-muted">
            <Image src={apiAssetUrl(post.featuredImage)} alt="" fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
          </div>
        )}

        <div className="prose-luxury mt-12" dangerouslySetInnerHTML={{ __html: post.content }} />

        <div className="mt-16 flex items-center gap-3 border-t border-border pt-10">
          <span className="text-sm font-medium text-muted-foreground">Share:</span>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Twitter"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-muted"
          >
            <Twitter className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on LinkedIn"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-muted"
          >
            <Linkedin className="h-4 w-4" aria-hidden="true" />
          </a>
          <span
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm text-muted-foreground"
            aria-hidden="true"
          >
            <LinkIcon className="h-4 w-4" />
            {url}
          </span>
        </div>
      </div>
    </article>
  );
}
