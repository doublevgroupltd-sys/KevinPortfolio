import { create } from "zustand";
import { User } from "@/lib/types";
import { apiClientFetch } from "@/lib/api";

interface AuthState {
  user: User | null;
  csrfToken: string | null;
  loading: boolean;
  fetchCsrfToken: () => Promise<string>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  csrfToken: null,
  loading: true,

  fetchCsrfToken: async () => {
    const { csrfToken } = await apiClientFetch<{ csrfToken: string }>("/auth/csrf");
    set({ csrfToken });
    return csrfToken;
  },

  login: async (email, password) => {
    const token = get().csrfToken || (await get().fetchCsrfToken());
    const { user } = await apiClientFetch<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      csrfToken: token,
    });
    set({ user });
  },

  logout: async () => {
    const token = get().csrfToken || (await get().fetchCsrfToken());
    await apiClientFetch("/auth/logout", { method: "POST", csrfToken: token });
    set({ user: null });
  },

  fetchMe: async () => {
    set({ loading: true });
    try {
      const { user } = await apiClientFetch<{ user: User }>("/auth/me");
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
