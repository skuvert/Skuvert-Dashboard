import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, isValidSession } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  // HTTPS erzwingen (in Produktion). Vercel terminiert TLS und setzt
  // x-forwarded-proto; bei "http" auf https umleiten.
  if (process.env.NODE_ENV === "production") {
    const proto = request.headers.get("x-forwarded-proto");
    if (proto && proto !== "https") {
      const httpsUrl = new URL(request.url);
      httpsUrl.protocol = "https:";
      return NextResponse.redirect(httpsUrl, 308);
    }
  }

  const cookie = request.cookies.get(AUTH_COOKIE)?.value;
  if (await isValidSession(cookie)) {
    return NextResponse.next();
  }
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // ".*\\..*" schliesst alle statischen Dateien aus (z.B. /logo.png) — Next.js
  // Seiten-Routen haben nie eine Dateiendung in der URL.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|login|status|api/filament).*)"],
};
