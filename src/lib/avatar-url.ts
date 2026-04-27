import { getPublicApiOrigin } from "./public-api-url";

/** Stored paths from API look like `/uploads/avatars/....` — served from API host root, not `/api`. */
export function resolveAvatarUrl(stored: string | null | undefined): string | null {
  if (!stored?.trim()) return null;
  const base = getPublicApiOrigin().replace(/\/$/, "");
  const path = stored.startsWith("/") ? stored : `/${stored}`;
  return `${base}${path}`;
}
