import { del, list, type ListBlobResultBlob } from "@vercel/blob";

// Anhänge aus dem Website-Formular liegen in Vercel Blob unter anhang/<id>/…
// Die <id> steht als Link (…/anhang/<id>) im Anfrage-Text – darüber hängen
// Dateien an einem Auftrag, ohne eigenes DB-Feld.
export const KEEP_DAYS = 90; // = ttlDays in app/api/anhang/route.ts
export const ID_RE = /^[a-z0-9]{20}$/;

export function attachmentIds(text: string): string[] {
  return [...new Set([...text.matchAll(/\/anhang\/([a-z0-9]{20})\b/g)].map((m) => m[1]))];
}

export async function listAttachments(ids: string[]): Promise<ListBlobResultBlob[]> {
  const lists = await Promise.all(ids.map((id) => list({ prefix: `anhang/${id}/` })));
  return lists.flatMap((l) => l.blobs);
}

// Für <AttachmentList> (Client-Komponente): Daten serverseitig fertig formatieren.
export function toRows(blobs: ListBlobResultBlob[]) {
  return blobs.map((b) => ({
    url: b.url,
    downloadUrl: b.downloadUrl,
    name: b.pathname.split("/").pop()!,
    size: b.size,
    uploadedAt: new Date(b.uploadedAt).toLocaleString("de-CH"),
    deleteOn: new Date(new Date(b.uploadedAt).getTime() + KEEP_DAYS * 86400000).toLocaleDateString("de-CH"),
  }));
}

// Nur Dateien aus unserem Anhang-Ordner löschen (Schutz vor beliebigen URLs).
export function isAttachmentUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname.endsWith(".public.blob.vercel-storage.com") && u.pathname.startsWith("/anhang/");
  } catch {
    return false;
  }
}

export async function deleteAttachments(ids: string[]): Promise<number> {
  const blobs = await listAttachments(ids);
  if (blobs.length) await del(blobs.map((b) => b.url));
  return blobs.length;
}
