import type { Metadata } from "next";
import Link from "next/link";
import { PolicyShell } from "../../../components/policies/policy-shell";

export const metadata: Metadata = {
  title: "Contact information | Vitale Peptide",
  description: "Trade name, email, and mailing address for Vitale Peptide.",
};

export default function ContactInformationPage() {
  return (
    <PolicyShell
      title="Contact information"
      subtitle="How to reach Vitale Peptide for orders, support, and legal inquiries."
      lastUpdated="2026-04-24"
      currentHref="/policies/contact-information"
    >
      <div className="policy-prose">
        <p>
          For product questions, order support, or privacy and legal requests, use the contact methods below. You can also send a message through our{" "}
          <Link href="/contact-us">Contact</Link> page.
        </p>

        <div className="policy-contact-grid mt-4 mb-2">
          <div className="policy-contact-card">
            <p className="policy-contact-card__label">Trade name</p>
            <p className="policy-contact-card__value">Vitale Peptide</p>
          </div>
          <div className="policy-contact-card">
            <p className="policy-contact-card__label">Customer &amp; orders</p>
            <p className="policy-contact-card__value">
              <a href="mailto:connectmkamran@yahoo.com">connectmkamran@yahoo.com</a>
            </p>
          </div>
          <div className="policy-contact-card">
            <p className="policy-contact-card__label">Support &amp; replacements</p>
            <p className="policy-contact-card__value">
              <a href="mailto:support@vitalepeptide.com">support@vitalepeptide.com</a>
            </p>
          </div>
          <div className="policy-contact-card">
            <p className="policy-contact-card__label">Privacy &amp; legal</p>
            <p className="policy-contact-card__value">
              <a href="mailto:info@vitalepeptide.com">info@vitalepeptide.com</a>
            </p>
          </div>
        </div>

        <div className="policy-contact-card policy-contact-card--wide mt-3 mb-0">
          <p className="policy-contact-card__label">Mailing address</p>
          <p className="policy-contact-card__value mb-0">
            656 Central Park Avenue, Suite 108
            <br />
            Scarsdale, NY 10583
            <br />
            United States
          </p>
        </div>
      </div>
    </PolicyShell>
  );
}
