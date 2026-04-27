/**
 * Wraps fetch so connection errors (API down, wrong port) do not throw.
 * Browser still logs failed network requests; callers avoid uncaught rejections.
 */
export async function tryFetch(input: string, init?: RequestInit): Promise<Response | null> {
  try {
    return await fetch(input, init);
  } catch {
    return null;
  }
}

export const API_UNAVAILABLE =
  "Cannot reach the API. Start the backend from the project root: cd backend && pnpm run dev (default port 3001).";
