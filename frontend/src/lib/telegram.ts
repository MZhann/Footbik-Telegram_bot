import type { TgUser, ApiUser } from "../types/TelegramTypes";

/** Safe access to Telegram WebApp object */
export function getTelegramWebApp(): any | null {
  return (window as any)?.Telegram?.WebApp ?? null;
}

/** Map Telegram user → ApiUser */
export function mapTgUser(u?: TgUser | null): ApiUser | null {
  if (!u) return null;
  return {
    tgId: String(u.id),
    username: u.username ?? null,
    firstName: u.first_name ?? null,
    lastName: u.last_name ?? null,
    language: u.language_code ?? null,
    isPremium: u.is_premium ?? null,
    photoUrl: u.photo_url ?? null,
  };
}

/** Get initData from WebApp or URL fallbacks */
export function getInitData(): string | null {
  const tg = getTelegramWebApp();
  const fromWebApp = tg?.initData;
  if (typeof fromWebApp === "string" && fromWebApp.length > 0)
    return fromWebApp;

  const fromHash = extractInitDataFromFragment(location.hash);
  if (fromHash) return fromHash;

  const fromSearch = extractInitDataFromFragment(location.search);
  return fromSearch;
}

/** Parse initData string into fields we care about */
export function parseInitData(initData: string): {
  user?: TgUser;
  params: URLSearchParams;
  authDate?: number;
  hash?: string;
} {
  const params = new URLSearchParams(initData);

  let user: TgUser | undefined;
  const userJson = params.get("user");
  if (userJson) {
    try {
      user = JSON.parse(userJson) as TgUser;
    } catch {
      // ignore parse errors
    }
  }

  const authDateVal = Number(params.get("auth_date") || "0");
  const authDate =
    Number.isFinite(authDateVal) && authDateVal > 0 ? authDateVal : undefined;
  const hash = params.get("hash") || undefined;

  return { user, params, authDate, hash };
}

/** Extract inner initData from "#tgWebAppData=..." or "?tgWebAppData=..." */
export function extractInitDataFromFragment(fragment: string): string | null {
  if (!fragment) return null;
  const f =
    fragment.startsWith("#") || fragment.startsWith("?")
      ? fragment.slice(1)
      : fragment;
  const qs = new URLSearchParams(f);
  const raw = qs.get("tgWebAppData");
  if (!raw) return null;

  try {
    return decodeURIComponent(raw);
  } catch {
    try {
      return decodeURIComponent(raw.replace(/\+/g, "%20"));
    } catch {
      return null;
    }
  }
}
