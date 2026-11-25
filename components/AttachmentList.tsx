"use client";

import { useTransition } from "react";
import { deleteAttachmentFiles } from "@/lib/actions/attachments";

export type AttachmentRow = { pathname: string; href: string; name: string; size: number; uploadedAt: string; deleteOn: string };

function fmtSize(b: number) {
  return b < 1048576 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1048576).toFixed(1)} MB`;
}

// Liste der Anhänge mit Löschen (einzeln oder alle). `path` = Seite, die danach neu lädt.
export function AttachmentList({ rows, path }: { rows: AttachmentRow[]; path: string }) {
  const [pending, startTransition] = useTransition();
  const remove = (paths: string[], question: string) => {
    if (confirm(question)) startTransition(() => deleteAttachmentFiles(paths, path));
  };

  if (rows.length === 0) {
    return <p className="text-sm text-muted">Keine Dateien (mehr) vorhanden.</p>;
  }

  const total = rows.reduce((a, r) => a + r.size, 0);
  return (
    <div className={pending ? "opacity-50" : ""}>
      <ul className="divide-y divide-border">
        {rows.map((r) => (
          <li key={r.pathname} className="flex flex-wrap items-center gap-4 py-3">
            {/\.(jpe?g|png|webp)$/i.test(r.name) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.href} alt="" className="h-16 w-16 rounded-lg border border-border object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <a href={r.href} target="_blank" rel="noreferrer" className="break-all font-semibold text-accent hover:underline">
                {r.name}
              </a>
              <div className="text-xs text-muted">
                {fmtSize(r.size)} · hochgeladen {r.uploadedAt} · wird automatisch gelöscht am {r.deleteOn}
              </div>
            </div>
            <a href={`${r.href}&download=1`} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">
              Herunterladen
            </a>
            <button
              type="button"
              disabled={pending}
              onClick={() => remove([r.pathname], `„${r.name}“ endgültig löschen?`)}
              className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
            >
              Löschen
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm text-muted">
        <span>
          {rows.length} {rows.length === 1 ? "Datei" : "Dateien"} · {fmtSize(total)} vom 1-GB-Speicher
        </span>
        {rows.length > 1 && (
          <button
            type="button"
            disabled={pending}
            onClick={() => remove(rows.map((r) => r.pathname), `Alle ${rows.length} Dateien endgültig löschen?`)}
            className="font-semibold text-red-600 hover:underline disabled:opacity-50"
          >
            {pending ? "Löscht…" : "Alle löschen"}
          </button>
        )}
      </div>
    </div>
  );
}
