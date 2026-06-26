"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function useRequireAuth() {
  const { user, loading, fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Temporarily disabled redirect – public site now open
  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.replace("/admin/login");
  //   }
  // }, [loading, user]);

  return { user, loading };
}