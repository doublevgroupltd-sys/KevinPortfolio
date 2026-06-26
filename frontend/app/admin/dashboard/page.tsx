"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FolderKanban, Newspaper, MessageSquareQuote, GalleryHorizontal, Mail, Plus } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { apiClientFetch } from "@/lib/api";
import { Message } from "@/lib/types";

interface DashboardData {
  stats: {
    projects: number;
    posts: number;
    testimonials: number;
    banners: number;
    unreadMessages: number;
    totalMessages: number;
  };
  recentMessages: Message[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/admin/login");
    }
  }, [user, authLoading, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiClientFetch<DashboardData>("/dashboard/stats"),
    enabled: !!user,
  });

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const statCards = [
    { label: "Projects", value: data?.stats.projects ?? 0, icon: FolderKanban, href: "/admin/projects" },
    { label: "Blog Posts", value: data?.stats.posts ?? 0, icon: Newspaper, href: "/admin/blog" },
    { label: "Testimonials", value: data?.stats.testimonials ?? 0, icon: MessageSquareQuote, href: "/admin/testimonials" },
    { label: "Banners", value: data?.stats.banners ?? 0, icon: GalleryHorizontal, href: "/admin/banners" },
    { label: "Unread Messages", value: data?.stats.unreadMessages ?? 0, icon: Mail, href: "/admin/messages" },
  ];

  return (
    <AdminShell>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Welcome back, {user.name}</h1>
          <p className="mt-1 text-muted-foreground">Here&apos;s what&apos;s happening with your portfolio.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/projects" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground">
            <Plus className="h-4 w-4" aria-hidden="true" /> New Project
          </Link>
          <Link href="/admin/blog" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted">
            <Plus className="h-4 w-4" aria-hidden="true" /> New Post
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href}>
              <Card className="transition-colors hover:bg-muted/50">
                <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                <p className="mt-3 text-3xl font-semibold tabular-nums">{isLoading ? "—" : card.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Recent Messages</h2>
          <Link href="/admin/messages" className="text-sm font-medium underline">
            View all
          </Link>
        </div>
        <Card className="p-0">
          {data?.recentMessages.length === 0 || !data ? (
            <p className="p-6 text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-4 font-medium">From</th>
                  <th className="p-4 font-medium">Subject</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentMessages.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0">
                    <td className="p-4">
                      <p className="font-medium">{m.name}</p>
                      <p className="text-muted-foreground">{m.email}</p>
                    </td>
                    <td className="p-4">{m.subject}</td>
                    <td className="p-4 text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          m.read ? "bg-muted text-muted-foreground" : "bg-gold/15 text-gold"
                        }`}
                      >
                        {m.read ? "Read" : "Unread"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </AdminShell>
  );
}