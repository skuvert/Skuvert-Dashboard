import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { BLOB_TOKEN, KEEP_DAYS } from "@/lib/attachments";
import { isRateLimited, registerFailedAttempt } from "@/lib/login-rate-limit";

// Öffentliche Upload-Route für Anhänge aus dem Bestellformular der Website.
// Sie stellt nur kurzlebige Upload-Tokens aus; die Datei geht vom Browser direkt
// in Vercel Blob (umgeht das 4.5-MB-Limit von Functions). Ansehen kann man die
// Dateien nur eingeloggt unter /anhang/<id>. In proxy.ts vom Login ausgenommen.
export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Muss zu FILE_ACCEPT in GitHub/script.js passen.
const EXT = "jpg|jpeg|png|webp|heic|pdf|mp4|mov|stl|obj|step|stp|3mf|dxf|dwg|f3d";
const PATH_RE = new RegExp(`^anhang/[a-z0-9]{20}/[^/]{1,120}\\.(${EXT})$`, "i");
const MAX_BYTES = 25 * 1024 * 1024;
const TOKENS_PER_HOUR = 40; // = Dateien pro Stunde und IP

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  try {
    const body = (await request.json()) as HandleUploadBody;
    const json = await handleUpload({
      token: BLOB_TOKEN(),
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!PATH_RE.test(pathname)) throw new Error("Dateityp oder Name nicht erlaubt");
        const key = `upload:${ip}`;
        if (await isRateLimited(key, TOKENS_PER_HOUR, 3600_000)) throw new Error("Zu viele Uploads – bitte später nochmals");
        await registerFailedAttempt(key, 3600_000);
        return {
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
          ttlDays: KEEP_DAYS,
          validUntil: Date.now() + 15 * 60_000,
        };
      },
    });
    return NextResponse.json(json, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400, headers: CORS });
  }
}
