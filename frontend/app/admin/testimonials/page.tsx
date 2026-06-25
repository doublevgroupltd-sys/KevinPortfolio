"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, X, Star, Eye, EyeOff } from "lucide-react";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { FileUpload } from "@/components/admin/FileUpload";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { apiClientFetch } from "@/lib/api";
import { Testimonial } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";

const emptyForm = { name: "", title: "", photo: "", text: "", rating: 5, visible: true };

export default function AdminTestimonialsPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { csrfToken, fetchCsrfToken } = useAuthStore();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: () => apiClientFetch<{ testimonials: Testimonial[] }>("/testimonials/all"),
    enabled: !!user,
  });

  async function withCsrf<T>(fn: (token: string) => Promise<T>) {
    const token = csrfToken || (await fetchCsrfToken());
    return fn(token);
  }

  const saveMutation = useMutation({
    mutationFn: () =>
      withCsrf((token) =>
        editing
          ? apiClientFetch(`/testimonials/${editing.id}`, { method: "PUT", body: JSON.stringify(form), csrfToken: token })
          : apiClientFetch("/testimonials", { method: "POST", body: JSON.stringify(form), csrfToken: token })
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => withCsrf((token) => apiClientFetch(`/testimonials/${id}`, { method: "DELETE", csrfToken: token })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] }),
  });

  const toggleVisible = useMutation({
    mutationFn: (t: Testimonial) =>
      withCsrf((token) =>
        apiClientFetch(`/testimonials/${t.id}`, {
          method: "PUT",
          body: JSON.stringify({ visible: !t.visible }),
          csrfToken: token,
        })
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] }),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }
  function openEdit(t: Testimonial) {
    setEditing(t);
    setForm({ name: t.name, title: t.title, photo: t.photo, text: t.text, rating: t.rating, visible: t.visible });
    setShowForm(true);
  }
  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  }

  if (authLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <AdminShell>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Testimonials</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" /> New Testimonial
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">{editing ? "Edit Testimonial" : "New Testimonial"}</h2>
            <button onClick={closeForm} aria-label="Close form" className="rounded-full p-1.5 hover:bg-muted">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate();
            }}
            className="space-y-5"
          >
            <FileUpload label="Photo" value={form.photo} onChange={(url) => setForm((f) => ({ ...f, photo: url }))} />
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="title">Title / Company</Label>
                <Input id="title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label htmlFor="text">Testimonial Text</Label>
              <Textarea id="text" required rows={4} value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="rating">Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} type="button" onClick={() => setForm((f) => ({ ...f, rating: r }))} aria-label={`${r} stars`}>
                    <Star className={`h-6 w-6 ${r <= form.rating ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="visible"
                type="checkbox"
                checked={form.visible}
                onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="visible" className="mb-0">
                Visible on public site
              </Label>
            </div>

            {saveMutation.isError && (
              <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {(saveMutation.error as Error)?.message || "Failed to save testimonial."}
              </p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
              <Button type="button" variant="secondary" onClick={closeForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {isLoading ? (
          <p className="text-muted-foreground">Loading testimonials...</p>
        ) : (
          data?.testimonials.map((t) => (
            <Card key={t.id} className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.title}</p>
                <p className="mt-1 text-sm line-clamp-1">{t.text}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleVisible.mutate(t)}
                aria-label={t.visible ? "Hide testimonial" : "Show testimonial"}
                className="rounded-full p-2 hover:bg-muted"
              >
                {t.visible ? <Eye className="h-4 w-4 text-gold" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
              </button>
              <Button variant="secondary" size="sm" onClick={() => openEdit(t)}>
                <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => setDeleteTarget(t)}>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
              </Button>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete testimonial?"
        description={`Remove the testimonial from "${deleteTarget?.name}" permanently?`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </AdminShell>
  );
}
