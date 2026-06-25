import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Github, ArrowLeft } from "lucide-react";
import { apiFetch, apiAssetUrl } from "@/lib/api";
import { Project } from "@/lib/types";

export const revalidate = 300;

async function getProject(slug: string): Promise<Project | null> {
  try {
    const { project } = await apiFetch<{ project: Project }>(`/projects/${slug}`, { revalidate: 300 });
    return project;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const { projects } = await apiFetch<{ projects: Project[] }>("/projects");
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await getProject(params.slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: project.title,
    description: project.shortDesc,
    openGraph: { images: [apiAssetUrl(project.thumbnail)] },
  };
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = await getProject(params.slug);
  if (!project) notFound();

  return (
    <article className="pt-20">
      <div className="relative h-[50vh] w-full sm:h-[65vh]">
        <Image src={apiAssetUrl(project.thumbnail)} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" aria-hidden="true" />
        <div className="container-luxury absolute inset-x-0 bottom-0 pb-12 text-white">
          <Link href="/work" className="inline-flex items-center gap-2 text-sm font-medium text-white/80">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to work
          </Link>
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-white/70">{project.category}</p>
          <h1 className="mt-2 font-display text-display-2 font-semibold">{project.title}</h1>
        </div>
      </div>

      <div className="container-luxury section-padding grid gap-16 lg:grid-cols-[1fr_320px]">
        <div className="prose-luxury" dangerouslySetInnerHTML={{ __html: project.caseStudy }} />

        <aside className="space-y-8 lg:border-l lg:border-border lg:pl-10">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Role</h2>
            <p className="mt-1 font-medium">{project.role || "—"}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Timeline</h2>
            <p className="mt-1 font-medium">{project.timeline || "—"}</p>
          </div>
          {project.challenges && (
            <div>
              <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Challenges</h2>
              <p className="mt-1 text-muted-foreground">{project.challenges}</p>
            </div>
          )}
          {project.solution && (
            <div>
              <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Solution</h2>
              <p className="mt-1 text-muted-foreground">{project.solution}</p>
            </div>
          )}
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Tech Stack</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {project.techStack.map((t) => (
                <span key={t} className="rounded-full bg-muted px-3 py-1 text-sm">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 font-medium text-accent-foreground"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" /> Live Demo
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3.5 font-medium hover:bg-muted"
              >
                <Github className="h-4 w-4" aria-hidden="true" /> View Code
              </a>
            )}
          </div>
        </aside>
      </div>

      {project.gallery.length > 0 && (
        <div className="container-luxury pb-24">
          <h2 className="mb-8 font-display text-2xl font-semibold">Gallery</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {project.gallery.map((src, i) => (
              <div key={i} className="relative aspect-[16/10] overflow-hidden rounded-xl2 bg-muted">
                <Image src={apiAssetUrl(src)} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
