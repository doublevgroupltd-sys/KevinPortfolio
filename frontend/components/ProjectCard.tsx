import Image from "next/image";
import Link from "next/link";
import { Project } from "@/lib/types";
import { apiAssetUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-xl2 bg-muted",
        featured ? "md:col-span-2" : ""
      )}
    >
      <div className={cn("relative w-full overflow-hidden", featured ? "aspect-[16/8]" : "aspect-[4/3]")}>
        <Image
          src={apiAssetUrl(project.thumbnail)}
          alt=""
          fill
          sizes={featured ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />

        <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-9">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/70">{project.category}</p>
          <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{project.title}</h3>
          <p className="mt-2 max-w-md text-sm text-white/80 line-clamp-2">{project.shortDesc}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
