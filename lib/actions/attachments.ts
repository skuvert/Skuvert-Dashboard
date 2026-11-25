"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { requireAuth } from "@/lib/auth";
import { BLOB_TOKEN, isAttachmentPath } from "@/lib/attachments";

export async function deleteAttachmentFiles(paths: string[], path: string) {
  await requireAuth();
  const ok = paths.filter(isAttachmentPath);
  if (ok.length) await del(ok, { token: BLOB_TOKEN() });
  revalidatePath(path);
}
