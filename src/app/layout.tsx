import type { Metadata } from "next";
import { AuthProvider } from "../contexts/auth-provider";
import { ToastProvider } from "../contexts/toast-provider";
import { CartProvider } from "../components/cart-provider";
import { WishlistProvider } from "../components/wishlist-provider";
import { SiteShell } from "../components/site-shell";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import "../styles/sqs-platform.css";

export const metadata: Metadata = {
  title: "Vitale Peptide",
  description: "Premium research-grade peptides for professional laboratory use.",
  icons: {
    icon: [{ url: "/logo.webp", type: "image/webp" }],
    shortcut: "/logo.webp",
    apple: [{ url: "/logo.webp", type: "image/webp" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <SiteShell>{children}</SiteShell>
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
