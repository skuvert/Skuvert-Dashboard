import { del, list, type ListBlobResultBlob } from "@vercel/blob";

// Anhänge aus dem Website-Formular liegen im PRIVATEN Blob-Store
// skuvert-anhaenge-privat unter anhang/<id>/…; lesbar nur über /anhang-datei (Login).
// Die <id> steht als Link (…/anhang/<id>) im Anfrage-Text – darüber hängen
// Dateien an einem Auftrag, ohne eigenes DB-Feld.
export const KEEP_DAYS = 60; // ttlDays; jede angefangenen 60 Tage kosten 1 Advanced Operation
export const ID_RE = /^[a-z0-9]{20}$/;

// Immer explizit übergeben: ohne Token nähme das SDK die BLOB_*-Variablen eines anderen Stores.
export function BLOB_TOKEN(): string {
  const token = process.env.ANHANG_READ_WRITE_TOKEN;
  if (!token) throw new Error("ANHANG_READ_WRITE_TOKEN fehlt");
  return token;
}

export function attachmentIds(text: string): string[] {
  return [...new Set([...text.matchAll(/\/anhang\/([a-z0-9]{20})\b/g)].map((m) => m[1]))];
}

export async function listAttachments(ids: string[]): Promise<ListBlobResultBlob[]> {
  const lists = await Promise.all(ids.map((id) => list({ prefix: `anhang/${id}/`, token: BLOB_TOKEN() })));
  return lists.flatMap((l) => l.blobs);
}

// Für <AttachmentList> (Client-Komponente): Daten serverseitig fertig formatieren.
export function toRows(blobs: ListBlobResultBlob[]) {
  return blobs.map((b) => ({
    pathname: b.pathname,
    // Pfad als Query: proxy.ts überspringt den Login bei Pfaden mit Punkt.
    href: `/anhang-datei?p=${encodeURIComponent(b.pathname)}`,
    name: b.pathname.split("/").pop()!,
    size: b.size,
    uploadedAt: new Date(b.uploadedAt).toLocaleString("de-CH", { timeZone: "Europe/Zurich" }),
    deleteOn: new Date(new Date(b.uploadedAt).getTime() + KEEP_DAYS * 86400000).toLocaleDateString("de-CH", {
      timeZone: "Europe/Zurich",
    }),
  }));
}

// Nur Dateien aus unserem Anhang-Ordner lesen/löschen.
export function isAttachmentPath(p: string): boolean {
  return /^anhang\/[a-z0-9]{20}\/[^/.][^/]*$/.test(p);
}

// Nur diese Bilder zeigt der Browser direkt an. Der Typ kommt aus der Endung, nie
// vom Uploader – sonst könnte ein als .png getarntes HTML im Dashboard laufen.
export function fileType(name: string): string | null {
  const ext = name.split(".").pop()!.toLowerCase();
  return ({ jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" } as Record<string, string>)[ext] ?? null;
}

export async function deleteAttachments(ids: string[]): Promise<number> {
  const blobs = await listAttachments(ids);
  if (blobs.length) await del(blobs.map((b) => b.pathname), { token: BLOB_TOKEN() });
  return blobs.length;
}
