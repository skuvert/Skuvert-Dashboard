import { get } from "@vercel/blob";
import { requireAuth } from "@/lib/auth";
import { BLOB_TOKEN, fileType, isAttachmentPath } from "@/lib/attachments";

// Liefert eine private Kundendatei aus – nur eingeloggt (proxy.ts UND hier geprüft).
// Wird gestreamt, damit auch Dateien über 4.5 MB durchgehen.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAuth();
  } catch {
    return new Response("Nicht autorisiert.", { status: 401 });
  }
  const params = new URL(request.url).searchParams;
  const pathname = params.get("p") ?? "";
  if (!isAttachmentPath(pathname)) return new Response("Nicht gefunden.", { status: 404 });

  const file = await get(pathname, { access: "private", token: BLOB_TOKEN() });
  if (!file || file.statusCode !== 200) return new Response("Nicht gefunden.", { status: 404 });

  const name = pathname.split("/").pop()!;
  const type = fileType(name);
  const inline = type && !params.has("download");
  return new Response(file.stream, {
    headers: {
      "Content-Type": type ?? "application/octet-stream",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
