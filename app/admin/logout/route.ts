import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/app/lib/auth";

export async function POST() {
  const res = NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}


