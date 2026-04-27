import type { Metadata } from "next";
import { PolicyShell } from "../../../components/policies/policy-shell";
import { TermsOfServiceContent } from "../../../components/policies/terms-of-service-content";

export const metadata: Metadata = {
  title: "Terms of service | Vitale Peptide",
  description: "Terms and conditions for using the Vitale Peptide website, store, and services.",
};

export default function TermsOfServicePage() {
  return (
    <PolicyShell title="Terms of service" lastUpdated="2026-04-24" currentHref="/policies/terms-of-service">
      <div className="policy-prose">
        <TermsOfServiceContent />
      </div>
    </PolicyShell>
  );
}
