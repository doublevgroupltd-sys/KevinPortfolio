import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import { Project } from "@/lib/types";
import { WorkGrid } from "@/components/WorkGrid";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Work",
  description: "A selection of projects spanning web apps, mobile, design, and open source.",
};

export default async function WorkPage() {
  const { projects } = await apiFetch<{ projects: Project[] }>("/projects", { cache: 'no-store' });

  return (
    <div className="pt-20">
      <div className="container-luxury pt-20">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Portfolio</p>
        <h1 className="mt-4 font-display text-display-1 font-semibold tracking-tight">Selected Work</h1>
      </div>
      <WorkGrid projects={projects} showHeading={false} />
    </div>
  );
}