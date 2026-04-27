import type { Product } from "../types";

/** Normalize whitespace for scanning. */
function scanText(...parts: (string | undefined | null)[]): string {
  return parts
    .filter(Boolean)
    .join(" ")
    .replace(/\u00a0/g, " ");
}

function extractMgFromTextBlock(text: string): number[] {
  const found = new Set<number>();
  if (!text.trim()) return [];

  const patterns: RegExp[] = [
    /\b(\d+(?:\.\d+)?)\s*mg\b/gi,
    /\b(\d+(?:\.\d+)?)\s*mgs\b/gi,
    /(?:^|[^\w.])(\d+(?:\.\d+)?)\s*MG\b(?![a-z])/gi,
  ];

  for (const re of patterns) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const raw = m[1];
      if (raw == null) continue;
      const v = parseFloat(raw);
      if (Number.isFinite(v) && v > 0 && v <= 2000) {
        found.add(Math.round(v * 1000) / 1000);
      }
    }
  }

  return [...found].sort((a, b) => a - b);
}

/**
 * Extract numeric milligram strengths mentioned anywhere in catalog text
 * (e.g. "10mg", "5 mg", "2.5mg", "20MG" in title or body).
 */
export function extractMgMilligramsFromProduct(product: Product): number[] {
  const slugHints = (product.slug || "").replace(/-/g, " ");
  const text = scanText(
    product.name,
    slugHints,
    product.shortDescription,
    (product.description || "").slice(0, 1400)
  );
  const fromText = extractMgFromTextBlock(text);
  const fromSlug = extractMgFromTextBlock(slugHints);
  const merged = new Set<number>([...fromText, ...fromSlug]);
  return [...merged].sort((a, b) => a - b);
}

export function formatMgStrengthLabel(n: number): string {
  const r = Math.round(n * 1000) / 1000;
  if (Number.isInteger(r) || Math.abs(r - Math.round(r)) < 1e-6) {
    return `${Math.round(r)}mg`;
  }
  return `${r}mg`;
}

/** Labels used for filter checkboxes (one product can contribute to several mg rows). */
export function productMgFilterLabels(product: Product): string[] {
  const nums = extractMgMilligramsFromProduct(product);
  if (nums.length === 0) return ["Other"];
  return nums.map(formatMgStrengthLabel);
}

export function sortMgCatalogLabels(labels: string[]): string[] {
  const other = labels.filter((l) => l === "Other");
  const mcg = labels.filter((l) => l.toLowerCase().endsWith("mcg"));
  const mg = labels.filter((l) => l.endsWith("mg") && l !== "Other");
  mg.sort((a, b) => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });
  mcg.sort((a, b) => parseFloat(a) - parseFloat(b));
  return [...mg, ...mcg, ...other];
}

export function productMatchesMgFilters(product: Product, selected: Set<string>): boolean {
  if (selected.size === 0) return true;
  const labels = productMgFilterLabels(product);
  return labels.some((l) => selected.has(l));
}

/** @deprecated use productMgFilterLabels */
export function productSizeBucket(name: string): string {
  const nums = extractMgFromTextBlock(name);
  if (nums.length === 0) return "Other";
  return formatMgStrengthLabel(nums[0]);
}

export function shopProductSubtitle(product: Product): string {
  const s = product.shortDescription?.trim();
  if (s) return s.length > 80 ? `${s.slice(0, 77)}…` : s;
  return "Research-grade compounds for laboratory use.";
}

export function sortSizeBuckets(labels: string[]): string[] {
  return sortMgCatalogLabels(labels);
}
