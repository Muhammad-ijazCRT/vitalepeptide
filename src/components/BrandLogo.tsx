import Image from "next/image";
import Link from "next/link";

type Props = {
  href?: string;
  height?: number;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ href = "/shop", height = 48, className, priority }: Props) {
  const img = (
    <Image
      src="/logo.webp"
      alt="Home"
      width={220}
      height={height}
      className={className}
      style={{ height, width: "auto", maxWidth: "100%" }}
      priority={priority}
    />
  );
  if (href) {
    return (
      <Link href={href} className="d-inline-flex align-items-center text-decoration-none">
        {img}
      </Link>
    );
  }
  return <span className="d-inline-flex align-items-center">{img}</span>;
}
