import { useEffect } from "react";
import { useUserStore } from "../../user.store";
import {
  getTelegramWebApp,
  getInitData,
  parseInitData,
} from "../lib/telegram";

export function useBootstrapAuth() {
  const setFromTelegram = useUserStore((s) => s.setFromTelegram);
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    const tg = getTelegramWebApp();
    tg?.ready?.();
    tg?.expand?.();

    console.log("[bootstrap] VITE_API_BASE =", import.meta.env.VITE_API_BASE);

    const initData = getInitData();
    if (!initData) {
      alert("initData is empty — open via Telegram web_app button");
      return;
    }

    const { user } = parseInitData(initData);

    setFromTelegram(user, initData);
  }, [setFromTelegram, setUser]);
}
