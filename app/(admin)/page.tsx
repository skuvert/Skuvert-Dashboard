import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { buttonClasses } from "@/components/ui/Button";
import { INTERNAL_STATUS_ORDER, INTERNAL_STATUS_LABEL, statusPillClasses } from "@/lib/status";
import { ORDER_TYPES, orderTypeLabel } from "@/lib/order-types";
import type { InternalStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const chf = new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" });

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const { status, type } = await searchParams;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [orders, openCount, monthEntries] = await Promise.all([
    prisma.order.findMany({
      where: {
        ...(status ? { internalStatus: status as InternalStatus } : {}),
        ...(type ? { orderTypes: { has: type } } : {}),
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({
      where: { internalStatus: { notIn: ["ABGESCHLOSSEN", "STORNIERT"] } },
    }),
    prisma.ledgerEntry.findMany({ where: { date: { gte: monthStart, lt: monthEnd } } }),
  ]);

  const monthIn = monthEntries.filter((e) => e.type === "IN").reduce((s, e) => s + e.amount, 0);
  const monthOut = monthEntries.filter((e) => e.type === "OUT").reduce((s, e) => s + e.amount, 0);
  const monthLabel = now.toLocaleDateString("de-CH", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Offene Aufträge</p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-ink">{openCount}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            Einnahmen {monthLabel}
          </p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-emerald-600">
            {chf.format(monthIn)}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            Ausgaben {monthLabel}
          </p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-red-600">
            {chf.format(monthOut)}
          </p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-ink">Aufträge</h1>
        <Link href="/orders/new" className={buttonClasses("primary")}>
          + Neue Anfrage
        </Link>
      </div>

      <form className="flex flex-wrap items-center gap-3">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-xl border-2 border-border bg-white px-3 py-2 text-sm text-ink"
        >
          <option value="">Alle Status</option>
          {INTERNAL_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {INTERNAL_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select
          name="type"
          defaultValue={type ?? ""}
          className="rounded-xl border-2 border-border bg-white px-3 py-2 text-sm text-ink"
        >
          <option value="">Alle Typen</option>
          {ORDER_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.emoji} {t.label}
            </option>
          ))}
        </select>
        <button type="submit" className={buttonClasses("secondary")}>
          Filtern
        </button>
        {(status || type) && (
          <Link href="/" className={buttonClasses("ghost")}>
            Zurücksetzen
          </Link>
        )}
      </form>

      <Card className="overflow-hidden p-0">
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-muted">Keine Aufträge gefunden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-semibold">Auftrag</th>
                  <th className="px-5 py-3 font-semibold">Kunde</th>
                  <th className="px-5 py-3 font-semibold">Typ</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Versand</th>
                  <th className="px-5 py-3 font-semibold">Erstellt</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-bg/60">
                    <td className="px-5 py-3">
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-semibold text-ink hover:text-accent"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-ink">{order.customerName}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-muted">
                      {order.orderTypes.map((t) => orderTypeLabel(t)).join(", ") || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Pill className={statusPillClasses(order.internalStatus)}>
                        {INTERNAL_STATUS_LABEL[order.internalStatus]}
                      </Pill>
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {order.trackingNumber ? (
                        <span className="whitespace-nowrap font-medium text-ink">
                          📦 {order.trackingNumber}
                        </span>
                      ) : order.shippingAddress ? (
                        <span className="text-xs">Adresse erfasst</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-muted">
                      {order.createdAt.toLocaleDateString("de-CH")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
