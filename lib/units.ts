// Vereinheitlicht Einheiten-Eingaben zu Kurzform (h, g, kg, Stk. …).
// Entfernt ein oft mit-getipptes Preis-Präfix ("CHF / Stunde" → "h") und
// übersetzt ausgeschriebene Formen. Unbekanntes bleibt unverändert.
export function normalizeUnit(raw: string | null | undefined): string {
  let u = (raw ?? "").trim();
  if (!u) return "";
  u = u.replace(/^chf\s*\/\s*/i, "").trim(); // "CHF / Stunde" → "Stunde"
  const low = u.toLowerCase();
  if (/^stunden?$/.test(low) || low === "std" || low === "std.") return "h";
  if (/^(gramm|gr)$/.test(low)) return "g";
  if (/^(kilogramm|kilo)$/.test(low)) return "kg";
  if (/^(stück|stueck|stk)$/.test(low)) return "Stk.";
  if (/^(meter)$/.test(low)) return "m";
  if (low === "chf" || low === "fr" || low === "fr.") return ""; // reiner Preis, keine Einheit
  return u;
}

if (process.argv[1] && import.meta.url === require("url").pathToFileURL(process.argv[1]).href) {
  const eq = (a: string, b: string) => console.assert(normalizeUnit(a) === b, `${a} -> ${normalizeUnit(a)} (erwartet ${b})`);
  eq("CHF / Stunde", "h");
  eq("CHF / g", "g");
  eq("Stunde", "h");
  eq("Gramm", "g");
  eq("CHF", "");
  eq("h", "h");
  eq("Stk.", "Stk.");
  eq("", "");
  console.log("units self-check passed");
}
