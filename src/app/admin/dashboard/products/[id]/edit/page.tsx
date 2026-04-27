import Link from "next/link";
import { ProductEditor } from "../../../../../../components/admin/ProductEditor";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="w-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h5 fw-semibold mb-0">Edit product</h1>
        <Link href="/admin/dashboard/products" className="small text-decoration-none">
          ← All products
        </Link>
      </div>
      <ProductEditor productId={id} />
    </div>
  );
}
