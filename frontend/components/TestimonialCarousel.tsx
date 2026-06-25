"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Testimonial } from "@/lib/types";
import { apiAssetUrl } from "@/lib/api";

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);

  if (testimonials.length === 0) return null;

  const current = testimonials[index];
  const next = () => setIndex((i) => (i + 1) % testimonials.length);
  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="testimonials" className="section-padding container-luxury">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Testimonials</p>
      <h2 className="mt-4 font-display text-display-2 font-semibold tracking-tight">
        Kind words from collaborators
      </h2>

      <div className="mt-16 mx-auto max-w-3xl rounded-xl2 border border-border bg-card p-10 text-center sm:p-14">
        <Quote className="mx-auto h-10 w-10 text-gold" aria-hidden="true" />
        <p className="mt-6 font-display text-2xl leading-relaxed sm:text-3xl">&ldquo;{current.text}&rdquo;</p>

        <div className="mt-8 flex items-center justify-center gap-1" aria-label={`Rated ${current.rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${i < current.rating ? "fill-gold text-gold" : "text-muted-foreground"}`}
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          {current.photo && (
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted">
              <Image src={apiAssetUrl(current.photo)} alt="" fill className="object-cover" />
            </div>
          )}
          <div className="text-left">
            <p className="font-semibold">{current.name}</p>
            <p className="text-sm text-muted-foreground">{current.title}</p>
          </div>
        </div>
      </div>

      {testimonials.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous testimonial"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex gap-2" role="tablist" aria-label="Select testimonial">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={i === index}
                aria-label={`Testimonial from ${t.name}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-gold" : "w-2 bg-muted-foreground/30"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            aria-label="Next testimonial"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border hover:bg-muted"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
