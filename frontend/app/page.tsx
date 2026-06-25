import { apiFetch } from "@/lib/api";
import { Settings, Project, SkillCategory, Banner, Testimonial, Post, Experience } from "@/lib/types";
import { Hero } from "@/components/Hero";
import { BannerCarousel } from "@/components/BannerCarousel";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { WorkGrid } from "@/components/WorkGrid";
import { Timeline } from "@/components/Timeline";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { BlogPreview } from "@/components/BlogPreview";
import { ContactForm } from "@/components/ContactForm";

export const revalidate = 300;

async function getHomeData() {
  const [settingsRes, projectsRes, skillsRes, bannersRes, testimonialsRes, postsRes, experienceRes] =
    await Promise.allSettled([
      apiFetch<{ settings: Settings }>("/settings", { revalidate: 300 }),
      apiFetch<{ projects: Project[] }>("/projects", { revalidate: 300 }),
      apiFetch<{ categories: SkillCategory[] }>("/skills", { revalidate: 300 }),
      apiFetch<{ banners: Banner[] }>("/banners", { revalidate: 60 }),
      apiFetch<{ testimonials: Testimonial[] }>("/testimonials", { revalidate: 300 }),
      apiFetch<{ posts: Post[] }>("/blog?limit=3", { revalidate: 300 }),
      apiFetch<{ experience: Experience[] }>("/experience", { revalidate: 300 }),
    ]);

  return {
    settings: settingsRes.status === "fulfilled" ? settingsRes.value.settings : null,
    projects: projectsRes.status === "fulfilled" ? projectsRes.value.projects : [],
    categories: skillsRes.status === "fulfilled" ? skillsRes.value.categories : [],
    banners: bannersRes.status === "fulfilled" ? bannersRes.value.banners : [],
    testimonials: testimonialsRes.status === "fulfilled" ? testimonialsRes.value.testimonials : [],
    posts: postsRes.status === "fulfilled" ? postsRes.value.posts : [],
    experience: experienceRes.status === "fulfilled" ? experienceRes.value.experience : [],
  };
}

export default async function HomePage() {
  const { settings, projects, categories, banners, testimonials, posts, experience } = await getHomeData();

  if (!settings) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-muted-foreground">
          Unable to reach the API. Make sure the backend is running and NEXT_PUBLIC_API_URL is set correctly.
        </p>
      </div>
    );
  }

  return (
    <>
      <Hero name={settings.siteName} tagline={settings.tagline} />
      <BannerCarousel banners={banners} />
      <About settings={settings} />
      <Skills categories={categories} />
      <WorkGrid projects={projects} />
      <Timeline items={experience} />
      <TestimonialCarousel testimonials={testimonials} />
      <BlogPreview posts={posts} />
      <ContactForm />
    </>
  );
}
