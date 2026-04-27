"use client";

import Link from "next/link";
import { useAuth } from "../../../../contexts/auth-provider";

export default function AdminProfilePage() {
  const { user } = useAuth();
  return (
    <div className="row w-100 g-0">
      <div className="col-12 col-lg-8 col-xl-6">
        <div className="card border-0 sqs-admin-panel overflow-hidden">
          <div className="card-body">
            <h1 className="h5 fw-semibold mb-3">Profile</h1>
            <div className="small mb-2">
              <div className="text-secondary">Name</div>
              <div className="fw-semibold">{user?.name ?? "—"}</div>
            </div>
            <div className="small mb-0">
              <div className="text-secondary">Email</div>
              <div>{user?.email ?? "—"}</div>
            </div>
            <Link href="/admin/dashboard/settings" className="btn btn-outline-primary btn-sm mt-3">
              Store settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
