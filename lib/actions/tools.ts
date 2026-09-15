"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function upsertPostPriceRow(data: {
  id?: string;
  weightClass: string;
  destinationZone: string;
  price: number;
}) {
  await requireAuth();
  if (data.id) {
    await prisma.postPriceRow.update({
      where: { id: data.id },
      data: { weightClass: data.weightClass, destinationZone: data.destinationZone, price: data.price },
    });
  } else {
    const sortOrder = await prisma.postPriceRow.count();
    await prisma.postPriceRow.create({
      data: { weightClass: data.weightClass, destinationZone: data.destinationZone, price: data.price, sortOrder },
    });
  }
  revalidatePath("/tools");
}

export async function deletePostPriceRow(id: string) {
  await requireAuth();
  await prisma.postPriceRow.delete({ where: { id } });
  revalidatePath("/tools");
}

export async function upsertOwnPriceRow(data: {
  id?: string;
  label: string;
  unit: string;
  price: number;
  note: string;
}) {
  await requireAuth();
  const note = data.note.trim() || null;
  if (data.id) {
    await prisma.ownPriceRow.update({
      where: { id: data.id },
      data: { label: data.label, unit: data.unit, price: data.price, note },
    });
  } else {
    const sortOrder = await prisma.ownPriceRow.count();
    await prisma.ownPriceRow.create({
      data: { label: data.label, unit: data.unit, price: data.price, note, sortOrder },
    });
  }
  revalidatePath("/tools");
}

export async function deleteOwnPriceRow(id: string) {
  await requireAuth();
  await prisma.ownPriceRow.delete({ where: { id } });
  revalidatePath("/tools");
}
