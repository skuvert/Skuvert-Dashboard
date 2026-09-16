import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// Stromkosten = Materialkosten × diesem Faktor (Vorgabe von Simon).
export const ELECTRICITY_FACTOR = 0.15;

const round2 = (n: number) => Math.round(n * 100) / 100;

type OrderForLedger = Prisma.OrderGetPayload<{ include: { costItems: true } }>;

// Baut die abgeleiteten Abrechnungs-Zeilen aus den Auftrags-Stammdaten.
// Nur Zeilen mit Betrag > 0 werden erzeugt (keine Null-Zeilen im Buch).
export function buildOrderLedgerLines(
  order: OrderForLedger,
  date: Date,
): Prisma.LedgerEntryCreateManyInput[] {
  const income = round2(order.costItems.reduce((s, c) => s + c.qty * c.unitPrice, 0));
  const material = round2(order.materialCostChf ?? 0);
  const electricity = round2(material * ELECTRICITY_FACTOR);
  const depreciation = round2(order.depreciationChf ?? 0);
  const packaging = round2(order.packagingCostChf ?? 0);
  const gramsNote = order.materialGrams ? ` (${order.materialGrams} g)` : "";
  const ref = order.orderNumber;

  const base = { date, party: order.customerName, orderId: order.id, receipt: true, auto: true };
  const candidates: Prisma.LedgerEntryCreateManyInput[] = [
    { ...base, type: "IN", amount: income, category: "Auftragsarbeit", description: `Auftrag ${ref}` },
    { ...base, type: "OUT", amount: material, category: "Filament / Material", description: `Material ${ref}${gramsNote}` },
    { ...base, type: "OUT", amount: electricity, category: "Strom / Drucker", description: `Strom ${ref}` },
    { ...base, type: "OUT", amount: depreciation, category: "Strom / Drucker", description: `Abnutzung Drucker ${ref}` },
    { ...base, type: "OUT", amount: packaging, category: "Verpackung / Versand", description: `Verpackung ${ref}` },
  ];
  return candidates.filter((l) => l.amount > 0);
}

// Hält die abgeleiteten (auto) Abrechnungs-Zeilen eines Auftrags synchron mit
// seinen Stammdaten. Manuelle Einträge (auto = false) bleiben unangetastet.
// createIfMissing = true: legt sie an, auch wenn noch keine existieren (Verbuchen-Button).
// createIfMissing = false: aktualisiert nur, wenn der Auftrag bereits verbucht ist.
export async function syncOrderLedger(
  orderId: string,
  { createIfMissing = false } = {},
): Promise<{ ok: boolean; reason?: string }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { costItems: true, ledgerEntries: true },
  });
  if (!order) return { ok: false, reason: "Auftrag nicht gefunden." };

  const autoEntries = order.ledgerEntries.filter((e) => e.auto);
  const alreadyBooked = autoEntries.length > 0;
  if (!alreadyBooked && !createIfMissing) return { ok: false, reason: "Noch nicht verbucht." };

  // Ursprüngliches Buchungsdatum beibehalten, sonst neu = heute.
  const date = alreadyBooked
    ? autoEntries.reduce((min, e) => (e.date < min ? e.date : min), autoEntries[0].date)
    : new Date();

  const lines = buildOrderLedgerLines(order, date);

  await prisma.$transaction([
    prisma.ledgerEntry.deleteMany({ where: { orderId, auto: true } }),
    ...(lines.length ? [prisma.ledgerEntry.createMany({ data: lines })] : []),
  ]);
  return { ok: true };
}
