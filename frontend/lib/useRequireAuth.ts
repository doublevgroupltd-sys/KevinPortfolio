"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

/**
 * Ensures the current user is authenticated before rendering admin content.
 * Redirects to /admin/login if not. Use inside any /admin/* page (except login).
 */
export function useRequireAuth() {
  const { user, loading, fetchMe } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/admin/login");
    }
  }, [loading, user, router]);

  return { user, loading };
}
