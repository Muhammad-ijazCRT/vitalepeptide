import { ProductsCollection } from "../../components/products-collection";
import { getProducts } from "../../lib/api";
import "./store-page.css";

export default async function ShopPage() {
  const products = await getProducts();
  return <ProductsCollection products={products} />;
}
