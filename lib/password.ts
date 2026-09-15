import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

// Passwort-Hashing mit scrypt (in Node eingebaut, keine Extra-Abhängigkeit,
// bewusst langsam gegen Brute-Force). Nur im Node-Runtime nutzen
// (Login-Action + Hash-Skript), NICHT in der Edge-Middleware.
const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEYLEN);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

// Prüft ein Passwort gegen ADMIN_PASSWORD_HASH ("salt:hash", hex).
// Konstante Laufzeit (timingSafeEqual), fail-closed wenn nicht konfiguriert.
export function verifyPassword(password: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!stored || !stored.includes(":")) return false;
  const [saltHex, hashHex] = stored.split(":");
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  if (expected.length !== KEYLEN) return false;
  const actual = scryptSync(password, salt, KEYLEN);
  return timingSafeEqual(actual, expected);
}
