"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { FileUpload } from "@/components/admin/FileUpload";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { apiClientFetch } from "@/lib/api";
import { Post } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";

const emptyForm = {
  title: "",
  featuredImage: "",
  excerpt: "",
  content: "",
  tags: [] as string[],
  status: "draft" as "draft" | "published",
};

export default function AdminBlogPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { csrfToken, fetchCsrfToken } = useAuthStore();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: () => apiClientFetch<{ posts: Post[] }>("/blog/admin/all"),
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
          ? apiClientFetch(`/blog/${editing.id}`, { method: "PUT", body: JSON.stringify(form), csrfToken: token })
          : apiClientFetch("/blog", { method: "POST", body: JSON.stringify(form), csrfToken: token })
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => withCsrf((token) => apiClientFetch(`/blog/${id}`, { method: "DELETE", csrfToken: token })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-posts"] }),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }
  function openEdit(post: Post) {
    setEditing(post);
    setForm({
      title: post.title,
      featuredImage: post.featuredImage,
      excerpt: post.excerpt,
      content: post.content,
      tags: post.tags,
      status: post.status,
    });
    setShowForm(true);
  }
  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    setShowPreview(false);
  }
  function addTag() {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((f) => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
    }
    setTagInput("");
  }

  if (authLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <AdminShell>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Blog Posts</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" /> New Post
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">{editing ? "Edit Post" : "New Post"}</h2>
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
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>

            <FileUpload
              label="Featured Image"
              value={form.featuredImage}
              onChange={(url) => setForm((f) => ({ ...f, featuredImage: url }))}
            />

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label htmlFor="content" className="mb-0">
                  Content (HTML, supports &lt;pre&gt;&lt;code&gt; for syntax blocks)
                </Label>
                <button
                  type="button"
                  onClick={() => setShowPreview((p) => !p)}
                  className="text-sm font-medium underline"
                >
                  {showPreview ? "Edit" : "Preview"}
                </button>
              </div>
              {showPreview ? (
                <div
                  className="prose-luxury rounded-lg border border-border p-4"
                  dangerouslySetInnerHTML={{ __html: form.content }}
                />
              ) : (
                <Textarea
                  id="content"
                  required
                  rows={10}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                />
              )}
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Type a tag and press Enter"
                />
                <Button type="button" variant="secondary" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
                    {tag}
                    <button type="button" onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "draft" | "published" }))}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {saveMutation.isError && (
              <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {(saveMutation.error as Error)?.message || "Failed to save post."}
              </p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : editing ? "Update Post" : "Create Post"}
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
          <p className="text-muted-foreground">Loading posts...</p>
        ) : (
          data?.posts.map((post) => (
            <Card key={post.id} className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">{post.title}</p>
                <p className="text-sm text-muted-foreground">{post.tags.join(", ")}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  post.status === "published" ? "bg-gold/15 text-gold" : "bg-muted text-muted-foreground"
                }`}
              >
                {post.status}
              </span>
              <Button variant="secondary" size="sm" onClick={() => openEdit(post)}>
                <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => setDeleteTarget(post)}>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
              </Button>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete post?"
        description={`Permanently delete "${deleteTarget?.title}"?`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </AdminShell>
  );
}
