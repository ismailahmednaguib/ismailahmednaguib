// app/api/logout/route.ts : الخروج فقط
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "../../../lib/security";
export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
