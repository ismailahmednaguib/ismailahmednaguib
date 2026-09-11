// middleware.ts : حماية لوحة التحكم + هيدرات أمان — ملف مستقل
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("ian_session")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-only-change-me-please-64-chars-long-secret-key-1234567890");
      await jwtVerify(token, secret);
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  return res;
}
export const config = { matcher: ["/dashboard/:path*"] };
