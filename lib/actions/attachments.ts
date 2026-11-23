"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { requireAuth } from "@/lib/auth";
import { isAttachmentUrl } from "@/lib/attachments";

export async function deleteAttachmentFiles(urls: string[], path: string) {
  await requireAuth();
  const ok = urls.filter(isAttachmentUrl);
  if (ok.length) await del(ok);
  revalidatePath(path);
}
