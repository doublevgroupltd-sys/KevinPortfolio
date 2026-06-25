"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Experience } from "@/lib/types";
import { apiAssetUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

function formatRange(exp: Experience) {
  const start = new Date(exp.startDate).getFullYear();
  const end = exp.current ? "Present" : exp.endDate ? new Date(exp.endDate).getFullYear() : "";
  return end ? `${start} — ${end}` : `${start}`;
}

export function Timeline({ items }: { items: Experience[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section id="experience" className="section-padding container-luxury">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Journey</p>
      <h2 className="mt-4 font-display text-display-2 font-semibold tracking-tight">
        Experience &amp; Education
      </h2>

      <ol className="mt-16 space-y-10 border-l border-border pl-8 md:space-y-14 md:pl-0 md:border-l-0">
        {items.map((exp, i) => {
          const isOpen = expanded === exp.id;
          return (
            <li
              key={exp.id}
              className={cn(
                "relative md:grid md:grid-cols-[1fr_auto_1fr] md:items-start md:gap-8",
                i % 2 === 1 && "md:[direction:rtl]"
              )}
            >
              <div
                className={cn(
                  "rounded-xl2 border border-border bg-card p-7",
                  i % 2 === 1 && "md:[direction:ltr]"
                )}
              >
                <div className="flex items-center gap-4">
                  {exp.logo && (
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image src={apiAssetUrl(exp.logo)} alt="" fill className="object-contain p-1" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-display text-xl font-semibold">{exp.role}</h3>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gold">
                  {formatRange(exp)} · {exp.type === "work" ? "Work" : "Education"}
                </p>
                <p className="mt-4 text-muted-foreground">{exp.description}</p>

                {exp.details && (
                  <>
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : exp.id)}
                      aria-expanded={isOpen}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground underline"
                    >
                      {isOpen ? "Show less" : "Show more"}
                      <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
                    </button>
                    {isOpen && <p className="mt-3 text-sm text-muted-foreground">{exp.details}</p>}
                  </>
                )}
              </div>

              <div className="hidden md:flex md:items-center md:justify-center">
                <span className="h-3 w-3 rounded-full bg-gold ring-4 ring-background" aria-hidden="true" />
              </div>
              <div className="hidden md:block" />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
