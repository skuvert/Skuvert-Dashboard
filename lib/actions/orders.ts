"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { buildDefaultChecklist } from "@/lib/order-types";
import { extractAddress } from "@/lib/address";
import { INTERNAL_TO_CUSTOMER_STATUS } from "@/lib/status";
import type { InternalStatus } from "@prisma/client";

function isUniqueConstraintError(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && e.code === "P2002";
}

export type FormState = { error?: string };

export async function createOrder(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth();
  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim();
  const rawRequestText = String(formData.get("rawRequestText") ?? "");
  const orderTypes = formData.getAll("orderTypes").map(String);

  if (!orderNumber) return { error: "Bitte eine Auftragsnummer angeben." };
  if (!customerName) return { error: "Bitte einen Kundennamen angeben." };

  let orderId: string;
  try {
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        rawRequestText,
        orderTypes,
        shippingAddress: extractAddress(rawRequestText) || null,
        trackingToken: crypto.randomUUID().replace(/-/g, ""),
        checklistItems: {
          create: buildDefaultChecklist(orderTypes).map((label, i) => ({
            label,
            isDefault: true,
            sortOrder: i,
          })),
        },
      },
    });
    orderId = order.id;
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      return { error: `Auftragsnummer "${orderNumber}" existiert bereits.` };
    }
    throw e;
  }

  revalidatePath("/");
  redirect(`/orders/${orderId}`);
}

export async function updateOrderDetails(
  orderId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim();
  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  const paymentLink = String(formData.get("paymentLink") ?? "").trim();
  const shippingAddress = String(formData.get("shippingAddress") ?? "").trim();
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  const materialGramsRaw = String(formData.get("materialGrams") ?? "").trim();
  const materialCostRaw = String(formData.get("materialCostChf") ?? "").trim();
  const materialGrams = materialGramsRaw ? Number(materialGramsRaw.replace(",", ".")) : null;
  const materialCostChf = materialCostRaw ? Number(materialCostRaw.replace(",", ".")) : null;

  if (!customerName) return { error: "Bitte einen Kundennamen angeben." };
  if (!orderNumber) return { error: "Bitte eine Auftragsnummer angeben." };

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        customerName,
        customerEmail,
        orderNumber,
        paymentLink: paymentLink || null,
        shippingAddress: shippingAddress || null,
        trackingNumber: trackingNumber || null,
        materialGrams: materialGrams != null && Number.isFinite(materialGrams) ? materialGrams : null,
        materialCostChf:
          materialCostChf != null && Number.isFinite(materialCostChf) ? materialCostChf : null,
      },
    });
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      return { error: `Auftragsnummer "${orderNumber}" existiert bereits.` };
    }
    throw e;
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/");
  return {};
}

export async function updateOrderTypes(orderId: string, orderTypes: string[]) {
  await requireAuth();
  await prisma.order.update({ where: { id: orderId }, data: { orderTypes } });
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/");
}

export async function updateInternalStatus(orderId: string, internalStatus: InternalStatus) {
  await requireAuth();
  await prisma.order.update({
    where: { id: orderId },
    data: { internalStatus, customerStatus: INTERNAL_TO_CUSTOMER_STATUS[internalStatus] },
  });
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/");
}

export async function deleteOrder(orderId: string) {
  await requireAuth();
  await prisma.order.delete({ where: { id: orderId } });
  revalidatePath("/");
  redirect("/");
}

export async function addNote(orderId: string, formData: FormData) {
  await requireAuth();
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;
  await prisma.note.create({ data: { orderId, text } });
  revalidatePath(`/orders/${orderId}`);
}

export async function toggleChecklistItem(itemId: string, orderId: string, checked: boolean) {
  await requireAuth();
  await prisma.checklistItem.update({
    where: { id: itemId },
    data: { isChecked: checked, checkedAt: checked ? new Date() : null },
  });
  revalidatePath(`/orders/${orderId}`);
}

export async function addChecklistItem(orderId: string, formData: FormData) {
  await requireAuth();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  const count = await prisma.checklistItem.count({ where: { orderId } });
  await prisma.checklistItem.create({
    data: { orderId, label, isDefault: false, sortOrder: count },
  });
  revalidatePath(`/orders/${orderId}`);
}

export async function deleteChecklistItem(itemId: string, orderId: string) {
  await requireAuth();
  await prisma.checklistItem.delete({ where: { id: itemId } });
  revalidatePath(`/orders/${orderId}`);
}

export async function saveCostItems(
  orderId: string,
  items: { label: string; qty: number; unitPrice: number }[],
) {
  await requireAuth();
  await prisma.$transaction([
    prisma.costItem.deleteMany({ where: { orderId } }),
    prisma.costItem.createMany({
      data: items.map((item, i) => ({
        orderId,
        label: item.label,
        qty: item.qty,
        unitPrice: item.unitPrice,
        sortOrder: i,
      })),
    }),
  ]);
  revalidatePath(`/orders/${orderId}`);
}
