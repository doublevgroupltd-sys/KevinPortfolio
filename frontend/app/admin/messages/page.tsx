"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Mail, MailOpen, X } from "lucide-react";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { apiClientFetch } from "@/lib/api";
import { Message } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";

export default function AdminMessagesPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { csrfToken, fetchCsrfToken } = useAuthStore();
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<Message | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => apiClientFetch<{ messages: Message[] }>("/contact"),
    enabled: !!user,
  });

  async function withCsrf<T>(fn: (token: string) => Promise<T>) {
    const token = csrfToken || (await fetchCsrfToken());
    return fn(token);
  }

  const toggleReadMutation = useMutation({
    mutationFn: (id: string) => withCsrf((token) => apiClientFetch(`/contact/${id}/read`, { method: "PUT", csrfToken: token })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-messages"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => withCsrf((token) => apiClientFetch(`/contact/${id}`, { method: "DELETE", csrfToken: token })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      setSelected(null);
    },
  });

  function openMessage(message: Message) {
    setSelected(message);
    if (!message.read) {
      toggleReadMutation.mutate(message.id);
    }
  }

  if (authLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  const filtered = (data?.messages || []).filter((m) => {
    if (filter === "unread") return !m.read;
    if (filter === "read") return m.read;
    return true;
  });

  return (
    <AdminShell>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">Messages</h1>
        <div className="flex gap-2" role="group" aria-label="Filter messages">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`rounded-full border px-4 py-2 text-sm font-medium capitalize ${
                filter === f ? "border-accent bg-accent text-accent-foreground" : "border-border hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading messages...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">No messages here yet.</p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((m) => (
            <Card
              key={m.id}
              className={`flex cursor-pointer items-center gap-4 transition-colors hover:bg-muted/50 ${!m.read ? "border-gold/50" : ""}`}
              onClick={() => openMessage(m)}
            >
              {m.read ? (
                <MailOpen className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
              ) : (
                <Mail className="h-5 w-5 flex-shrink-0 text-gold" aria-hidden="true" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <p className={`truncate font-medium ${!m.read ? "font-semibold" : ""}`}>{m.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{m.email}</p>
                </div>
                <p className="truncate text-sm text-muted-foreground">{m.subject}</p>
              </div>
              <p className="flex-shrink-0 text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</p>
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(m);
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Message detail"
          onClick={() => setSelected(null)}
        >
          <div className="w-full max-w-lg rounded-xl2 border border-border bg-card p-7" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold">{selected.subject}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  From {selected.name} ({selected.email})
                </p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close" className="rounded-full p-1.5 hover:bg-muted">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <p className="whitespace-pre-wrap text-muted-foreground">{selected.message}</p>
            <div className="mt-6 flex justify-between">
              <a href={`mailto:${selected.email}`} className="text-sm font-medium underline">
                Reply via Email
              </a>
              <Button variant="danger" size="sm" onClick={() => setDeleteTarget(selected)}>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete message?"
        description="This message will be permanently removed."
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </AdminShell>
  );
}
