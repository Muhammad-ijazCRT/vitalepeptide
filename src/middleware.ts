import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const encoder = () => new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-only-change-me-in-production");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("sqs_token")?.value;

  async function guard(role: "ADMIN" | "CUSTOMER", loginPath: string) {
    if (!token) {
      return NextResponse.redirect(new URL(loginPath, request.url));
    }
    try {
      const { payload } = await jwtVerify(token, encoder(), { algorithms: ["HS256"] });
      const r = String(payload.role ?? "");
      if (r !== role) {
        if (r === "ADMIN") {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
        return NextResponse.redirect(new URL("/customer/dashboard", request.url));
      }
    } catch {
      const res = NextResponse.redirect(new URL(loginPath, request.url));
      res.cookies.set("sqs_token", "", { path: "/", maxAge: 0 });
      return res;
    }
    return null;
  }

  if (pathname.startsWith("/admin/dashboard")) {
    const res = await guard("ADMIN", "/admin/login");
    if (res) return res;
  }

  const customerPublic =
    pathname.startsWith("/customer/login") ||
    pathname.startsWith("/customer/signup");
  if (pathname.startsWith("/customer") && !customerPublic) {
    const res = await guard("CUSTOMER", "/customer/login");
    if (res) return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard", "/admin/dashboard/:path*", "/customer/:path*"],
};
