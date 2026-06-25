"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export function StatCounter({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-5xl font-semibold tabular-nums sm:text-6xl">
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
