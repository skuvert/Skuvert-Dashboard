"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildDefaultChecklist } from "@/lib/order-types";
import type { InternalStatus, CustomerStatus } from "@prisma/client";

function isUniqueConstraintError(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && e.code === "P2002";
}

export type FormState = { error?: string };

export async function createOrder(_prev: FormState, formData: FormData): Promise<FormState> {
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
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim();
  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  const paymentLink = String(formData.get("paymentLink") ?? "").trim();

  if (!customerName) return { error: "Bitte einen Kundennamen angeben." };
  if (!orderNumber) return { error: "Bitte eine Auftragsnummer angeben." };

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { customerName, customerEmail, orderNumber, paymentLink: paymentLink || null },
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
  await prisma.order.update({ where: { id: orderId }, data: { orderTypes } });
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/");
}

export async function updateInternalStatus(orderId: string, internalStatus: InternalStatus) {
  await prisma.order.update({ where: { id: orderId }, data: { internalStatus } });
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/");
}

export async function updateCustomerStatus(orderId: string, customerStatus: CustomerStatus) {
  await prisma.order.update({ where: { id: orderId }, data: { customerStatus } });
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/");
}

export async function addNote(orderId: string, formData: FormData) {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;
  await prisma.note.create({ data: { orderId, text } });
  revalidatePath(`/orders/${orderId}`);
}

export async function toggleChecklistItem(itemId: string, orderId: string, checked: boolean) {
  await prisma.checklistItem.update({
    where: { id: itemId },
    data: { isChecked: checked, checkedAt: checked ? new Date() : null },
  });
  revalidatePath(`/orders/${orderId}`);
}

export async function addChecklistItem(orderId: string, formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  const count = await prisma.checklistItem.count({ where: { orderId } });
  await prisma.checklistItem.create({
    data: { orderId, label, isDefault: false, sortOrder: count },
  });
  revalidatePath(`/orders/${orderId}`);
}

export async function deleteChecklistItem(itemId: string, orderId: string) {
  await prisma.checklistItem.delete({ where: { id: itemId } });
  revalidatePath(`/orders/${orderId}`);
}

export async function saveCostItems(
  orderId: string,
  items: { label: string; qty: number; unitPrice: number }[],
) {
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
