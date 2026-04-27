"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../../contexts/auth-provider";
import { useToast } from "../../../../contexts/toast-provider";
import { deleteAdminProduct, fetchAdminProducts, type ProductPayload } from "../../../../lib/admin-client";

export default function AdminProductsPage() {
  const { token } = useAuth();
  const toast = useToast();
  const [rows, setRows] = useState<ProductPayload[] | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const list = await fetchAdminProducts(token);
    setRows(list ?? []);
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function onDelete(id: string) {
    if (!token) return;
    if (!window.confirm("Delete this product? It must not appear on any past orders.")) return;
    const ok = await deleteAdminProduct(token, id);
    if (!ok) {
      toast.error("Could not delete (check orders or try again).");
      return;
    }
    toast.success("Product deleted.");
    load();
  }

  return (
    <div className="w-100">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-semibold mb-1">Products</h1>
          <p className="text-secondary small mb-0">Catalog items shown in the storefront. Edit details or remove unused SKUs.</p>
        </div>
        <Link href="/admin/dashboard/products/new" className="btn btn-dark btn-sm">
          + New product
        </Link>
      </div>

      <div className="card border-0 sqs-admin-panel overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-secondary text-uppercase">
              <tr>
                <th className="ps-4" style={{ width: 72 }}>
                  {" "}
                </th>
                <th>Name</th>
                <th>Slug</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows === null ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-secondary">
                    <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden />
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-secondary">
                    No products. Seed the catalog or create one.
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr key={p.id}>
                    <td className="ps-4">
                      <Image src={p.imageUrl} alt="" width={48} height={48} className="rounded-2 border bg-light" style={{ objectFit: "cover" }} />
                    </td>
                    <td className="fw-medium">{p.name}</td>
                    <td className="font-monospace small text-break">{p.slug}</td>
                    <td>
                      <span className="badge bg-light text-dark border">{p.category}</span>
                    </td>
                    <td className="fw-semibold">${p.price.toFixed(2)}</td>
                    <td>
                      {p.inStock ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle">In stock</span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary border">Out</span>
                      )}
                    </td>
                    <td className="text-end pe-4 text-nowrap">
                      <Link href={`/admin/dashboard/products/${p.id}/edit`} className="btn btn-sm btn-outline-primary me-1">
                        Edit
                      </Link>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onDelete(p.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
