"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";
import { Navbar } from "./navbar";

function shouldHideChrome(pathname: string | null) {
  if (!pathname) return false;
  if (pathname === "/admin" || pathname === "/customer") return false;
  const customerApp =
    pathname.startsWith("/customer/") &&
    !pathname.startsWith("/customer/login") &&
    !pathname.startsWith("/customer/signup");
  return (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/signup") ||
    pathname.startsWith("/customer/login") ||
    pathname.startsWith("/customer/signup") ||
    pathname.startsWith("/admin/dashboard") ||
    customerApp
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hide = shouldHideChrome(pathname);

  if (hide) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
