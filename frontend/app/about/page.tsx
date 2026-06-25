import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import { Settings, Experience } from "@/lib/types";
import { About } from "@/components/About";
import { Timeline } from "@/components/Timeline";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about my background, experience, and approach to building products.",
};

export default async function AboutPage() {
  const [{ settings }, { experience }] = await Promise.all([
    apiFetch<{ settings: Settings }>("/settings", { cache: 'no-store' }),
    apiFetch<{ experience: Experience[] }>("/experience", { cache: 'no-store' }),
  ]);

  return (
    <div className="pt-20">
      <About settings={settings} />
      <Timeline items={experience} />
    </div>
  );
}