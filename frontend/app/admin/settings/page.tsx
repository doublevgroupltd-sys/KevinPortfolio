"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Check, KeyRound } from "lucide-react";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { FileUpload } from "@/components/admin/FileUpload";
import { apiClientFetch } from "@/lib/api";
import { Settings } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";

export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { csrfToken, fetchCsrfToken } = useAuthStore();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<Settings | null>(null);
  const [funFactInput, setFunFactInput] = useState("");
  const [saved, setSaved] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [pwSuccess, setPwSuccess] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => apiClientFetch<{ settings: Settings }>("/settings"),
    enabled: !!user,
  });

  useEffect(() => {
    if (data?.settings) setForm(data.settings);
  }, [data]);

  async function withCsrf<T>(fn: (token: string) => Promise<T>) {
    const token = csrfToken || (await fetchCsrfToken());
    return fn(token);
  }

  const saveMutation = useMutation({
    mutationFn: () => withCsrf((token) => apiClientFetch("/settings", { method: "PUT", body: JSON.stringify(form), csrfToken: token })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: () => withCsrf((token) => apiClientFetch("/auth/change-password", { method: "POST", body: JSON.stringify(pwForm), csrfToken: token })),
    onSuccess: () => {
      setPwForm({ currentPassword: "", newPassword: "" });
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 2500);
    },
  });

  if (authLoading || !user || isLoading || !form) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  return (
    <AdminShell>
      <h1 className="mb-8 font-display text-3xl font-semibold">Settings</h1>

      <Card className="mb-8">
        <h2 className="mb-6 font-display text-lg font-semibold">Personal Info</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-6"
        >
          <FileUpload label="Profile Photo" value={form.profilePhoto} onChange={(url) => update("profilePhoto", url)} />
          <FileUpload label="Resume (PDF)" accept="application/pdf" value={form.resumeUrl} onChange={(url) => update("resumeUrl", url)} />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="siteName">Name</Label>
              <Input id="siteName" value={form.siteName} onChange={(e) => update("siteName", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline (separate roles with •)</Label>
              <Input id="tagline" value={form.tagline} onChange={(e) => update("tagline", e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio (use blank lines to separate paragraphs)</Label>
            <Textarea id="bio" rows={6} value={form.bio} onChange={(e) => update("bio", e.target.value)} />
          </div>

          <div>
            <Label htmlFor="funFactInput">Fun Facts</Label>
            <div className="flex gap-2">
              <Input
                id="funFactInput"
                value={funFactInput}
                onChange={(e) => setFunFactInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (funFactInput.trim()) {
                      update("funFacts", [...form.funFacts, funFactInput.trim()]);
                      setFunFactInput("");
                    }
                  }
                }}
                placeholder="Type a fun fact and press Enter"
              />
            </div>
            <ul className="mt-2 space-y-1">
              {form.funFacts.map((fact, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
                  {fact}
                  <button
                    type="button"
                    onClick={() => update("funFacts", form.funFacts.filter((_, idx) => idx !== i))}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-5 sm:grid-cols-4">
            <div>
              <Label htmlFor="yearsExperience">Years Experience</Label>
              <Input id="yearsExperience" type="number" value={form.yearsExperience} onChange={(e) => update("yearsExperience", Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="projectsCompleted">Projects Completed</Label>
              <Input id="projectsCompleted" type="number" value={form.projectsCompleted} onChange={(e) => update("projectsCompleted", Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="clientsServed">Clients Served</Label>
              <Input id="clientsServed" type="number" value={form.clientsServed} onChange={(e) => update("clientsServed", Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="linesOfCode">Lines of Code</Label>
              <Input id="linesOfCode" type="number" value={form.linesOfCode} onChange={(e) => update("linesOfCode", Number(e.target.value))} />
            </div>
          </div>

          <h3 className="font-display text-base font-semibold pt-2">Social Links</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="githubUrl">GitHub</Label>
              <Input id="githubUrl" value={form.githubUrl} onChange={(e) => update("githubUrl", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="linkedinUrl">LinkedIn</Label>
              <Input id="linkedinUrl" value={form.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="twitterUrl">Twitter / X</Label>
              <Input id="twitterUrl" value={form.twitterUrl} onChange={(e) => update("twitterUrl", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dribbbleUrl">Dribbble</Label>
              <Input id="dribbbleUrl" value={form.dribbbleUrl} onChange={(e) => update("dribbbleUrl", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="instagramUrl">Instagram</Label>
              <Input id="instagramUrl" value={form.instagramUrl} onChange={(e) => update("instagramUrl", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Public Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="defaultTheme">Default Theme (public site)</Label>
            <select
              id="defaultTheme"
              value={form.defaultTheme}
              onChange={(e) => update("defaultTheme", e.target.value as Settings["defaultTheme"])}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm sm:w-64"
            >
              <option value="system">System preference</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saveMutation.isPending}>
              <Save className="h-4 w-4" aria-hidden="true" />
              {saveMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
            {saved && (
              <span className="inline-flex items-center gap-1 text-sm text-green-600">
                <Check className="h-4 w-4" aria-hidden="true" /> Saved
              </span>
            )}
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="mb-6 font-display text-lg font-semibold">Change Password</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            changePasswordMutation.mutate();
          }}
          className="max-w-sm space-y-5"
        >
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              required
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              required
              minLength={8}
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
            />
          </div>

          {changePasswordMutation.isError && (
            <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {(changePasswordMutation.error as Error)?.message || "Failed to change password."}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" variant="secondary" disabled={changePasswordMutation.isPending}>
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
            </Button>
            {pwSuccess && (
              <span className="inline-flex items-center gap-1 text-sm text-green-600">
                <Check className="h-4 w-4" aria-hidden="true" /> Updated
              </span>
            )}
          </div>
        </form>
      </Card>
    </AdminShell>
  );
}
