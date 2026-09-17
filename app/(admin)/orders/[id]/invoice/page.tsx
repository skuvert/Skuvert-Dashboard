import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SENDER_ADDRESS } from "@/lib/sender-address";
import { formatCHF, formatQty } from "@/lib/email-template";
import { orderQrBillSvg } from "@/lib/qr-bill";
import { InvoiceActions } from "./InvoiceActions";

export const dynamic = "force-dynamic";

const round2 = (n: number) => Math.round(n * 100) / 100;

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [order, profile] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: { costItems: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.ledgerProfile.findUnique({ where: { id: "default" } }),
  ]);
  if (!order) notFound();

  type Line = { label: string; qty: number; unit: string; unitPrice: number; total: number };
  const lines: Line[] = order.costItems.map((c) => ({
    label: c.label,
    qty: c.qty,
    unit: c.unit,
    unitPrice: c.unitPrice,
    total: round2(c.qty * c.unitPrice),
  }));
  const total = round2(lines.reduce((s, l) => s + l.total, 0));

  const senderName = profile?.name?.trim() || SENDER_ADDRESS[0];
  const senderLines = profile?.addr?.trim()
    ? profile.addr.split(/,\s*|\n/).map((s) => s.trim()).filter(Boolean)
    : SENDER_ADDRESS.slice(1);
  const today = new Date().toLocaleDateString("de-CH");

  // Swiss-QR-Zahlteil serverseitig aus denselben Rechnungsdaten (Betrag = Total,
  // Zahler = Kunde) — bleibt bei Änderungen automatisch korrekt.
  const qrSvg = lines.length
    ? orderQrBillSvg({
        amount: total,
        customerName: order.customerName,
        shippingAddress: order.shippingAddress,
        message: `Rechnung ${order.orderNumber}`,
      })
    : null;

  return (
    <div className="space-y-6">
      <style>{`
        #admin-nav{display:none!important}
        main{padding-top:1.5rem!important}
        .qr-bill svg{ width:100%; height:auto; display:block; }
        @media print {
          .no-print{display:none!important}
          body{background:#fff}
          .qr-bill{ max-width:none!important; break-inside:avoid; margin-top:8mm; }
          .qr-bill svg{ width:210mm; height:105mm; }
        }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <Link href={`/orders/${id}`} className="text-sm font-semibold text-muted hover:text-ink">
          ← Zurück zum Auftrag
        </Link>
        <InvoiceActions />
      </div>

      {lines.length === 0 && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 no-print">
          Noch keine Positionen. Trag Kostenpositionen im Angebots-E-Mail-Bereich ein (z. B.
          „Konstruktion" 1 × 60.–) — sie erscheinen dann auf der Rechnung.
        </p>
      )}

      {/* Rechnungsblatt */}
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-white p-10 text-sm text-ink shadow-sm print:border-0 print:shadow-none">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-lg font-extrabold tracking-wide">{senderName}</p>
            {senderLines.map((l, i) => (
              <p key={i} className="text-muted">
                {l}
              </p>
            ))}
            {profile?.taxId?.trim() && <p className="text-muted">UID: {profile.taxId}</p>}
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold uppercase tracking-widest text-accent">Rechnung</p>
            <p className="mt-2 text-muted">Nr. {order.orderNumber}</p>
            <p className="text-muted">Datum: {today}</p>
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Rechnung an</p>
          <p className="font-semibold">{order.customerName}</p>
          {order.shippingAddress && (
            <p className="whitespace-pre-line text-muted">{order.shippingAddress}</p>
          )}
        </div>

        <table className="mt-8 w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-2 font-semibold">Position</th>
              <th className="py-2 text-right font-semibold">Menge</th>
              <th className="py-2 pl-10 text-right font-semibold">Einzelpreis</th>
              <th className="py-2 pl-8 text-right font-semibold">Betrag</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i} className="border-b border-border">
                <td className="py-2 pr-3">{l.label}</td>
                <td className="py-2 text-right tabular-nums">{formatQty(l)}</td>
                <td className="py-2 pl-10 text-right tabular-nums">{formatCHF(l.unitPrice)}</td>
                <td className="py-2 pl-8 text-right font-semibold tabular-nums">
                  {formatCHF(l.total)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="py-3 text-right text-sm font-semibold">
                Gesamtbetrag
              </td>
              <td className="py-3 text-right text-lg font-extrabold text-accent tabular-nums">
                {formatCHF(total)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-8 space-y-1 border-t border-border pt-5 text-muted">
          <p className="font-semibold text-ink">Zahlbar innert 30 Tagen.</p>
          {qrSvg && <p>Bezahle bequem mit dem QR-Zahlteil unten.</p>}
          {order.paymentLink && <p>Oder online: {order.paymentLink}</p>}
          <p className="pt-3">Vielen Dank für deinen Auftrag.</p>
        </div>
      </div>

      {/* Schweizer QR-Rechnung – Zahlteil (normkonform, 210×105 mm) */}
      {qrSvg && (
        <div
          className="qr-bill mx-auto max-w-2xl overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
      )}
    </div>
  );
}
