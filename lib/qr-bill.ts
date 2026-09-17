import { SwissQRBill } from "swissqrbill/svg";
import type { Data } from "swissqrbill/types";

// Gläubiger (Zahlungsempfänger) — Simon Kull / Skuvert.
const CREDITOR: Data["creditor"] = {
  account: "CH2080808005042191082",
  name: "Simon Kull",
  address: "Aeglenweg",
  buildingNumber: "2",
  zip: "5608",
  city: "Stetten AG",
  country: "CH",
};

// Freitext-Lieferadresse ("Strasse Nr.\nPLZ Ort") in strukturierte
// Zahler-Felder zerlegen. Gibt undefined zurück, wenn PLZ/Ort fehlen — dann
// bleibt der Zahler-Teil leer und wird von Hand ausgefüllt (normkonform).
function parseDebtor(name: string, shippingAddress: string | null): Data["debtor"] | undefined {
  if (!name.trim() || !shippingAddress?.trim()) return undefined;
  // Nach Zeilen UND Kommas trennen; eine ggf. doppelt erfasste Namenszeile weglassen.
  const tokens = shippingAddress
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((t) => t.toLowerCase() !== name.trim().toLowerCase());
  const zipIdx = tokens.findIndex((t) => /^\d{4,5}\s+\S/.test(t));
  if (zipIdx < 0) return undefined; // ohne PLZ/Ort kein normkonformer Zahler
  const m = tokens[zipIdx].match(/^(\d{4,5})\s+(.+)$/);
  if (!m) return undefined;
  const zip = m[1];
  const city = m[2].trim();

  // Strasse = Tokens vor der PLZ-Zeile (sonst die danach) zusammengefügt.
  const before = tokens.slice(0, zipIdx).join(" ").trim();
  const streetLine = (before || tokens.slice(zipIdx + 1).join(" ")).trim();
  const sm = streetLine.match(/^(.*?)[\s]+(\d+\s*[a-zA-Z]?)$/);
  const address = (sm ? sm[1] : streetLine).trim() || city;
  const buildingNumber = sm ? sm[2].replace(/\s+/g, "") : undefined;

  return { name: name.trim(), address, buildingNumber, zip, city, country: "CH" };
}

// Erzeugt den normkonformen Swiss-QR-Zahlteil (SVG) aus den Rechnungsdaten.
// Betrag/Währung, Empfänger fix, Zahler aus dem Kundendatensatz.
export function orderQrBillSvg(params: {
  amount: number;
  customerName: string;
  shippingAddress: string | null;
  message?: string;
}): string {
  const debtor = parseDebtor(params.customerName, params.shippingAddress);
  const data: Data = {
    currency: "CHF",
    ...(params.amount > 0 ? { amount: Math.round(params.amount * 100) / 100 } : {}),
    creditor: CREDITOR,
    ...(debtor ? { debtor } : {}),
    ...(params.message?.trim() ? { message: params.message.trim().slice(0, 140) } : {}),
  };
  const svg = new SwissQRBill(data).toString();
  // viewBox ergänzen (Inhalt = 210×105 mm ≈ 793.7×396.85 px @96dpi) → responsiv skalierbar.
  return svg.replace(/<svg\s([^>]*?)>/, '<svg $1 viewBox="0 0 793.7 396.85">');
}
