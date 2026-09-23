// Position (Kostenzeile). kind unterscheidet reguläre Zeilen von Rabatten:
//  - "line"          normale Position: Betrag = qty × unitPrice
//  - "discountPct"   prozentualer Rabatt: unitPrice = Prozentwert (z. B. 10),
//                    Betrag = − (Zwischensumme der regulären Zeilen × pct/100)
//  - "discountFixed" fester Rabatt in CHF: unitPrice = Betrag, Betrag = −unitPrice
export type CostKind = "line" | "discountPct" | "discountFixed";

export interface CostLine {
  label: string;
  qty: number;
  unit: string;
  unitPrice: number;
  // Wert eines CostKind; als string typisiert, damit Prisma-Rows (kind: string) direkt passen.
  kind?: string; // fehlt/"line" => reguläre Position
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function isDiscount(item: CostLine): boolean {
  return item.kind === "discountPct" || item.kind === "discountFixed";
}

// "2.5 h" bzw. "3" — Menge mit optionaler Einheit.
export function formatQty(item: { qty: number; unit?: string }): string {
  return item.unit?.trim() ? `${item.qty} ${item.unit.trim()}` : `${item.qty}`;
}

// Betrag einer regulären Zeile (ohne Rabatt-Logik).
export function lineTotal(item: CostLine): number {
  return item.qty * item.unitPrice;
}

// Zwischensumme der regulären Positionen (Bezugsgrösse für prozentuale Rabatte).
export function subtotal(items: CostLine[]): number {
  return round2(items.filter((i) => !isDiscount(i)).reduce((s, i) => s + i.qty * i.unitPrice, 0));
}

// Vorzeichenbehafteter Betrag einer einzelnen Zeile (Rabatte negativ).
// Prozentuale Rabatte beziehen sich immer auf die reguläre Zwischensumme `sub`.
export function lineAmount(item: CostLine, sub: number): number {
  if (item.kind === "discountPct") return -round2(sub * (Math.abs(item.unitPrice) / 100));
  if (item.kind === "discountFixed") return -Math.abs(item.unitPrice);
  return round2(item.qty * item.unitPrice);
}

// Gesamttotal: reguläre Zwischensumme minus alle Rabatte (vor Steuer – hier ohne MwSt).
export function costTotal(items: CostLine[]): number {
  const sub = subtotal(items);
  const discounts = items.filter(isDiscount).reduce((s, i) => s + lineAmount(i, sub), 0);
  return round2(sub + discounts);
}

export function formatCHF(amount: number): string {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(amount);
}

export function buildEmailText(params: {
  customerName: string;
  items: CostLine[];
  paymentLink: string;
  trackingUrl: string;
}): string {
  const { customerName, items, paymentLink, trackingUrl } = params;
  const firstName = customerName.trim().split(/\s+/)[0] || "zusammen";
  const validItems = items.filter((i) => i.label.trim() || isDiscount(i));
  const regular = validItems.filter((i) => !isDiscount(i));
  const discounts = validItems.filter(isDiscount);
  const sub = subtotal(validItems);

  const regularLines = regular
    .map((i) => `- ${i.label}: ${formatQty(i)} × ${formatCHF(i.unitPrice)} = ${formatCHF(lineTotal(i))}`)
    .join("\n");

  let block = regularLines || "- (Positionen folgen)";
  if (discounts.length) {
    block += `\nZwischensumme: ${formatCHF(sub)}`;
    for (const d of discounts) {
      const pct = d.kind === "discountPct" ? ` (−${Math.abs(d.unitPrice)}%)` : "";
      block += `\n- ${d.label.trim() || "Rabatt"}${pct}: ${formatCHF(lineAmount(d, sub))}`;
    }
  }

  const total = costTotal(validItems);
  const paymentBlock = paymentLink ? `\nZahlung ganz einfach hier: ${paymentLink}\n` : "";

  return `Hoi ${firstName}

Danke für deine Anfrage bei Skuvert! Hier dein persönliches Angebot:

${block}

Total: ${formatCHF(total)}
${paymentBlock}
Sobald die Zahlung eingegangen ist, geht's direkt in die Produktion.

Hier kannst du jederzeit den Status deiner Bestellung einsehen: ${trackingUrl}

Liebe Grüsse
Simon / Skuvert`;
}
