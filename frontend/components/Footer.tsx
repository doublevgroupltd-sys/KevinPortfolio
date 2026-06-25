"use client";

import Link from "next/link";
import { Github, Linkedin, Twitter, Dribbble, Instagram, Mail, ArrowUp } from "lucide-react";
import { Settings } from "@/lib/types";

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  githubUrl: Github,
  linkedinUrl: Linkedin,
  twitterUrl: Twitter,
  dribbbleUrl: Dribbble,
  instagramUrl: Instagram,
};

export function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();

  const socialLinks = (
    ["githubUrl", "linkedinUrl", "twitterUrl", "dribbbleUrl", "instagramUrl"] as const
  ).filter((key) => settings[key]);

  return (
    <footer className="border-t border-border">
      <div className="container-luxury flex flex-col gap-10 py-16 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-2xl">{settings.siteName}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Crafted with <span aria-hidden="true">❤️</span> by {settings.siteName}
          </p>
        </div>

        <nav aria-label="Social links" className="flex items-center gap-4">
          {socialLinks.map((key) => {
            const Icon = SOCIAL_ICONS[key];
            const label = key.replace("Url", "");
            return (
              <a
                key={key}
                href={settings[key]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${settings.siteName} on ${label}`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted"
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </a>
            );
          })}
          {settings.email && (
            <a
              href={`mailto:${settings.email}`}
              aria-label="Send an email"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted"
            >
              <Mail className="h-5 w-5" aria-hidden="true" />
            </a>
          )}
        </nav>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="inline-flex h-11 w-11 items-center justify-center self-start rounded-full border border-border transition-colors hover:bg-muted md:self-auto"
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="container-luxury flex flex-col gap-2 border-t border-border py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>© {year} {settings.siteName}. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/contact" className="hover:text-foreground">
            Contact
          </Link>
          <Link href="/admin/login" className="hover:text-foreground">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
