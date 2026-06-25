"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Star, X } from "lucide-react";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { FileUpload } from "@/components/admin/FileUpload";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { SortableList } from "@/components/admin/SortableList";
import { apiClientFetch } from "@/lib/api";
import { Project } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";
import { apiAssetUrl } from "@/lib/api";
import Image from "next/image";

const CATEGORIES = ["Web Apps", "Mobile", "Design", "Open Source"] as const;

const emptyForm = {
  title: "",
  category: "Web Apps" as Project["category"],
  thumbnail: "",
  gallery: [] as string[],
  shortDesc: "",
  caseStudy: "",
  role: "",
  timeline: "",
  challenges: "",
  solution: "",
  techStack: [] as string[],
  liveUrl: "",
  githubUrl: "",
  completedAt: "",
  featured: false,
};

export default function AdminProjectsPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { csrfToken, fetchCsrfToken } = useAuthStore();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [techInput, setTechInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: () => apiClientFetch<{ projects: Project[] }>("/projects"),
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const token = csrfToken || (await fetchCsrfToken());
      const payload = { ...form, completedAt: form.completedAt || undefined };
      if (editing) {
        return apiClientFetch(`/projects/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
          csrfToken: token,
        });
      }
      return apiClientFetch("/projects", {
        method: "POST",
        body: JSON.stringify(payload),
        csrfToken: token,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = csrfToken || (await fetchCsrfToken());
      return apiClientFetch(`/projects/${id}`, { method: "DELETE", csrfToken: token });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-projects"] }),
  });

  const reorderMutation = useMutation({
    mutationFn: async (newOrder: Project[]) => {
      const token = csrfToken || (await fetchCsrfToken());
      const order = newOrder.map((p, i) => ({ id: p.id, order: i + 1 }));
      return apiClientFetch("/projects/reorder", { method: "POST", body: JSON.stringify({ order }), csrfToken: token });
    },
    onMutate: (newOrder: Project[]) => {
      queryClient.setQueryData(["admin-projects"], { projects: newOrder });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["admin-projects"] }),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setForm({
      title: project.title,
      category: project.category,
      thumbnail: project.thumbnail,
      gallery: project.gallery,
      shortDesc: project.shortDesc,
      caseStudy: project.caseStudy,
      role: project.role,
      timeline: project.timeline,
      challenges: project.challenges,
      solution: project.solution,
      techStack: project.techStack,
      liveUrl: project.liveUrl,
      githubUrl: project.githubUrl,
      completedAt: project.completedAt ? project.completedAt.slice(0, 10) : "",
      featured: project.featured,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    setTechInput("");
  }

  function addTech() {
    if (techInput.trim() && !form.techStack.includes(techInput.trim())) {
      setForm((f) => ({ ...f, techStack: [...f.techStack, techInput.trim()] }));
    }
    setTechInput("");
  }

  if (authLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <AdminShell>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Projects</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" /> New Project
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">{editing ? "Edit Project" : "New Project"}</h2>
            <button onClick={closeForm} aria-label="Close form" className="rounded-full p-1.5 hover:bg-muted">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate();
            }}
            className="space-y-6"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Project["category"] }))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <FileUpload
              label="Thumbnail (16:9 or 4:3, min 1000px wide recommended)"
              value={form.thumbnail}
              onChange={(url) => setForm((f) => ({ ...f, thumbnail: url }))}
            />

            <div>
              <Label htmlFor="shortDesc">Short Description</Label>
              <Textarea
                id="shortDesc"
                required
                rows={2}
                value={form.shortDesc}
                onChange={(e) => setForm((f) => ({ ...f, shortDesc: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="caseStudy">Full Case Study (HTML/rich text)</Label>
              <Textarea
                id="caseStudy"
                required
                rows={6}
                value={form.caseStudy}
                onChange={(e) => setForm((f) => ({ ...f, caseStudy: e.target.value }))}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  value={form.timeline}
                  onChange={(e) => setForm((f) => ({ ...f, timeline: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="challenges">Challenges</Label>
                <Textarea
                  id="challenges"
                  rows={3}
                  value={form.challenges}
                  onChange={(e) => setForm((f) => ({ ...f, challenges: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="solution">Solution</Label>
                <Textarea
                  id="solution"
                  rows={3}
                  value={form.solution}
                  onChange={(e) => setForm((f) => ({ ...f, solution: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tech">Tech Stack</Label>
              <div className="flex gap-2">
                <Input
                  id="tech"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTech();
                    }
                  }}
                  placeholder="Type a technology and press Enter"
                />
                <Button type="button" variant="secondary" onClick={addTech}>
                  Add
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.techStack.map((tech) => (
                  <span key={tech} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
                    {tech}
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, techStack: f.techStack.filter((t) => t !== tech) }))}
                      aria-label={`Remove ${tech}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="liveUrl">Live URL</Label>
                <Input
                  id="liveUrl"
                  type="url"
                  value={form.liveUrl}
                  onChange={(e) => setForm((f) => ({ ...f, liveUrl: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  type="url"
                  value={form.githubUrl}
                  onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="completedAt">Completion Date</Label>
                <Input
                  id="completedAt"
                  type="date"
                  value={form.completedAt}
                  onChange={(e) => setForm((f) => ({ ...f, completedAt: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2 pt-7">
                <input
                  id="featured"
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="featured" className="mb-0">
                  Featured project (shown larger)
                </Label>
              </div>
            </div>

            {saveMutation.isError && (
              <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {(saveMutation.error as Error)?.message || "Failed to save project."}
              </p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : editing ? "Update Project" : "Create Project"}
              </Button>
              <Button type="button" variant="secondary" onClick={closeForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Drag to reorder. Featured project shows larger on the public site.</p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading projects...</p>
      ) : data?.projects.length === 0 ? (
        <p className="text-muted-foreground">No projects yet. Create your first one above.</p>
      ) : (
        <SortableList
          items={data?.projects ?? []}
          onReorder={(newOrder) => reorderMutation.mutate(newOrder)}
          renderItem={(project) => (
            <Card className="flex items-center gap-4">
              <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                {project.thumbnail && (
                  <Image src={apiAssetUrl(project.thumbnail)} alt="" fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{project.title}</p>
                  {project.featured && <Star className="h-4 w-4 fill-gold text-gold" aria-label="Featured" />}
                </div>
                <p className="text-sm text-muted-foreground">{project.category}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => openEdit(project)}>
                <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => setDeleteTarget(project)}>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
              </Button>
            </Card>
          )}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete project?"
        description={`This will permanently delete "${deleteTarget?.title}". This action cannot be undone.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </AdminShell>
  );
}
