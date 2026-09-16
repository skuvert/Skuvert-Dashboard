import assert from "node:assert";
import { costTotal, formatCHF, buildEmailText } from "../lib/email-template";

assert.strictEqual(costTotal([]), 0);
assert.strictEqual(
  costTotal([
    { label: "Druck", qty: 2, unit: "Stk.", unitPrice: 12.5 },
    { label: "Design", qty: 1, unit: "h", unitPrice: 25 },
  ]),
  50,
);
assert.match(formatCHF(15), /CHF\s*15\.00/);

const text = buildEmailText({
  customerName: "Anna Muster",
  items: [{ label: "Konstruktion", qty: 2.5, unit: "h", unitPrice: 25 }],
  paymentLink: "https://paypal.me/skuvert/20",
  trackingUrl: "https://dashboard.skuvert.ch/status/abc123",
});
assert.match(text, /Hoi Anna/);
assert.match(text, /Konstruktion:\s*2\.5 h ×/); // Einheit erscheint bei der Menge
assert.match(text, /Total:\s*CHF\s*62\.50/);
assert.match(text, /paypal\.me\/skuvert\/20/);
assert.match(text, /status\/abc123/);

// Menge ohne Einheit: nur die Zahl, kein nachgestelltes Leerzeichen
const noUnit = buildEmailText({
  customerName: "B",
  items: [{ label: "Pauschale", qty: 1, unit: "", unitPrice: 10 }],
  paymentLink: "",
  trackingUrl: "x",
});
assert.match(noUnit, /Pauschale:\s*1 ×/);

// leerer Kundenname darf nicht crashen
buildEmailText({ customerName: "", items: [], paymentLink: "", trackingUrl: "x" });

console.log("check-email-template: OK");
