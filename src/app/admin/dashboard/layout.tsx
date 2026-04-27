import { AdminAppShell } from "../../../components/sqs/AdminAppShell";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminAppShell>{children}</AdminAppShell>;
}
