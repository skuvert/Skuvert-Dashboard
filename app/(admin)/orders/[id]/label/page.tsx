import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SENDER_ADDRESS } from "@/lib/sender-address";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function ShippingLabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { orderNumber: true, customerName: true, shippingAddress: true },
  });

  if (!order) notFound();

  return (
    <div className="space-y-6">
      {/* Auf der Etiketten-Seite die obere Navigationsleiste ausblenden
          (am Bildschirm und im Druck) — nur solange diese Seite offen ist. */}
      <style>{`#admin-nav{display:none!important} main{padding-top:1.5rem!important}`}</style>

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/orders/${id}`} className="text-sm font-semibold text-muted hover:text-ink">
          ← Zurück zum Auftrag
        </Link>
        <PrintButton />
      </div>

      {!order.shippingAddress && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 print:hidden">
          Noch keine Lieferadresse hinterlegt — trag sie zuerst bei den Stammdaten des Auftrags ein.
        </p>
      )}

      <div className="print-label mx-auto space-y-8 rounded-2xl border-2 border-dashed border-border bg-white p-8 print:border-black">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Absender</p>
          <p className="whitespace-pre-line text-sm text-ink">{SENDER_ADDRESS.join("\n")}</p>
        </div>

        <div className="border-t border-border pt-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Empfänger</p>
          <p className="text-xl font-bold text-ink">{order.customerName}</p>
          <p className="whitespace-pre-line text-base text-ink">
            {order.shippingAddress || "— Lieferadresse fehlt —"}
          </p>
        </div>

        <p className="text-xs text-muted">Ref: {order.orderNumber}</p>
      </div>
    </div>
  );
}
