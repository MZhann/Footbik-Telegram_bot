// src/stores/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ApiUser } from "../types/TelegramTypes"; // или из файла выше

type AuthState = {
  user: ApiUser | null;
  setUser: (u: ApiUser | null) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (u) => set({ user: u }),
      clear: () => set({ user: null }),
    }),
    {
      name: "footbik:auth", // ключ localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user }), // пишем только user
    }
  )
);
