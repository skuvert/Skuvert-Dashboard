import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { AttachmentList } from "@/components/AttachmentList";
import { ID_RE, KEEP_DAYS, listAttachments, toRows } from "@/lib/attachments";

// Anhänge einer Website-Anfrage. Der Link (…/anhang/<id>) steht im Mail- bzw.
// WhatsApp-Text; die Seite ist durch den Login geschützt (proxy.ts).
export const dynamic = "force-dynamic";

export default async function AnhangPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ID_RE.test(id)) notFound();

  const rows = toRows(await listAttachments([id]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Anhänge der Anfrage</h1>
        <p className="mt-1 text-sm text-muted">
          Hochgeladen über das Bestellformular der Website. Die Dateien werden {KEEP_DAYS} Tage nach dem
          Hochladen automatisch gelöscht. Sobald du daraus einen Auftrag anlegst (Anfrage-Text inkl.
          Link einfügen), erscheinen sie auch dort und werden mit dem Auftrag gelöscht.
        </p>
      </div>

      <Card>
        <AttachmentList rows={rows} path={`/anhang/${id}`} />
      </Card>
    </div>
  );
}
