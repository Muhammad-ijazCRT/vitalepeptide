import { redirect } from "next/navigation";

export default function LegacyStoreSettingsRedirect() {
  redirect("/admin/dashboard/settings");
}
