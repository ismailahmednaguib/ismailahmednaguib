// lib/cookies.ts : إعداد الكوكي الآمن — ملف مستقل
// الكوكي الآمن (Secure) يعمل فقط على https — محليا على http يجب أن يكون false
// وإلا لن يرسل المتصفح الكوكي فتفشل كل الطلبات اللاحقة (403)
export function useSecure(req: Request): boolean {
  const proto = req.headers.get("x-forwarded-proto") || "";
  if (proto === "https") return true;
  if (req.url.startsWith("https://")) return true;
  try {
    const host = new URL(req.url).hostname;
    if (host === "localhost" || host === "127.0.0.1") return false;
  } catch { /* تجاهل */ }
  return process.env.NODE_ENV === "production";
}

export function cookieOpts(req: Request) {
  return { httpOnly: true, sameSite: "lax" as const, secure: useSecure(req), path: "/", maxAge: 43200 };
}
