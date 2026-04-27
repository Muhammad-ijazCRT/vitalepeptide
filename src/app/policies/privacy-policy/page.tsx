import type { Metadata } from "next";
import { PolicyShell } from "../../../components/policies/policy-shell";
import { PrivacyPolicyContent } from "../../../components/policies/privacy-policy-content";

export const metadata: Metadata = {
  title: "Privacy policy | Vitale Peptide",
  description: "How Vitale Peptide collects, uses, and discloses personal information when you use our store and services.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyShell title="Privacy policy" lastUpdated="2026-04-24" currentHref="/policies/privacy-policy">
      <div className="policy-prose">
        <PrivacyPolicyContent />
      </div>
    </PolicyShell>
  );
}
