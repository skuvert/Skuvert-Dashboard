import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { CopyButton } from "@/components/ui/CopyButton";
import { INTERNAL_STATUS_LABEL, statusPillClasses } from "@/lib/status";
import { StammdatenForm } from "./StammdatenForm";
import { OrderTypesEditor } from "./OrderTypesEditor";
import { StatusControls } from "./StatusControls";
import { ChecklistSection } from "./ChecklistSection";
import { NotesSection } from "./NotesSection";
import { CustomerNoteSection } from "./CustomerNoteSection";
import { EmailGenerator } from "./EmailGenerator";
import { DeleteOrderButton } from "./DeleteOrderButton";
import { BookingSection } from "./BookingSection";
import { AttachmentList, type AttachmentRow } from "@/components/AttachmentList";
import { attachmentIds, KEEP_DAYS, listAttachments, toRows } from "@/lib/attachments";

export const dynamic = "force-dynamic";

async function getTrackingUrl(token: string) {
  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost:3000";
  const proto = hdrs.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/status/${token}`;
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [order, priceList] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        notes: { orderBy: { createdAt: "desc" } },
        costItems: { orderBy: { sortOrder: "asc" } },
        checklistItems: { orderBy: { sortOrder: "asc" } },
        ledgerEntries: { orderBy: { type: "asc" } },
      },
    }),
    prisma.ownPriceRow.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!order) notFound();

  const trackingUrl = await getTrackingUrl(order.trackingToken);

  // Anhänge über den Link im Anfrage-Text finden; Blob-Fehler sollen die Seite nicht kippen.
  const attachIds = attachmentIds(order.rawRequestText);
  let attachRows: AttachmentRow[] | null = [];
  if (attachIds.length) {
    try {
      attachRows = toRows(await listAttachments(attachIds));
    } catch {
      attachRows = null;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm font-semibold text-muted hover:text-ink">
          ← Zur Übersicht
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">{order.orderNumber}</h1>
          <p className="text-sm text-muted">
            Erstellt am {order.createdAt.toLocaleDateString("de-CH")} · {order.customerName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/orders/${order.id}/invoice`}
            className="text-sm font-semibold text-accent hover:underline"
          >
            Rechnung →
          </Link>
          <Link
            href={`/orders/${order.id}/label`}
            className="text-sm font-semibold text-accent hover:underline"
          >
            Versandetikett →
          </Link>
          <Pill className={statusPillClasses(order.internalStatus)}>
            {INTERNAL_STATUS_LABEL[order.internalStatus]}
          </Pill>
          {order.internalStatus === "ABGESCHLOSSEN" && <DeleteOrderButton orderId={order.id} />}
        </div>
      </div>

      <Card className="space-y-5">
        <h2 className="text-lg font-bold text-ink">Stammdaten</h2>
        <StammdatenForm order={order} />
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink">Auftragstyp</p>
          <OrderTypesEditor orderId={order.id} initial={order.orderTypes} />
        </div>
      </Card>

      {attachIds.length > 0 && (
        <Card className="space-y-3">
          <h2 className="text-lg font-bold text-ink">Anhänge</h2>
          <p className="text-sm text-muted">
            Vom Kunden über das Website-Formular hochgeladen. Wird der Auftrag gelöscht, werden diese
            Dateien mitgelöscht; sonst automatisch {KEEP_DAYS} Tage nach dem Hochladen.
          </p>
          {attachRows ? (
            <AttachmentList rows={attachRows} path={`/orders/${order.id}`} />
          ) : (
            <p className="text-sm text-red-600">Anhänge konnten gerade nicht geladen werden.</p>
          )}
        </Card>
      )}

      <Card className="space-y-4">
        <h2 className="text-lg font-bold text-ink">Status</h2>
        <StatusControls orderId={order.id} internalStatus={order.internalStatus} />
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-ink">Kunden-Tracking-Link</h2>
        <p className="text-sm text-muted">
          Zeigt nur den vereinfachten Kunden-Status, keine internen Details. Wird automatisch in den
          E-Mail-Entwurf eingefügt.
        </p>
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-bg px-4 py-3">
          <code className="flex-1 truncate text-sm text-ink">{trackingUrl}</code>
          <CopyButton text={trackingUrl} />
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-ink">Kundennotiz (öffentlich)</h2>
        <p className="text-sm text-muted">
          Optionaler Freitext, den der Kunde in der Status-Ansicht sieht (z. B. „12 von 40
          fertiggestellt“). Leer lassen = wird nicht angezeigt.
        </p>
        <CustomerNoteSection orderId={order.id} initialNote={order.customerNote ?? ""} />
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-bold text-ink">Checkliste</h2>
        <ChecklistSection orderId={order.id} items={order.checklistItems} />
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-bold text-ink">Notizen / Stand</h2>
        <NotesSection
          orderId={order.id}
          notes={order.notes.map((n) => ({
            id: n.id,
            text: n.text,
            createdAt: n.createdAt.toLocaleString("de-CH"),
          }))}
        />
      </Card>

      <Card className="space-y-5">
        <h2 className="text-lg font-bold text-ink">Angebots-E-Mail</h2>
        <EmailGenerator
          orderId={order.id}
          customerName={order.customerName}
          initialItems={order.costItems.map((c) => ({
            label: c.label,
            qty: c.qty,
            unit: c.unit,
            unitPrice: c.unitPrice,
            kind: c.kind,
          }))}
          initialPaymentLink={order.paymentLink ?? ""}
          trackingUrl={trackingUrl}
          priceList={priceList}
        />
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-bold text-ink">Abrechnung</h2>
        <BookingSection
          orderId={order.id}
          entries={order.ledgerEntries.map((e) => ({
            id: e.id,
            type: e.type === "IN" ? "in" : "out",
            amount: e.amount,
            category: e.category,
            description: e.description,
          }))}
        />
      </Card>

      <details className="rounded-2xl border border-border bg-surface p-6">
        <summary className="cursor-pointer text-sm font-semibold text-muted">
          Ursprüngliche Anfrage anzeigen
        </summary>
        <pre className="mt-4 whitespace-pre-wrap text-sm text-ink">{order.rawRequestText}</pre>
      </details>
    </div>
  );
}
