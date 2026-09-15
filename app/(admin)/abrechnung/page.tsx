import { prisma } from "@/lib/prisma";
import { Ledger, type Row } from "./Ledger";

export const dynamic = "force-dynamic";

export default async function AbrechnungPage() {
  const [entries, profileRow, orders] = await Promise.all([
    prisma.ledgerEntry.findMany({
      orderBy: { date: "desc" },
      include: { order: { select: { orderNumber: true } } },
    }),
    prisma.ledgerProfile.findUnique({ where: { id: "default" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, orderNumber: true } }),
  ]);

  const rows: Row[] = entries.map((e) => ({
    id: e.id,
    date: e.date.toISOString().slice(0, 10),
    type: e.type === "IN" ? "in" : "out",
    amount: e.amount,
    category: e.category,
    description: e.description,
    party: e.party,
    receipt: e.receipt,
    orderId: e.orderId,
    orderNumber: e.order?.orderNumber ?? null,
  }));

  const profile = {
    name: profileRow?.name ?? "",
    addr: profileRow?.addr ?? "",
    taxId: profileRow?.taxId ?? "",
    place: profileRow?.place ?? "",
    iban: profileRow?.iban ?? "",
  };

  return <Ledger entries={rows} profile={profile} orders={orders} />;
}
