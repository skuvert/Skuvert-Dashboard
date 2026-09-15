"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, SESSION_TTL_SECONDS, createSessionToken } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { isRateLimited, registerFailedAttempt, resetAttempts } from "@/lib/login-rate-limit";

export type LoginState = { error?: string };

async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown");
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");
  const ip = await clientIp();

  if (await isRateLimited(ip)) {
    return { error: "Zu viele Fehlversuche. Bitte in 15 Minuten erneut versuchen." };
  }

  if (!verifyPassword(password)) {
    await registerFailedAttempt(ip);
    return { error: "Falsches Passwort." };
  }

  await resetAttempts(ip);

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  redirect(next.startsWith("/") ? next : "/");
}
