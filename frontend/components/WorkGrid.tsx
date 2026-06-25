"use client";

import { useState, useMemo } from "react";
import { Project } from "@/lib/types";
import { ProjectCard } from "./ProjectCard";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Web Apps", "Mobile", "Design", "Open Source"];

export function WorkGrid({ projects, showHeading = true }: { projects: Project[]; showHeading?: boolean }) {
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.category === filter)),
    [projects, filter]
  );

  return (
    <section id="work" className="section-padding container-luxury">
      {showHeading && (
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Selected Work</p>
            <h2 className="mt-4 font-display text-display-2 font-semibold tracking-tight">
              Things I&apos;ve built
            </h2>
          </div>
        </div>
      )}

      <div className="mb-10 flex flex-wrap gap-3" role="group" aria-label="Filter projects by category">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            aria-pressed={filter === cat}
            className={cn(
              "rounded-full border px-5 py-2.5 text-sm font-medium transition-colors",
              filter === cat
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">No projects in this category yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} featured={i === 0 && filter === "All"} />
          ))}
        </div>
      )}
    </section>
  );
}
