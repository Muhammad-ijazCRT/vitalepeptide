"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../../contexts/auth-provider";
import { useToast } from "../../contexts/toast-provider";
import { createAdminProduct, fetchAdminProduct, updateAdminProduct, type ProductPayload } from "../../lib/admin-client";

type FormState = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  inStock: boolean;
};

const empty: FormState = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  price: "",
  imageUrl: "",
  category: "",
  inStock: true,
};

function toForm(p: ProductPayload): FormState {
  return {
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    description: p.description,
    price: String(p.price),
    imageUrl: p.imageUrl,
    category: p.category,
    inStock: p.inStock,
  };
}

export function ProductEditor({ productId }: { productId?: string }) {
  const { token } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(empty);
  const [loading, setLoading] = useState(!!productId);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!productId || !token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchAdminProduct(token, productId).then((p) => {
      if (cancelled) return;
      if (p) setForm(toForm(p));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [productId, token]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setPending(true);
    const price = Number(form.price);
    if (Number.isNaN(price) || price < 0) {
      toast.error("Enter a valid price.");
      setPending(false);
      return;
    }
    const body: Record<string, unknown> = {
      name: form.name.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      price,
      imageUrl: form.imageUrl.trim(),
      category: form.category.trim(),
      inStock: form.inStock,
    };
    const slug = form.slug.trim();
    if (slug) body.slug = slug;

    if (productId) {
      const res = await updateAdminProduct(token, productId, body);
      setPending(false);
      if ("message" in res && !("id" in res)) {
        toast.error(String(res.message));
        return;
      }
      const p = res as ProductPayload;
      setForm(toForm(p));
      toast.success("Product saved.");
      return;
    }

    const res = await createAdminProduct(token, body);
    setPending(false);
    if ("message" in res && !("id" in res)) {
      toast.error(String((res as { message: string }).message));
      return;
    }
    const p = res as ProductPayload;
    toast.success("Product created.");
    router.push(`/admin/dashboard/products/${p.id}/edit`);
    router.refresh();
  }

  if (loading) {
    return <p className="text-secondary small py-4">Loading product…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="card border-0 sqs-admin-panel overflow-hidden">
      <div className="card-body row g-3">
        <div className="col-md-6">
          <label className="form-label small">Name</label>
          <input
            className="form-control"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label small">Slug (optional)</label>
          <input
            className="form-control"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="auto from name if empty"
          />
        </div>
        <div className="col-12">
          <label className="form-label small">Short description</label>
          <input
            className="form-control"
            value={form.shortDescription}
            onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
            required
          />
        </div>
        <div className="col-12">
          <label className="form-label small">Description</label>
          <textarea
            className="form-control"
            rows={6}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label small">Price (USD)</label>
          <input
            type="number"
            step="0.01"
            min={0}
            className="form-control"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label small">Category</label>
          <input
            className="form-control"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            required
          />
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <label className="form-check mb-0">
            <input
              type="checkbox"
              className="form-check-input"
              checked={form.inStock}
              onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.checked }))}
            />
            <span className="form-check-label small ms-1">In stock</span>
          </label>
        </div>
        <div className="col-12">
          <label className="form-label small">Image URL</label>
          <input
            className="form-control"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            required
          />
        </div>
        <div className="col-12 d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Saving…" : productId ? "Save changes" : "Create product"}
          </button>
          <Link href="/admin/dashboard/products" className="btn btn-outline-secondary">
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
