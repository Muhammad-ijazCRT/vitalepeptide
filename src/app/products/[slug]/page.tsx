import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export default async function ProductLegacyRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/shop/${slug}`);
}
