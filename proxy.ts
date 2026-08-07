import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, isValidAuthCookie } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const cookie = request.cookies.get(AUTH_COOKIE)?.value;
  if (await isValidAuthCookie(cookie)) {
    return NextResponse.next();
  }
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // ".*\\..*" schliesst alle statischen Dateien aus (z.B. /logo.png) — Next.js
  // Seiten-Routen haben nie eine Dateiendung in der URL.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|login|status).*)"],
};
