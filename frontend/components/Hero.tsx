"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Mail } from "lucide-react";

const ROLES = ["Full-Stack Developer", "Designer", "Problem Solver"];

function useTypedRotation(words: string[], typingSpeed = 70, pause = 1800) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex % words.length];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && text.length < current.length) {
      timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), typingSpeed);
    } else if (!deleting && text.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text.length > 0) {
      timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), typingSpeed / 2);
    } else if (deleting && text.length === 0) {
      setDeleting(false);
      setWordIndex((i) => i + 1);
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, wordIndex, words, typingSpeed, pause]);

  return text;
}

export function Hero({ name, tagline }: { name: string; tagline: string }) {
  const typed = useTypedRotation(tagline ? tagline.split(" • ") : ROLES);

  return (
    <section
      id="home"
      className="relative flex min-h-screen flex-col items-start justify-center overflow-hidden"
    >
      {/* Performant decorative gradient mesh background. Purely decorative -> aria-hidden. */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 top-1/4 h-[36rem] w-[36rem] rounded-full bg-gold/20 blur-3xl animate-blob" />
        <div className="absolute right-0 top-0 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-3xl animate-blob [animation-delay:4s]" />
        <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-gold/10 blur-3xl animate-blob [animation-delay:8s]" />
      </div>

      <div className="container-luxury">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground"
        >
          Available for new projects
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-display-1 font-semibold tracking-tight"
        >
          {name}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 h-12 font-display text-2xl text-muted-foreground sm:text-3xl"
          aria-live="polite"
        >
          {typed}
          <span className="ml-1 inline-block h-7 w-0.5 animate-pulse bg-gold align-middle" aria-hidden="true" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-12 flex flex-wrap gap-4"
        >
          <a
            href="#work"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-medium text-accent-foreground transition-transform hover:scale-105"
          >
            View My Work
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-8 py-4 text-base font-medium transition-colors hover:bg-muted"
          >
            Get In Touch
            <Mail className="h-4 w-4" aria-hidden="true" />
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        aria-hidden="true"
      >
        <ArrowDown className="h-6 w-6 animate-bounce text-muted-foreground" />
      </motion.div>
    </section>
  );
}
