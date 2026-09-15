import { prisma } from "@/lib/prisma";

// Serverseitige Ratenbegrenzung der Login-Versuche pro IP.
// ponytail: fixes Fenster in der DB, reicht für ein Ein-Admin-Tool; bei Bedarf
// auf ein rollendes Fenster / gemeinsamen Store (z. B. Upstash) heben.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function isRateLimited(ip: string): Promise<boolean> {
  const row = await prisma.loginAttempt.findUnique({ where: { ip } });
  if (!row) return false;
  if (Date.now() - row.windowStart.getTime() > WINDOW_MS) return false; // Fenster abgelaufen
  return row.count >= MAX_ATTEMPTS;
}

export async function registerFailedAttempt(ip: string): Promise<void> {
  const row = await prisma.loginAttempt.findUnique({ where: { ip } });
  const windowExpired = !row || Date.now() - row.windowStart.getTime() > WINDOW_MS;
  await prisma.loginAttempt.upsert({
    where: { ip },
    create: { ip, count: 1 },
    update: windowExpired ? { count: 1, windowStart: new Date() } : { count: { increment: 1 } },
  });
}

export async function resetAttempts(ip: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({ where: { ip } });
}
