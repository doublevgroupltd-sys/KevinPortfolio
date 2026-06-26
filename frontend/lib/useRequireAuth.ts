"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function useRequireAuth() {
  const { user, loading, fetchMe } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!loading && !user) {
      // Only redirect to login if we’re already inside the admin area
      if (pathname.startsWith("/admin")) {
        router.replace("/admin/login");
      }
    }
  }, [loading, user, pathname, router]);

  return { user, loading };
}