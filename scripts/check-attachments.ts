// Selbsttest: npx tsx scripts/check-attachments.ts
import assert from "node:assert";
import { attachmentIds, isAttachmentUrl } from "../lib/attachments";

const text = "ANHANG (2)\nLink: https://skuvert-dashboard.vercel.app/anhang/5a7iuy255jt8jcbmq9ok\n- a.png\nnochmal …/anhang/5a7iuy255jt8jcbmq9ok und /anhang/zu-kurz";
assert.deepStrictEqual(attachmentIds(text), ["5a7iuy255jt8jcbmq9ok"]);
assert.deepStrictEqual(attachmentIds("keine Anhänge"), []);
assert.ok(isAttachmentUrl("https://qapfgwfujcaff1xu.public.blob.vercel-storage.com/anhang/x/a.png"));
assert.ok(!isAttachmentUrl("https://qapfgwfujcaff1xu.public.blob.vercel-storage.com/andere/a.png"));
assert.ok(!isAttachmentUrl("https://evil.example.com/anhang/a.png"));
console.log("ok");
