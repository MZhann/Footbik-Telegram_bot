import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ApiUser, TgUser } from "./src/types/TelegramTypes";
import { mapTgUser } from "./src/lib/telegram";

type UserState = {
  user: ApiUser | null;
  error?: string | null;
  rawInitData?: string | null;
  authToken?: string | null;

  setFromTelegram: (
    u?: TgUser,
    rawInitData?: string | null,
  ) => void;
  setUser: (u: ApiUser | null) => void;
  setVerified: (u: ApiUser, token?: string | null) => void;
  clear: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      status: "idle",
      trust: "unverified",
      error: null,
      rawInitData: null,
      authToken: null,

      setFromTelegram: (u, rawInitData = null) => {
        const mapped = mapTgUser(u);
        set({
          user: mapped,
          rawInitData,
        });
      },

      setUser: (u) => set({ user: u }),

      setVerified: (u, token) => set({ user: u, authToken: token ?? null }),

      clear: () =>
        set({
          user: null,
          error: null,
          rawInitData: null,
          authToken: null,
        }),
    }),
    {
      name: "footbik_user",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        user: s.user,
        rawInitData: s.rawInitData,
        authToken: s.authToken,
      }),
    }
  )
);

/** 🔽 Selector hooks (export these!) */
export const useUser = () => useUserStore((s) => s.user);
export const useRawInitData = () => useUserStore((s) => s.rawInitData);
