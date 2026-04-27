/** Bootstrap badge for order / payment status in admin tables. */

export function OrderStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase().replace(/\s+/g, "_");
  let cls = "bg-light text-dark border";
  if (s === "pending" || s === "awaiting_payment") cls = "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
  else if (s === "completed" || s === "paid") cls = "bg-success-subtle text-success-emphasis border border-success-subtle";
  else if (s === "cancelled") cls = "bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle";
  else if (s === "shipped" || s === "processing") cls = "bg-primary-subtle text-primary-emphasis border border-primary-subtle";
  return <span className={`badge rounded-pill px-2 py-1 text-uppercase small ${cls}`}>{status}</span>;
}
