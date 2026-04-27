export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  inStock: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
