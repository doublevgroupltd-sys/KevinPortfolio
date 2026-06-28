import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ---------- Admin user (always update password/name) ----------
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const adminName = process.env.ADMIN_NAME || "Alex Rivera";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      name: adminName,
      role: "ADMIN",
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin user ready: ${adminEmail}`);

  // ---------- Settings (always upsert) ----------
  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: adminName,
      tagline: "Full-Stack Developer • Designer • Problem Solver",
      bio:
        "I'm a full-stack developer and designer who has spent the last eight years building products that sit at the intersection of engineering rigor and visual craft. My work spans fintech dashboards, e-commerce platforms, and design systems used by teams of all sizes.\n\nI care about the details most people skip: the 200ms of perceived load time, the focus ring on a button, the diff between 'good enough' and 'right'. That obsession is what separates software that works from software people love.\n\nWhen I'm not shipping code, I'm mentoring junior engineers, contributing to open source, or chasing the perfect shot of espresso.",
      funFacts: [
        "Shipped my first website at age 14",
        "Speaks 3 languages",
        "Has climbed to Everest Base Camp",
        "Roasts coffee as a hobby",
      ],
      profilePhoto: "/uploads/demo-profile.jpg",
      resumeUrl: "/uploads/demo-resume.pdf",
      yearsExperience: 8,
      projectsCompleted: 64,
      clientsServed: 32,
      linesOfCode: 850000,
      githubUrl: "https://github.com/example",
      linkedinUrl: "https://linkedin.com/in/example",
      twitterUrl: "https://twitter.com/example",
      dribbbleUrl: "https://dribbble.com/example",
      instagramUrl: "https://instagram.com/example",
      email: "hello@example.com",
      defaultTheme: "system",
    },
  });
  console.log("✅ Settings ready");

  // ---------- Banners (only if empty) ----------
  const existingBanners = await prisma.banner.count();
  if (existingBanners === 0) {
    await prisma.banner.createMany({
      data: [
        {
          image: "/uploads/demo-banner-1.jpg",
          headline: "Now Accepting Freelance Projects",
          subtext: "Limited availability for Q3 — let's build something exceptional together.",
          ctaText: "Start a Project",
          ctaLink: "/contact",
          order: 1,
          active: true,
        },
        {
          image: "/uploads/demo-banner-2.jpg",
          headline: "Download My Latest E-Book",
          subtext: "A practical guide to building design systems that scale.",
          ctaText: "Get the E-Book",
          ctaLink: "/blog",
          order: 2,
          active: true,
        },
        {
          image: "/uploads/demo-banner-3.jpg",
          headline: "Featured: Award-Winning Case Study",
          subtext: "See how we redesigned a fintech dashboard and lifted conversion by 38%.",
          ctaText: "View Case Study",
          ctaLink: "/work",
          order: 3,
          active: true,
        },
        {
          image: "/uploads/demo-banner-4.jpg",
          headline: "Speaking at Render Conf 2026",
          subtext: "Join my talk on building accessible, high-performance design systems.",
          ctaText: "See the Schedule",
          ctaLink: "/about",
          order: 4,
          active: true,
        },
      ],
    });
    console.log("✅ Banners seeded");
  } else {
    console.log("ℹ️ Banners already exist – skipping seed");
  }

  // ---------- Projects (only if empty) ----------
  const existingProjects = await prisma.project.count();
  if (existingProjects === 0) {
    const projectsData = [
      {
        title: "Nimbus — Fintech Analytics Dashboard",
        category: "Web Apps",
        thumbnail: "/uploads/demo-project-1.jpg",
        gallery: ["/uploads/demo-project-1.jpg", "/uploads/demo-project-1b.jpg"],
        shortDesc: "A real-time analytics dashboard for a Series B fintech startup, processing 2M+ events/day.",
        caseStudy:
          "<p>Nimbus needed a dashboard capable of surfacing real-time financial signals to portfolio managers without overwhelming them. We built a streaming architecture on top of Kafka and a React front end with virtualized tables to keep interactions instant even at 2M+ events per day.</p><p>The redesign cut average decision time for analysts by 40% and became the company's flagship product demo.</p>",
        role: "Lead Full-Stack Engineer",
        timeline: "4 months, 2024",
        challenges: "Real-time data at scale without sacrificing UI responsiveness.",
        solution: "Event-driven backend with WebSocket push, virtualized React tables, and aggressive memoization.",
        techStack: ["React", "TypeScript", "Node.js", "Kafka", "PostgreSQL", "WebSockets"],
        liveUrl: "https://example.com/nimbus",
        githubUrl: "https://github.com/example/nimbus",
        completedAt: new Date("2024-06-01"),
        featured: true,
        order: 1,
      },
      {
        title: "Aperture — Mobile Photography Marketplace",
        category: "Mobile",
        thumbnail: "/uploads/demo-project-2.jpg",
        gallery: ["/uploads/demo-project-2.jpg"],
        shortDesc: "A two-sided marketplace connecting photographers with clients, built in React Native.",
        caseStudy:
          "<p>Aperture launched as an MVP and scaled to 50,000 downloads in its first year. The app combines a portfolio-browsing experience with secure in-app booking and payments.</p>",
        role: "Mobile Lead",
        timeline: "6 months, 2023",
        challenges: "Offline-first portfolio browsing with seamless sync.",
        solution: "Local-first data layer with background sync and optimistic UI updates.",
        techStack: ["React Native", "Expo", "GraphQL", "Stripe"],
        liveUrl: "https://example.com/aperture",
        githubUrl: "https://github.com/example/aperture",
        completedAt: new Date("2023-11-01"),
        featured: false,
        order: 2,
      },
      {
        title: "Lumen Design System",
        category: "Design",
        thumbnail: "/uploads/demo-project-3.jpg",
        gallery: ["/uploads/demo-project-3.jpg"],
        shortDesc: "A token-based design system adopted across 12 product teams.",
        caseStudy:
          "<p>Lumen unified a fragmented component library into a single source of truth, with Figma tokens synced directly to code via a custom build pipeline.</p>",
        role: "Design Systems Lead",
        timeline: "5 months, 2023",
        challenges: "Aligning 12 teams with different legacy patterns on one system.",
        solution: "Incremental adoption strategy with codemods and a dedicated migration sprint per team.",
        techStack: ["Figma", "Storybook", "React", "Style Dictionary"],
        liveUrl: "https://example.com/lumen",
        githubUrl: "https://github.com/example/lumen",
        completedAt: new Date("2023-05-01"),
        featured: false,
        order: 3,
      },
      {
        title: "OpenTrace — Distributed Tracing CLI",
        category: "Open Source",
        thumbnail: "/uploads/demo-project-4.jpg",
        gallery: ["/uploads/demo-project-4.jpg"],
        shortDesc: "An open-source CLI for visualizing distributed traces in the terminal. 4.2k GitHub stars.",
        caseStudy:
          "<p>OpenTrace renders OpenTelemetry spans directly in the terminal as collapsible trees, eliminating the need to leave the CLI to debug latency issues.</p>",
        role: "Creator & Maintainer",
        timeline: "Ongoing since 2022",
        challenges: "Rendering complex nested trace trees legibly in a terminal.",
        solution: "Custom ASCII tree renderer with collapsible nodes and color-coded latency thresholds.",
        techStack: ["Go", "OpenTelemetry", "Cobra"],
        liveUrl: "https://example.com/opentrace",
        githubUrl: "https://github.com/example/opentrace",
        completedAt: new Date("2022-09-01"),
        featured: false,
        order: 4,
      },
      {
        title: "Meridian — E-Commerce Replatform",
        category: "Web Apps",
        thumbnail: "/uploads/demo-project-5.jpg",
        gallery: ["/uploads/demo-project-5.jpg"],
        shortDesc: "Migrated a legacy e-commerce platform to a headless architecture, improving LCP by 60%.",
        caseStudy:
          "<p>Meridian's legacy monolith was replaced with a headless commerce stack: Next.js storefront, a Node.js BFF, and a third-party commerce API. LCP dropped from 5.1s to 1.9s.</p>",
        role: "Tech Lead",
        timeline: "7 months, 2024",
        challenges: "Zero-downtime migration of a high-traffic storefront.",
        solution: "Strangler-fig pattern with route-by-route cutover behind a feature-flagged edge proxy.",
        techStack: ["Next.js", "Node.js", "GraphQL", "Vercel Edge"],
        liveUrl: "https://example.com/meridian",
        githubUrl: "https://github.com/example/meridian",
        completedAt: new Date("2024-12-01"),
        featured: false,
        order: 5,
      },
      {
        title: "Pulse — Mobile Habit Tracker",
        category: "Mobile",
        thumbnail: "/uploads/demo-project-6.jpg",
        gallery: ["/uploads/demo-project-6.jpg"],
        shortDesc: "A minimalist habit-tracking app with on-device ML for personalized nudges.",
        caseStudy:
          "<p>Pulse uses an on-device model to predict the best time to nudge a user toward their habit, with no data leaving the phone.</p>",
        role: "Solo Developer",
        timeline: "3 months, 2025",
        challenges: "Running inference on-device within strict battery budgets.",
        solution: "Quantized TensorFlow Lite model triggered on a debounced activity-recognition signal.",
        techStack: ["Swift", "TensorFlow Lite", "CoreML"],
        liveUrl: "https://example.com/pulse",
        githubUrl: "https://github.com/example/pulse",
        completedAt: new Date("2025-03-01"),
        featured: false,
        order: 6,
      },
    ];

    for (const p of projectsData) {
      const slug = p.title
        .toLowerCase()
        .replace(/[—]/g, "-")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      await prisma.project.create({ data: { ...p, slug } });
    }
    console.log("✅ 6 projects seeded");
  } else {
    console.log("ℹ️ Projects already exist – skipping seed");
  }

  // ---------- Skills (only if empty) ----------
  const existingSkills = await prisma.skill.count();
  if (existingSkills === 0) {
    await prisma.skill.deleteMany();
    await prisma.skillCategory.deleteMany();

    const skillCategories = [
      {
        name: "Frontend",
        order: 1,
        skills: [
          { name: "React / Next.js", icon: "⚛️", level: 96, description: "8+ years building production React apps." },
          { name: "TypeScript", icon: "🔷", level: 92, description: "Strict typing across large codebases." },
          { name: "Tailwind CSS", icon: "🎨", level: 90, description: "Utility-first styling at scale." },
          { name: "Framer Motion", icon: "🎬", level: 85, description: "Physics-based, accessible animation." },
        ],
      },
      {
        name: "Backend",
        order: 2,
        skills: [
          { name: "Node.js / Express", icon: "🟢", level: 94, description: "REST and GraphQL APIs in production." },
          { name: "PostgreSQL", icon: "🐘", level: 88, description: "Schema design, indexing, query tuning." },
          { name: "Prisma ORM", icon: "🧩", level: 86, description: "Type-safe data access layers." },
          { name: "GraphQL", icon: "🔺", level: 80, description: "Federated schemas across services." },
        ],
      },
      {
        name: "DevOps",
        order: 3,
        skills: [
          { name: "Docker", icon: "🐳", level: 85, description: "Multi-stage builds, container orchestration." },
          { name: "AWS", icon: "☁️", level: 80, description: "ECS, RDS, S3, CloudFront." },
          { name: "CI/CD", icon: "🔁", level: 88, description: "GitHub Actions pipelines, automated testing." },
          { name: "Kubernetes", icon: "☸️", level: 70, description: "Cluster deployments for microservices." },
        ],
      },
      {
        name: "Design",
        order: 4,
        skills: [
          { name: "Figma", icon: "🖌️", level: 90, description: "Component libraries, design tokens." },
          { name: "UX Research", icon: "🔍", level: 78, description: "User interviews, usability testing." },
          { name: "Design Systems", icon: "🧱", level: 87, description: "Token-based systems adopted org-wide." },
        ],
      },
    ];

    for (const cat of skillCategories) {
      await prisma.skillCategory.create({
        data: {
          name: cat.name,
          order: cat.order,
          skills: {
            create: cat.skills.map((s, i) => ({ ...s, order: i + 1 })),
          },
        },
      });
    }
    console.log("✅ 4 skill categories with 15 skills seeded");
  } else {
    console.log("ℹ️ Skills already exist – skipping seed");
  }

  // ---------- Testimonials (only if empty) ----------
  const existingTestimonials = await prisma.testimonial.count();
  if (existingTestimonials === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          name: "Sarah Chen",
          title: "VP of Engineering, Nimbus Financial",
          photo: "/uploads/demo-testimonial-1.jpg",
          text: "One of the most thorough engineers I've worked with. The dashboard rebuild wasn't just faster — it changed how our analysts make decisions.",
          rating: 5,
          order: 1,
        },
        {
          name: "Marcus Webb",
          title: "Founder, Aperture",
          photo: "/uploads/demo-testimonial-2.jpg",
          text: "Took our app from a sketchy MVP to something we were proud to launch. Communicated clearly at every step.",
          rating: 5,
          order: 2,
        },
        {
          name: "Priya Anand",
          title: "Design Director, Lumen",
          photo: "/uploads/demo-testimonial-3.jpg",
          text: "Rare combination of design sensibility and engineering depth. The design system migration could have been chaos; instead it was calm and methodical.",
          rating: 5,
          order: 3,
        },
        {
          name: "James O'Connor",
          title: "CTO, Meridian Retail",
          photo: "/uploads/demo-testimonial-4.jpg",
          text: "Led our replatform with zero downtime and dramatically better performance. Worth every dollar.",
          rating: 5,
          order: 4,
        },
        {
          name: "Lena Fischer",
          title: "Product Lead, Pulse",
          photo: "/uploads/demo-testimonial-5.jpg",
          text: "Incredibly fast turnaround without cutting corners on quality. Already planning our next project together.",
          rating: 4,
          order: 5,
        },
      ],
    });
    console.log("✅ 5 testimonials seeded");
  } else {
    console.log("ℹ️ Testimonials already exist – skipping seed");
  }

  // ---------- Blog posts (only if empty) ----------
  const existingPosts = await prisma.post.count();
  if (existingPosts === 0) {
    await prisma.post.createMany({
      data: [
        {
          title: "Designing Dashboards That Don't Lie to You",
          slug: "designing-dashboards-that-dont-lie-to-you",
          featuredImage: "/uploads/demo-blog-1.jpg",
          excerpt: "Most dashboards optimize for looking impressive in a demo. Here's how to optimize for the 6am incident instead.",
          content:
            "<h2>The problem with demo-driven dashboards</h2><p>Most analytics dashboards are designed to impress in a five-minute investor demo, not to be useful at 6am during an incident. This post covers the principles we used to redesign Nimbus around real decision-making moments.</p><pre><code>// Example: debounced real-time aggregation\nconst useStream = (topic) => {\n  // ...\n};</code></pre><p>The result: a 40% reduction in time-to-decision for on-call analysts.</p>",
          tags: ["Dashboards", "UX", "Data Visualization"],
          status: "published",
          publishedAt: new Date("2025-01-15"),
        },
        {
          title: "A Pragmatic Guide to Design Tokens",
          slug: "a-pragmatic-guide-to-design-tokens",
          featuredImage: "/uploads/demo-blog-2.jpg",
          excerpt: "Design tokens sound great in theory. Here's how to actually roll them out across 12 teams without a revolt.",
          content:
            "<h2>Start small</h2><p>Don't try to tokenize everything on day one. Start with color and spacing, prove the value, then expand.</p><p>Here's the migration sequence that worked for Lumen:</p><ol><li>Audit existing values</li><li>Define semantic tokens</li><li>Codemod one team at a time</li></ol>",
          tags: ["Design Systems", "Tokens", "Frontend"],
          status: "published",
          publishedAt: new Date("2025-03-02"),
        },
        {
          title: "Zero-Downtime Migrations: Lessons from Meridian",
          slug: "zero-downtime-migrations-lessons-from-meridian",
          featuredImage: "/uploads/demo-blog-3.jpg",
          excerpt: "Migrating a high-traffic storefront without a single minute of downtime, using the strangler-fig pattern.",
          content:
            "<h2>The strangler-fig pattern</h2><p>Instead of a big-bang cutover, route traffic incrementally through an edge proxy, validating each route before expanding.</p><pre><code>if (featureFlag('new-pdp')) {\n  return renderNewPDP();\n}\nreturn renderLegacyPDP();</code></pre>",
          tags: ["Architecture", "E-Commerce", "Migrations"],
          status: "published",
          publishedAt: new Date("2025-05-20"),
        },
      ],
    });
    console.log("✅ 3 blog posts seeded");
  } else {
    console.log("ℹ️ Blog posts already exist – skipping seed");
  }

  // ---------- Experience / Education (only if empty) ----------
  const existingExperience = await prisma.experience.count();
  if (existingExperience === 0) {
    await prisma.experience.createMany({
      data: [
        {
          company: "Nimbus Financial",
          role: "Lead Full-Stack Engineer",
          logo: "/uploads/demo-logo-1.png",
          startDate: new Date("2022-01-01"),
          current: true,
          description: "Leading the platform engineering team building real-time analytics products for institutional clients.",
          details: "Owns architecture decisions across 4 squads, mentors 6 engineers, and drives the technical roadmap for the analytics platform.",
          type: "work",
          order: 1,
        },
        {
          company: "Stanford University",
          role: "B.S. Computer Science",
          logo: "/uploads/demo-logo-2.png",
          startDate: new Date("2014-09-01"),
          endDate: new Date("2018-06-01"),
          current: false,
          description: "Focused on distributed systems and human-computer interaction.",
          details: "Graduated with honors; teaching assistant for Introduction to Algorithms for two years.",
          type: "education",
          order: 2,
        },
      ],
    });
    console.log("✅ 2 experience/education entries seeded");
  } else {
    console.log("ℹ️ Experience entries already exist – skipping seed");
  }

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });