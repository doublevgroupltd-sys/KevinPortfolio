"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Banner } from "@/lib/types";
import { apiAssetUrl } from "@/lib/api";

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % banners.length), [banners.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + banners.length) % banners.length), [banners.length]);

  useEffect(() => {
    if (paused || banners.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [paused, next, banners.length]);

  if (banners.length === 0) return null;

  const current = banners[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Announcements"
      className="relative h-[60vh] w-full overflow-hidden md:h-[70vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${banners.length}`}
        >
          <Image
            src={apiAssetUrl(current.image)}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" aria-hidden="true" />

          <div className="container-luxury relative flex h-full flex-col items-start justify-end pb-20 text-white">
            <h2 className="max-w-3xl font-display text-display-3 font-semibold leading-tight">
              {current.headline}
            </h2>
            {current.subtext && (
              <p className="mt-4 max-w-xl text-lg text-white/85">{current.subtext}</p>
            )}
            <Link
              href={current.ctaLink}
              className="mt-8 inline-flex items-center rounded-full bg-white px-7 py-3.5 text-base font-medium text-black transition-transform hover:scale-105"
            >
              {current.ctaText}
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2" role="tablist" aria-label="Slide selection">
            {banners.map((b, i) => (
              <button
                key={b.id}
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-8 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
