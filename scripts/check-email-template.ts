import assert from "node:assert";
import { costTotal, formatCHF, buildEmailText } from "../lib/email-template";

assert.strictEqual(costTotal([]), 0);
assert.strictEqual(
  costTotal([
    { label: "Druck", qty: 2, unitPrice: 12.5 },
    { label: "Design", qty: 1, unitPrice: 25 },
  ]),
  50,
);
assert.match(formatCHF(15), /CHF\s*15\.00/);

const text = buildEmailText({
  customerName: "Anna Muster",
  items: [{ label: "Druck", qty: 1, unitPrice: 20 }],
  paymentLink: "https://paypal.me/skuvert/20",
  trackingUrl: "https://dashboard.skuvert.ch/status/abc123",
});
assert.match(text, /Hoi Anna/);
assert.match(text, /Total:\s*CHF\s*20\.00/);
assert.match(text, /paypal\.me\/skuvert\/20/);
assert.match(text, /status\/abc123/);

// leerer Kundenname darf nicht crashen
buildEmailText({ customerName: "", items: [], paymentLink: "", trackingUrl: "x" });

console.log("check-email-template: OK");
