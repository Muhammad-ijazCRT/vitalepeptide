import type { Metadata } from "next";
import { PolicyShell } from "../../../components/policies/policy-shell";

export const metadata: Metadata = {
  title: "Refund policy | Vitale Peptide",
  description: "Refund, return, and replacement policy for Vitale Peptide orders.",
};

export default function RefundPolicyPage() {
  return (
    <PolicyShell title="Refund policy" subtitle="Refund & return policy — Vitale Peptide" lastUpdated="2026-04-24" currentHref="/policies/refund-policy">
      <div className="policy-prose">
        <div className="policy-callout">
          <strong>Summary:</strong> All sales are final once shipped. Replacements may be offered for verified damaged, incorrect, or defective orders — not monetary refunds.
        </div>

        <p>
          At Vitale Peptide, all sales are final once shipped. Due to the nature of our products, we do not offer refunds under any circumstances.
        </p>
        <p>
          Our products are manufactured and stored under strict quality controls. For safety and compliance reasons, once a product leaves our facility, it cannot be returned or reused.
        </p>

        <h2>Damaged, incorrect, or defective orders</h2>
        <p>
          If your order arrives damaged, incorrect, or defective, please contact us at{" "}
          <a href="mailto:support@vitalepeptide.com">support@vitalepeptide.com</a> within <strong>7 days of delivery</strong>. Include your order number, photos, and a short description of the issue. Once verified, we&apos;ll send a free replacement. Please note: we do not offer monetary refunds.
        </p>

        <h2>Cancellations</h2>
        <p>
          Order cancellations are only possible before shipping. To request a cancellation, contact us immediately. Once your order has been processed or shipped, it cannot be canceled or refunded.
        </p>

        <h2>Order accuracy</h2>
        <p>
          Before checkout, please double-check your shipping and billing information and product selection. Vitale Peptide is not responsible for issues caused by incorrect details provided by the customer.
        </p>

        <h2>Shipping and carrier issues</h2>
        <p>
          If your package is delayed, lost, or held by customs or the carrier, we&apos;ll help with tracking when possible. However, we cannot offer refunds or replacements once the order has been handed off to the shipping service, except as described above for damaged, incorrect, or defective products.
        </p>

        <h2>Unauthorized returns</h2>
        <p className="mb-0">
          No returns will be accepted without prior written approval. Unauthorized returns will be refused and destroyed.
        </p>
      </div>
    </PolicyShell>
  );
}
