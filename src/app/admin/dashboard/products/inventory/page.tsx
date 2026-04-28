"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../../../contexts/auth-provider";
import { fetchAdminProducts, type ProductPayload } from "../../../../../lib/admin-client";
import { getProductImageSrc } from "../../../../../lib/product-image";

export default function AdminInventoryPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<ProductPayload[] | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const list = await fetchAdminProducts(token);
    setRows((list ?? []).filter((p) => !p.inStock));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h5 fw-semibold mb-0">Inventory</h1>
          <p className="small text-secondary mb-0">Products marked out of stock.</p>
        </div>
        <Link href="/admin/dashboard/products" className="small text-decoration-none">
          All products
        </Link>
      </div>
      <div className="sqs-table-card">
        <div className="table-responsive">
          <table className="table table-sm align-middle mb-0">
            <thead className="table-light small text-secondary">
              <tr>
                <th style={{ width: 56 }} />
                <th>Name</th>
                <th>Slug</th>
                <th>Category</th>
                <th>Price</th>
                <th />
              </tr>
            </thead>
            <tbody className="small">
              {rows === null ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-secondary">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-secondary">
                    Nothing out of stock. Great job.
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Image src={getProductImageSrc(p.imageUrl)} alt="" width={40} height={40} className="rounded border bg-light" style={{ objectFit: "cover" }} />
                    </td>
                    <td className="fw-medium">{p.name}</td>
                    <td className="font-monospace text-break">{p.slug}</td>
                    <td>{p.category}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>
                      <Link href={`/admin/dashboard/products/${p.id}/edit`}>Restock / edit</Link>
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
