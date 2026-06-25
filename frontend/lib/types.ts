export interface Settings {
  id: string;
  siteName: string;
  tagline: string;
  bio: string;
  funFacts: string[];
  profilePhoto: string;
  resumeUrl: string;
  yearsExperience: number;
  projectsCompleted: number;
  clientsServed: number;
  linesOfCode: number;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  dribbbleUrl: string;
  instagramUrl: string;
  email: string;
  defaultTheme: "light" | "dark" | "system";
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: "Web Apps" | "Mobile" | "Design" | "Open Source";
  thumbnail: string;
  gallery: string[];
  shortDesc: string;
  caseStudy: string;
  role: string;
  timeline: string;
  challenges: string;
  solution: string;
  techStack: string[];
  liveUrl: string;
  githubUrl: string;
  completedAt: string | null;
  featured: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  level: number;
  description: string;
  order: number;
  categoryId: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  order: number;
  skills: Skill[];
}

export interface Banner {
  id: string;
  image: string;
  headline: string;
  subtext: string;
  ctaText: string;
  ctaLink: string;
  order: number;
  active: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  photo: string;
  text: string;
  rating: number;
  visible: boolean;
  order: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  featuredImage: string;
  excerpt: string;
  content: string;
  tags: string[];
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  logo: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  details: string;
  type: "work" | "education";
  order: number;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}
