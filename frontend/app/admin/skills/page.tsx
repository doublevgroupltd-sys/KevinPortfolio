"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { SortableList } from "@/components/admin/SortableList";
import { apiClientFetch } from "@/lib/api";
import { SkillCategory, Skill } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";

export default function AdminSkillsPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { csrfToken, fetchCsrfToken } = useAuthStore();
  const queryClient = useQueryClient();

  const [newCategoryName, setNewCategoryName] = useState("");
  const [skillForm, setSkillForm] = useState<{
    categoryId: string;
    editingId: string | null;
    name: string;
    icon: string;
    level: number;
    description: string;
  } | null>(null);
  const [deleteSkill, setDeleteSkill] = useState<Skill | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<SkillCategory | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-skills"],
    queryFn: () => apiClientFetch<{ categories: SkillCategory[] }>("/skills"),
    enabled: !!user,
  });

  async function withCsrf<T>(fn: (token: string) => Promise<T>) {
    const token = csrfToken || (await fetchCsrfToken());
    return fn(token);
  }

  const createCategory = useMutation({
    mutationFn: () =>
      withCsrf((token) =>
        apiClientFetch("/skills/categories", {
          method: "POST",
          body: JSON.stringify({ name: newCategoryName }),
          csrfToken: token,
        })
      ),
    onSuccess: () => {
      setNewCategoryName("");
      queryClient.invalidateQueries({ queryKey: ["admin-skills"] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => withCsrf((token) => apiClientFetch(`/skills/categories/${id}`, { method: "DELETE", csrfToken: token })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-skills"] }),
  });

  const saveSkill = useMutation({
    mutationFn: () => {
      if (!skillForm) return Promise.resolve();
      const { editingId, ...payload } = skillForm;
      return withCsrf((token) =>
        editingId
          ? apiClientFetch(`/skills/${editingId}`, { method: "PUT", body: JSON.stringify(payload), csrfToken: token })
          : apiClientFetch("/skills", { method: "POST", body: JSON.stringify(payload), csrfToken: token })
      );
    },
    onSuccess: () => {
      setSkillForm(null);
      queryClient.invalidateQueries({ queryKey: ["admin-skills"] });
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: (id: string) => withCsrf((token) => apiClientFetch(`/skills/${id}`, { method: "DELETE", csrfToken: token })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-skills"] }),
  });

  const reorderCategoriesMutation = useMutation({
    mutationFn: async (newOrder: SkillCategory[]) => {
      const token = csrfToken || (await fetchCsrfToken());
      const order = newOrder.map((c, i) => ({ id: c.id, order: i + 1 }));
      return apiClientFetch("/skills/categories/reorder", { method: "POST", body: JSON.stringify({ order }), csrfToken: token });
    },
    onMutate: (newOrder: SkillCategory[]) => {
      queryClient.setQueryData(["admin-skills"], { categories: newOrder });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["admin-skills"] }),
  });

  const reorderSkillsMutation = useMutation({
    mutationFn: async (newOrder: Skill[]) => {
      const token = csrfToken || (await fetchCsrfToken());
      const order = newOrder.map((s, i) => ({ id: s.id, order: i + 1 }));
      return apiClientFetch("/skills/reorder", { method: "POST", body: JSON.stringify({ order }), csrfToken: token });
    },
    onMutate: (newOrder: Skill[]) => {
      const current = queryClient.getQueryData<{ categories: SkillCategory[] }>(["admin-skills"]);
      if (!current) return;
      const categoryId = newOrder[0]?.categoryId;
      queryClient.setQueryData(["admin-skills"], {
        categories: current.categories.map((c) => (c.id === categoryId ? { ...c, skills: newOrder } : c)),
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["admin-skills"] }),
  });

  if (authLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <AdminShell>
      <h1 className="mb-8 font-display text-3xl font-semibold">Skills</h1>

      <Card className="mb-8">
        <h2 className="mb-4 font-display text-lg font-semibold">Add Category</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newCategoryName.trim()) createCategory.mutate();
          }}
          className="flex gap-3"
        >
          <Input
            placeholder="e.g. Frontend, Backend, DevOps"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <Button type="submit" disabled={createCategory.isPending}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Add
          </Button>
        </form>
      </Card>

      {isLoading ? (
        <p className="text-muted-foreground">Loading skills...</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">Drag category cards to reorder sections. Drag skills within a category to reorder them.</p>
          <SortableList
            items={data?.categories ?? []}
            onReorder={(newOrder) => reorderCategoriesMutation.mutate(newOrder)}
            renderItem={(category) => (
              <Card>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">{category.name}</h2>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setSkillForm({
                          categoryId: category.id,
                          editingId: null,
                          name: "",
                          icon: "",
                          level: 50,
                          description: "",
                        })
                      }
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" /> Skill
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteCategory(category)}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                {skillForm?.categoryId === category.id && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveSkill.mutate();
                    }}
                    className="mb-4 space-y-3 rounded-lg border border-border p-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Icon (emoji)"
                        value={skillForm.icon}
                        onChange={(e) => setSkillForm({ ...skillForm, icon: e.target.value })}
                      />
                      <Input
                        placeholder="Skill name"
                        required
                        value={skillForm.name}
                        onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                      />
                    </div>
                    <Textarea
                      placeholder="Description"
                      rows={2}
                      value={skillForm.description}
                      onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                    />
                    <div>
                      <Label htmlFor={`level-${category.id}`}>Proficiency: {skillForm.level}%</Label>
                      <input
                        id={`level-${category.id}`}
                        type="range"
                        min={0}
                        max={100}
                        value={skillForm.level}
                        onChange={(e) => setSkillForm({ ...skillForm, level: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={saveSkill.isPending}>
                        {skillForm.editingId ? "Update" : "Add"} Skill
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => setSkillForm(null)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                <SortableList
                  items={category.skills}
                  onReorder={(newOrder) => reorderSkillsMutation.mutate(newOrder)}
                  renderItem={(skill) => (
                    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                      <div>
                        <p className="font-medium">
                          <span aria-hidden="true">{skill.icon}</span> {skill.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{skill.level}% proficiency</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          aria-label={`Edit ${skill.name}`}
                          onClick={() =>
                            setSkillForm({
                              categoryId: category.id,
                              editingId: skill.id,
                              name: skill.name,
                              icon: skill.icon,
                              level: skill.level,
                              description: skill.description,
                            })
                          }
                          className="rounded-full p-2 hover:bg-muted"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${skill.name}`}
                          onClick={() => setDeleteSkill(skill)}
                          className="rounded-full p-2 hover:bg-muted"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  )}
                />
              </Card>
            )}
          />
        </>
      )}

      <ConfirmDialog
        open={!!deleteSkill}
        onOpenChange={(open) => !open && setDeleteSkill(null)}
        title="Delete skill?"
        description={`Remove "${deleteSkill?.name}" permanently?`}
        onConfirm={() => deleteSkill && deleteSkillMutation.mutate(deleteSkill.id)}
      />
      <ConfirmDialog
        open={!!deleteCategory}
        onOpenChange={(open) => !open && setDeleteCategory(null)}
        title="Delete category?"
        description={`This will delete "${deleteCategory?.name}" and all skills within it.`}
        onConfirm={() => deleteCategory && deleteCategoryMutation.mutate(deleteCategory.id)}
      />
    </AdminShell>
  );
}
