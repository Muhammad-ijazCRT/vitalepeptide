import Link from "next/link";

export default function AdminInvoicesPlaceholderPage() {
  return (
    <div className="card border-0 sqs-admin-panel overflow-hidden">
      <div className="card-body">
        <h1 className="h5 fw-semibold">Invoices</h1>
        <p className="text-secondary small mb-3">
          For one-off crypto payments, use payment links — customers check out on NOWPayments from a simple Continue screen.
        </p>
        <div className="d-flex flex-wrap gap-2">
          <Link href="/admin/dashboard/invoices/payment-links" className="btn btn-sm btn-outline-primary">
            Create payment link
          </Link>
          <Link href="/admin/dashboard/invoices/payment-link-history" className="btn btn-sm btn-outline-secondary">
            Link history
          </Link>
        </div>
      </div>
    </div>
  );
}
