export const AUTH_COOKIE = "skuvert_auth";

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Web Crypto (crypto.subtle) statt Node "crypto", damit dieselbe Funktion
// in der Edge-Middleware und in Server Actions läuft.
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

export async function isValidAuthCookie(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  const expected = await hashPassword(process.env.ADMIN_PASSWORD ?? "");
  return cookieValue === expected;
}
