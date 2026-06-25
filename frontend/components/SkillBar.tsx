"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Skill } from "@/lib/types";

export function SkillBar({ skill }: { skill: Skill }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref}>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 font-medium">
          <span aria-hidden="true">{skill.icon}</span>
          {skill.name}
        </span>
        <span className="text-sm text-muted-foreground">{skill.level}%</span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={skill.level}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${skill.name} proficiency`}
      >
        <motion.div
          className="h-full rounded-full bg-gold"
          initial={{ width: 0 }}
          animate={{ width: inView ? `${skill.level}%` : 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      {skill.description && <p className="mt-1.5 text-sm text-muted-foreground">{skill.description}</p>}
    </div>
  );
}
