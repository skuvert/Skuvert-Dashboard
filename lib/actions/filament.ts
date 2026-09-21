"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import type { FilamentMaterial } from "@prisma/client";

const MATERIALS: FilamentMaterial[] = ["PLA", "PETG", "ABS", "TPU"];

function assertMaterial(m: string): FilamentMaterial {
  if (!MATERIALS.includes(m as FilamentMaterial)) throw new Error("Unbekanntes Material.");
  return m as FilamentMaterial;
}

// Spule(n) hinzufügen. Existiert die Farbe schon (Material+Name), wird nur die
// Anzahl erhöht — so landet "noch 2 schwarze PLA" korrekt auf derselben Zeile.
export async function addSpool(data: {
  material: string;
  colorName: string;
  colorHex: string;
  count: number;
}) {
  await requireAuth();
  const material = assertMaterial(data.material);
  const colorName = data.colorName.trim();
  const colorHex = data.colorHex.trim() || "#9ca3af";
  const count = Math.max(1, Math.round(data.count) || 1);
  if (!colorName) throw new Error("Farbname fehlt.");

  const existing = await prisma.filamentSpool.findUnique({
    where: { material_colorName: { material, colorName } },
  });
  if (existing) {
    await prisma.filamentSpool.update({
      where: { id: existing.id },
      data: { count: existing.count + count, colorHex },
    });
  } else {
    const sortOrder = await prisma.filamentSpool.count();
    await prisma.filamentSpool.create({
      data: { material, colorName, colorHex, count, sortOrder },
    });
  }
  revalidatePath("/filament");
}

// Anzahl um delta ändern (±1). Fällt sie auf 0, bleibt die Zeile bestehen
// (auf der Website ausgeblendet) — zum ganz Entfernen dient deleteSpool.
export async function adjustSpool(id: string, delta: number) {
  await requireAuth();
  const row = await prisma.filamentSpool.findUnique({ where: { id } });
  if (!row) return;
  const count = Math.max(0, row.count + delta);
  await prisma.filamentSpool.update({ where: { id }, data: { count } });
  revalidatePath("/filament");
}

export async function deleteSpool(id: string) {
  await requireAuth();
  await prisma.filamentSpool.delete({ where: { id } });
  revalidatePath("/filament");
}
