/** Base URL for the Fastify API (includes `/api`). */
export function getPublicApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3001/api";
  return raw.replace(/\/$/, "");
}

/**
 * Server origin without `/api` — for static assets (e.g. `/uploads/`) served beside `/api`,
 * not under `/api/uploads/`.
 */
export function getPublicApiOrigin(): string {
  let base = getPublicApiUrl().replace(/\/$/, "");
  if (base.endsWith("/api")) {
    base = base.slice(0, -"/api".length);
  }
  return base.replace(/\/$/, "") || "http://localhost:3001";
}
