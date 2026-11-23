import { notFound } from "next/navigation";
import { list } from "@vercel/blob";
import { Card } from "@/components/ui/Card";

// Anhänge einer Website-Anfrage. Der Link (…/anhang/<id>) steht im Mail- bzw.
// WhatsApp-Text; die Seite ist durch den Login geschützt (proxy.ts).
export const dynamic = "force-dynamic";

const KEEP_DAYS = 90; // wie ttlDays in app/api/anhang/route.ts

function fmtSize(b: number) {
  return b < 1048576 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1048576).toFixed(1)} MB`;
}

export default async function AnhangPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9]{20}$/.test(id)) notFound();

  const { blobs } = await list({ prefix: `anhang/${id}/` });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Anhänge der Anfrage</h1>
        <p className="mt-1 text-sm text-muted">
          Hochgeladen über das Bestellformular der Website. Die Dateien werden {KEEP_DAYS} Tage nach dem
          Hochladen automatisch gelöscht – bei Bedarf herunterladen und beim Auftrag ablegen.
        </p>
      </div>

      <Card>
        {blobs.length === 0 ? (
          <p className="text-sm text-muted">
            Keine Dateien gefunden – entweder ist der Upload fehlgeschlagen oder die Dateien sind bereits gelöscht.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {blobs.map((b) => {
              const name = b.pathname.split("/").pop()!;
              const isImage = /\.(jpe?g|png|webp)$/i.test(name);
              const deleteOn = new Date(new Date(b.uploadedAt).getTime() + KEEP_DAYS * 86400000);
              return (
                <li key={b.pathname} className="flex flex-wrap items-center gap-4 py-3">
                  {isImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.url} alt="" className="h-16 w-16 rounded-lg border border-border object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <a href={b.url} target="_blank" rel="noreferrer" className="break-all font-semibold text-accent hover:underline">
                      {name}
                    </a>
                    <div className="text-xs text-muted">
                      {fmtSize(b.size)} · hochgeladen {new Date(b.uploadedAt).toLocaleString("de-CH")} · wird gelöscht am {deleteOn.toLocaleDateString("de-CH")}
                    </div>
                  </div>
                  <a href={b.downloadUrl} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">
                    Herunterladen
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
