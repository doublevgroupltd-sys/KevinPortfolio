import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { apiFetch, apiAssetUrl } from "@/lib/api";
import { Settings } from "@/lib/types";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function getSettings(): Promise<Settings> {
  try {
    const { settings } = await apiFetch<{ settings: Settings }>("/settings", { revalidate: 300 });
    return settings;
  } catch {
    return {
      id: "singleton",
      siteName: "Portfolio",
      tagline: "",
      bio: "",
      funFacts: [],
      profilePhoto: "",
      resumeUrl: "",
      yearsExperience: 0,
      projectsCompleted: 0,
      clientsServed: 0,
      linesOfCode: 0,
      githubUrl: "",
      linkedinUrl: "",
      twitterUrl: "",
      dribbbleUrl: "",
      instagramUrl: "",
      email: "",
      defaultTheme: "system",
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${settings.siteName} — ${settings.tagline}`, template: `%s | ${settings.siteName}` },
    description: settings.bio.slice(0, 160) || `${settings.siteName}'s personal portfolio.`,
    openGraph: {
      title: settings.siteName,
      description: settings.tagline,
      url: SITE_URL,
      siteName: settings.siteName,
      images: settings.profilePhoto ? [apiAssetUrl(settings.profilePhoto)] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.siteName,
      description: settings.tagline,
      images: settings.profilePhoto ? [apiAssetUrl(settings.profilePhoto)] : [],
    },
    manifest: "/manifest.json",
    icons: { icon: "/favicon.ico" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fraunces.variable} ${inter.variable} ${mono.variable} font-sans`}>
        <Providers>
          <Header siteName={settings.siteName} resumeUrl={apiAssetUrl(settings.resumeUrl)} />
          <main id="main-content">{children}</main>
          <Footer settings={settings} />
        </Providers>
      </body>
    </html>
  );
}
