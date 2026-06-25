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
import { Experience } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";

const emptyForm = {
  company: "",
  role: "",
  logo: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
  details: "",
  type: "work" as "work" | "education",
};

export default function AdminExperiencePage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { csrfToken, fetchCsrfToken } = useAuthStore();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState<Experience | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-experience"],
    queryFn: () => apiClientFetch<{ experience: Experience[] }>("/experience"),
    enabled: !!user,
  });

  async function withCsrf<T>(fn: (token: string) => Promise<T>) {
    const token = csrfToken || (await fetchCsrfToken());
    return fn(token);
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, endDate: form.current ? undefined : form.endDate || undefined };
      return withCsrf((token) =>
        editing
          ? apiClientFetch(`/experience/${editing.id}`, { method: "PUT", body: JSON.stringify(payload), csrfToken: token })
          : apiClientFetch("/experience", { method: "POST", body: JSON.stringify(payload), csrfToken: token })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-experience"] });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => withCsrf((token) => apiClientFetch(`/experience/${id}`, { method: "DELETE", csrfToken: token })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-experience"] }),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }
  function openEdit(exp: Experience) {
    setEditing(exp);
    setForm({
      company: exp.company,
      role: exp.role,
      logo: exp.logo,
      startDate: exp.startDate.slice(0, 10),
      endDate: exp.endDate ? exp.endDate.slice(0, 10) : "",
      current: exp.current,
      description: exp.description,
      details: exp.details,
      type: exp.type,
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
        <h1 className="font-display text-3xl font-semibold">Experience &amp; Education</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" /> New Entry
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">{editing ? "Edit Entry" : "New Entry"}</h2>
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
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="company">Company / Institution</Label>
                <Input id="company" required value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="role">Role / Degree</Label>
                <Input id="role" required value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
              </div>
            </div>

            <FileUpload label="Logo" value={form.logo} onChange={(url) => setForm((f) => ({ ...f, logo: url }))} />

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" required value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  disabled={form.current}
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2 pt-7">
                <input
                  id="current"
                  type="checkbox"
                  checked={form.current}
                  onChange={(e) => setForm((f) => ({ ...f, current: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="current" className="mb-0">
                  Current
                </Label>
              </div>
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "work" | "education" }))}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
              >
                <option value="work">Work</option>
                <option value="education">Education</option>
              </select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" required rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="details">Additional Details (shown on expand)</Label>
              <Textarea id="details" rows={3} value={form.details} onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))} />
            </div>

            {saveMutation.isError && (
              <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {(saveMutation.error as Error)?.message || "Failed to save entry."}
              </p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : editing ? "Update Entry" : "Create Entry"}
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
          <p className="text-muted-foreground">Loading entries...</p>
        ) : (
          data?.experience.map((exp) => (
            <Card key={exp.id} className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">
                  {exp.role} · {exp.company}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(exp.startDate).getFullYear()} — {exp.current ? "Present" : exp.endDate ? new Date(exp.endDate).getFullYear() : ""}
                </p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">{exp.type}</span>
              <Button variant="secondary" size="sm" onClick={() => openEdit(exp)}>
                <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => setDeleteTarget(exp)}>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
              </Button>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete entry?"
        description={`Permanently delete "${deleteTarget?.role} at ${deleteTarget?.company}"?`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </AdminShell>
  );
}
