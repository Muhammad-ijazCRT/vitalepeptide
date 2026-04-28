/** `next/image` only accepts a root-relative path (/) or a valid http(s) URL. */
const PLACEHOLDER = "/images/product-placeholder.svg";

function isValidHttpUrl(s: string): boolean {
  if (!s.startsWith("https://") && !s.startsWith("http://")) {
    return false;
  }
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolves a stored catalog image string to a value safe for `next/image` and `<img>`.
 * Invalid or empty values fall back to a static placeholder in `public/`.
 */
export function getProductImageSrc(url: string | null | undefined): string {
  const s = (url ?? "").trim();
  if (!s) {
    return PLACEHOLDER;
  }
  if (s.startsWith("/")) {
    return s;
  }
  if (isValidHttpUrl(s)) {
    return s;
  }
  return PLACEHOLDER;
}
