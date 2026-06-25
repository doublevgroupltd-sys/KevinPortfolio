import Image from "next/image";
import { Download } from "lucide-react";
import { Settings } from "@/lib/types";
import { apiAssetUrl } from "@/lib/api";
import { StatCounter } from "./StatCounter";

export function About({ settings }: { settings: Settings }) {
  const paragraphs = settings.bio.split("\n").filter(Boolean);

  return (
    <section id="about" className="section-padding container-luxury">
      <div className="grid gap-16 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-24">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-xl2 bg-muted lg:mx-0">
          {settings.profilePhoto && (
            <Image
              src={apiAssetUrl(settings.profilePhoto)}
              alt={`Portrait of ${settings.siteName}`}
              fill
              sizes="(max-width: 1024px) 90vw, 420px"
              className="object-cover"
            />
          )}
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">About Me</p>
          <h2 className="mt-4 font-display text-display-2 font-semibold tracking-tight">
            The story behind the work
          </h2>

          <div className="prose-luxury mt-8 max-w-2xl">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {settings.funFacts.length > 0 && (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2" aria-label="Fun facts">
              {settings.funFacts.map((fact, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />
                  {fact}
                </li>
              ))}
            </ul>
          )}

          {settings.resumeUrl && (
            <a
              href={apiAssetUrl(settings.resumeUrl)}
              download
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-medium text-accent-foreground transition-transform hover:scale-105"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download Resume
            </a>
          )}
        </div>
      </div>

      <div className="mt-24 grid grid-cols-2 gap-10 border-t border-border pt-16 sm:grid-cols-4">
        <StatCounter value={settings.yearsExperience} suffix="+" label="Years Experience" />
        <StatCounter value={settings.projectsCompleted} suffix="+" label="Projects Completed" />
        <StatCounter value={settings.clientsServed} suffix="+" label="Clients Served" />
        <StatCounter value={settings.linesOfCode} suffix="+" label="Lines of Code" />
      </div>
    </section>
  );
}
