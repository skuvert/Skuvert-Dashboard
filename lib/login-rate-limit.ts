import { prisma } from "@/lib/prisma";

// Serverseitige Ratenbegrenzung pro Schlüssel (Login: IP, Uploads: "upload:IP").
// ponytail: fixes Fenster in der DB (Tabelle LoginAttempt), reicht für ein
// Ein-Admin-Tool; bei Bedarf auf ein rollendes Fenster / Upstash heben.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function isRateLimited(key: string, max = MAX_ATTEMPTS, windowMs = WINDOW_MS): Promise<boolean> {
  const row = await prisma.loginAttempt.findUnique({ where: { ip: key } });
  if (!row) return false;
  if (Date.now() - row.windowStart.getTime() > windowMs) return false; // Fenster abgelaufen
  return row.count >= max;
}

export async function registerFailedAttempt(key: string, windowMs = WINDOW_MS): Promise<void> {
  const row = await prisma.loginAttempt.findUnique({ where: { ip: key } });
  const windowExpired = !row || Date.now() - row.windowStart.getTime() > windowMs;
  await prisma.loginAttempt.upsert({
    where: { ip: key },
    create: { ip: key, count: 1 },
    update: windowExpired ? { count: 1, windowStart: new Date() } : { count: { increment: 1 } },
  });
}

export async function resetAttempts(key: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({ where: { ip: key } });
}
