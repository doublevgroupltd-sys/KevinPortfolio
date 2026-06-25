"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, X, Eye, EyeOff } from "lucide-react";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { FileUpload } from "@/components/admin/FileUpload";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { SortableList } from "@/components/admin/SortableList";
import { apiClientFetch, apiAssetUrl } from "@/lib/api";
import { Banner } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";

const emptyForm = { image: "", headline: "", subtext: "", ctaText: "Learn More", ctaLink: "#", active: true };

export default function AdminBannersPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { csrfToken, fetchCsrfToken } = useAuthStore();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState<Banner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: () => apiClientFetch<{ banners: Banner[] }>("/banners/all"),
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
          ? apiClientFetch(`/banners/${editing.id}`, { method: "PUT", body: JSON.stringify(form), csrfToken: token })
          : apiClientFetch("/banners", { method: "POST", body: JSON.stringify(form), csrfToken: token })
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => withCsrf((token) => apiClientFetch(`/banners/${id}`, { method: "DELETE", csrfToken: token })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-banners"] }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (banner: Banner) =>
      withCsrf((token) =>
        apiClientFetch(`/banners/${banner.id}`, {
          method: "PUT",
          body: JSON.stringify({ active: !banner.active }),
          csrfToken: token,
        })
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-banners"] }),
  });

  const reorderMutation = useMutation({
    mutationFn: async (newOrder: Banner[]) => {
      const token = csrfToken || (await fetchCsrfToken());
      const order = newOrder.map((b, i) => ({ id: b.id, order: i + 1 }));
      return apiClientFetch("/banners/reorder", { method: "POST", body: JSON.stringify({ order }), csrfToken: token });
    },
    onMutate: (newOrder: Banner[]) => {
      queryClient.setQueryData(["admin-banners"], { banners: newOrder });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["admin-banners"] }),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(banner: Banner) {
    setEditing(banner);
    setForm({
      image: banner.image,
      headline: banner.headline,
      subtext: banner.subtext,
      ctaText: banner.ctaText,
      ctaLink: banner.ctaLink,
      active: banner.active,
    });
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
        <h1 className="font-display text-3xl font-semibold">Banners</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" /> New Banner
        </Button>
      </div>

      {showForm && (
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">{editing ? "Edit Banner" : "New Banner"}</h2>
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
              <FileUpload
                label="Background Image (full-width, max 2MB, WebP preferred)"
                value={form.image}
                onChange={(url) => setForm((f) => ({ ...f, image: url }))}
              />
              <div>
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  required
                  value={form.headline}
                  onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="subtext">Subtext</Label>
                <Input
                  id="subtext"
                  value={form.subtext}
                  onChange={(e) => setForm((f) => ({ ...f, subtext: e.target.value }))}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="ctaText">CTA Text</Label>
                  <Input
                    id="ctaText"
                    value={form.ctaText}
                    onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="ctaLink">CTA Link</Label>
                  <Input
                    id="ctaLink"
                    value={form.ctaLink}
                    onChange={(e) => setForm((f) => ({ ...f, ctaLink: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="active" className="mb-0">
                  Active (visible on the public site)
                </Label>
              </div>

              {saveMutation.isError && (
                <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">
                  {(saveMutation.error as Error)?.message || "Failed to save banner."}
                </p>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : editing ? "Update Banner" : "Create Banner"}
                </Button>
                <Button type="button" variant="secondary" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-0 overflow-hidden">
            <p className="border-b border-border p-4 text-sm font-medium text-muted-foreground">Live Preview</p>
            <div className="relative aspect-[16/9] bg-muted">
              {form.image && <Image src={apiAssetUrl(form.image)} alt="" fill className="object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h3 className="font-display text-2xl font-semibold">{form.headline || "Headline preview"}</h3>
                {form.subtext && <p className="mt-1 text-sm text-white/85">{form.subtext}</p>}
                <span className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
                  {form.ctaText || "CTA"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      <p className="mb-4 text-sm text-muted-foreground">Drag to reorder. Order determines slide sequence on the public site.</p>

      {isLoading ? (
        <p className="text-muted-foreground">Loading banners...</p>
      ) : (
        <SortableList
          items={(data?.banners ?? []).slice().sort((a, b) => a.order - b.order)}
          onReorder={(newOrder) => reorderMutation.mutate(newOrder)}
          renderItem={(banner) => (
            <Card className="flex items-center gap-4">
              <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                {banner.image && <Image src={apiAssetUrl(banner.image)} alt="" fill className="object-cover" />}
              </div>
              <div className="flex-1">
                <p className="font-medium">{banner.headline}</p>
                <p className="text-sm text-muted-foreground">Order: {banner.order}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleActiveMutation.mutate(banner)}
                aria-label={banner.active ? "Deactivate banner" : "Activate banner"}
                className="rounded-full p-2 hover:bg-muted"
              >
                {banner.active ? <Eye className="h-4 w-4 text-gold" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
              </button>
              <Button variant="secondary" size="sm" onClick={() => openEdit(banner)}>
                <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => setDeleteTarget(banner)}>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
              </Button>
            </Card>
          )}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete banner?"
        description={`This will permanently delete "${deleteTarget?.headline}".`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </AdminShell>
  );
}
