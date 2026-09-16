"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { syncOrderLedger } from "@/lib/order-ledger";
import type { LedgerType } from "@prisma/client";

export type LedgerInput = {
  date: string; // YYYY-MM-DD
  type: "in" | "out";
  amount: number;
  category: string;
  description: string;
  party: string;
  receipt: boolean;
  orderId?: string | null;
};

// Datum als lokalen Kalendertag speichern (12:00, damit Zeitzonen den Tag nicht verschieben).
function toDate(d: string): Date {
  return new Date(`${d}T12:00:00`);
}

function mapType(t: "in" | "out"): LedgerType {
  return t === "in" ? "IN" : "OUT";
}

function clean(input: LedgerInput) {
  return {
    date: toDate(input.date),
    type: mapType(input.type),
    amount: Math.round(Number(input.amount) * 100) / 100,
    category: input.category.trim(),
    description: input.description.trim(),
    party: input.party.trim(),
    receipt: !!input.receipt,
    orderId: input.orderId || null,
  };
}

export async function createLedgerEntry(input: LedgerInput) {
  await requireAuth();
  await prisma.ledgerEntry.create({ data: clean(input) });
  revalidatePath("/abrechnung");
  revalidatePath("/");
}

export async function updateLedgerEntry(id: string, input: LedgerInput) {
  await requireAuth();
  await prisma.ledgerEntry.update({ where: { id }, data: clean(input) });
  revalidatePath("/abrechnung");
  revalidatePath("/");
}

export async function deleteLedgerEntry(id: string) {
  await requireAuth();
  await prisma.ledgerEntry.delete({ where: { id } });
  revalidatePath("/abrechnung");
  revalidatePath("/");
}

export async function saveProfile(data: {
  name: string;
  addr: string;
  taxId: string;
  place: string;
  iban: string;
}) {
  await requireAuth();
  await prisma.ledgerProfile.upsert({
    where: { id: "default" },
    create: { id: "default", ...data },
    update: data,
  });
  revalidatePath("/abrechnung");
}

// Import aus dem JSON-Backup des alten localStorage-Tools (gleiches Format).
// ponytail: legt alle Einträge neu an; erneuter Import derselben Datei erzeugt
// Duplikate — bewusst simpel, der Nutzer importiert einmalig zur Migration.
export async function importBackup(
  entries: {
    date: string;
    type: "in" | "out";
    amount: number;
    cat?: string;
    desc?: string;
    party?: string;
    receipt?: boolean;
  }[],
): Promise<{ added: number }> {
  await requireAuth();
  const valid = entries.filter((e) => e && e.date && Number(e.amount) > 0);
  if (valid.length) {
    await prisma.ledgerEntry.createMany({
      data: valid.map((e) => ({
        date: toDate(e.date),
        type: mapType(e.type),
        amount: Math.round(Number(e.amount) * 100) / 100,
        category: (e.cat ?? "").trim(),
        description: (e.desc ?? "").trim(),
        party: (e.party ?? "").trim(),
        receipt: e.receipt !== false,
      })),
    });
  }
  revalidatePath("/abrechnung");
  return { added: valid.length };
}

// Ein-Klick-Verbuchung eines Auftrags: erzeugt die abgeleiteten Zeilen
// (Einnahme + Material/Strom/Abnutzung/Verpackung) aus den Stammdaten. Danach
// halten sich diese Zeilen bei jeder Auftragsänderung automatisch aktuell.
export async function bookOrder(orderId: string): Promise<{ ok: boolean; reason?: string }> {
  await requireAuth();
  const existing = await prisma.ledgerEntry.count({ where: { orderId, auto: true } });
  if (existing > 0) return { ok: false, reason: "Auftrag ist bereits verbucht." };

  const res = await syncOrderLedger(orderId, { createIfMissing: true });
  if (!res.ok) return res;

  revalidatePath("/abrechnung");
  revalidatePath("/");
  revalidatePath(`/orders/${orderId}`);
  return { ok: true };
}
