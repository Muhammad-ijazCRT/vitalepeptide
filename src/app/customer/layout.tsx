"use client";

import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { CustomerAppShell } from "../../components/sqs/CustomerAppShell";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-customer",
});

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname.startsWith("/customer/login") || pathname.startsWith("/customer/signup");
  return (
    <div className={`${inter.className} ${inter.variable} sqs-cust-theme`}>
      {isAuth ? children : <CustomerAppShell>{children}</CustomerAppShell>}
    </div>
  );
}
