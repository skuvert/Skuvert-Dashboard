export interface CostLine {
  label: string;
  qty: number;
  unitPrice: number;
}

export function lineTotal(item: CostLine): number {
  return item.qty * item.unitPrice;
}

export function costTotal(items: CostLine[]): number {
  return items.reduce((sum, item) => sum + lineTotal(item), 0);
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
  const validItems = items.filter((i) => i.label.trim());
  const lines = validItems
    .map((i) => `- ${i.label}: ${i.qty} × ${formatCHF(i.unitPrice)} = ${formatCHF(lineTotal(i))}`)
    .join("\n");
  const total = costTotal(validItems);
  const paymentBlock = paymentLink ? `\nZahlung ganz einfach hier: ${paymentLink}\n` : "";

  return `Hoi ${firstName}

Danke für deine Anfrage bei Skuvert! Hier dein persönliches Angebot:

${lines || "- (Positionen folgen)"}

Total: ${formatCHF(total)}
${paymentBlock}
Sobald die Zahlung eingegangen ist, geht's direkt in die Produktion.

Hier kannst du jederzeit den Status deiner Bestellung einsehen: ${trackingUrl}

Liebe Grüsse
Simon / Skuvert`;
}
