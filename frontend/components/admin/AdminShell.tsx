"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  GalleryHorizontal,
  MessageSquareQuote,
  Newspaper,
  Settings as SettingsIcon,
  Mail,
  LogOut,
  Briefcase,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Skills", href: "/admin/skills", icon: Sparkles },
  { label: "Banners", href: "/admin/banners", icon: GalleryHorizontal },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "Blog", href: "/admin/blog", icon: Newspaper },
  { label: "Experience", href: "/admin/experience", icon: Briefcase },
  { label: "Messages", href: "/admin/messages", icon: Mail },
  { label: "Settings", href: "/admin/settings", icon: SettingsIcon },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    await logout();
    router.push("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-background pt-0">
      <aside className="hidden w-64 flex-shrink-0 border-r border-border p-6 lg:block">
        <Link href="/admin/dashboard" className="font-display text-xl font-semibold">
          Admin
        </Link>
        <nav className="mt-8 space-y-1" aria-label="Admin navigation">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden p-6 lg:p-10">{children}</main>
    </div>
  );
}
