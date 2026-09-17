// middleware.ts : حماية لوحة التحكم + هيدرات أمان + تحديد معدل الطلبات + i18n
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-only-change-me-please-64-chars-long-secret-key-1234567890");

// معدل الطلبات في الذاكرة (للإنتاج استخدم Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100; // طلبات لكل نافذة
const RATE_WINDOW = 60 * 1000; // دقيقة واحدة

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
    || req.headers.get("x-real-ip") 
    || "unknown";
}

// i18n middleware
const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(req: NextRequest) {
  // تطبيق i18n middleware أولاً
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;
  
  const ip = getClientIp(req);
  const res = NextResponse.next();
  
  // تخطي فحص تسجيل الدخول لمسار API الدخول
  if (req.nextUrl.pathname === "/api/login" && req.method === "POST") {
    return res;
  }
  
  // هيدرات أمان عامة
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  
  // تحديد معدل الطلبات للمسارات الحساسة
  if (req.nextUrl.pathname.startsWith("/api/")) {
    if (!checkRateLimit(ip)) {
      return new NextResponse(JSON.stringify({ error: "تم تجاوز الحد المسموح من الطلبات" }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": "60" }
      });
    }
    res.headers.set("X-RateLimit-Limit", String(RATE_LIMIT));
    res.headers.set("X-RateLimit-Remaining", String(Math.max(0, RATE_LIMIT - (rateLimitMap.get(ip)?.count || 0))));
    res.headers.set("X-RateLimit-Reset", String(Math.ceil((rateLimitMap.get(ip)?.resetAt || Date.now() + RATE_WINDOW) / 1000)));
  }

  // حماية لوحة التحكم
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("ian_session")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    try {
      await jwtVerify(token, secret);
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // حماية المسارات الإدارية
  if (req.nextUrl.pathname.startsWith("/student")) {
    const token = req.cookies.get("ian_session")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    try {
      const { payload } = await jwtVerify(token, secret);
      if (payload.role === "admin") return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return res;
}

export const config = { 
  matcher: [
    "/dashboard/:path*", 
    "/student/:path*", 
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|login|api/login).*)"
  ] 
};