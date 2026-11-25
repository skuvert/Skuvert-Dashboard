// Selbsttest: npx tsx scripts/check-attachments.ts
import assert from "node:assert";
import { attachmentIds, fileType, isAttachmentPath } from "../lib/attachments";

const text = "ANHANG (2)\nLink: https://skuvert-dashboard.vercel.app/anhang/5a7iuy255jt8jcbmq9ok\n- a.png\nnochmal …/anhang/5a7iuy255jt8jcbmq9ok und /anhang/zu-kurz";
assert.deepStrictEqual(attachmentIds(text), ["5a7iuy255jt8jcbmq9ok"]);
assert.deepStrictEqual(attachmentIds("keine Anhänge"), []);
assert.ok(isAttachmentPath("anhang/5a7iuy255jt8jcbmq9ok/a.png"));
for (const bad of ["andere/a.png", "anhang/5a7iuy255jt8jcbmq9ok/../x", "anhang/kurz/a.png", "https://evil.example.com/anhang/a.png", "anhang/5a7iuy255jt8jcbmq9ok/"]) assert.ok(!isAttachmentPath(bad), bad);
assert.strictEqual(fileType("x.PNG"), "image/png");
assert.strictEqual(fileType("x.stl"), null);
assert.strictEqual(fileType("x.html"), null);
console.log("ok");
