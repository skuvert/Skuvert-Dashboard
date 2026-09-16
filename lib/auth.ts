import { cookies } from "next/headers";
import { FALLBACK_SESSION_SECRET } from "@/lib/admin-config";

export const AUTH_COOKIE = "skuvert_auth";
export const SESSION_TTL_SECONDS = 60 * 60 * 24; // 1 Tag

// Web Crypto (crypto.subtle) statt Node "crypto", damit dieselben Funktionen
// in der Edge-Middleware (proxy.ts) UND in Server Actions/Components laufen.

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Konstante-Zeit-Vergleich (Edge hat kein timingSafeEqual).
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return toHex(sig);
}

// Signierter Session-Token "<exp>.<hmac>" — trägt eine Ablaufzeit und ist ohne
// SESSION_SECRET nicht fälschbar. Kein statischer, aus dem Passwort abgeleiteter Token mehr.
export async function createSessionToken(ttlSeconds = SESSION_TTL_SECONDS): Promise<string> {
  const secret = process.env.SESSION_SECRET || FALLBACK_SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET ist nicht gesetzt.");
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = await hmac(secret, String(exp));
  return `${exp}.${sig}`;
}

export async function isValidSession(token: string | undefined): Promise<boolean> {
  const secret = process.env.SESSION_SECRET || FALLBACK_SESSION_SECRET;
  if (!token || !secret) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmac(secret, expStr);
  return safeEqual(sig, expected);
}

// Guard für Server Actions und Server Components: wirft, wenn keine gültige
// Session vorliegt. Zweite Verteidigungslinie zusätzlich zur Middleware —
// schützt Actions auch dann, wenn sie über ihre Action-ID von einer
// öffentlichen Route aus aufgerufen werden.
export async function requireAuth(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!(await isValidSession(token))) {
    throw new Error("Nicht autorisiert.");
  }
}
