import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import { Settings, Experience } from "@/lib/types";
import { About } from "@/components/About";
import { Timeline } from "@/components/Timeline";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about my background, experience, and approach to building products.",
};

export default async function AboutPage() {
  const [{ settings }, { experience }] = await Promise.all([
    apiFetch<{ settings: Settings }>("/settings", { revalidate: 300 }),
    apiFetch<{ experience: Experience[] }>("/experience", { revalidate: 300 }),
  ]);

  return (
    <div className="pt-20">
      <About settings={settings} />
      <Timeline items={experience} />
    </div>
  );
}
