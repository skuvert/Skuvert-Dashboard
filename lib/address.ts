// ponytail: naive two-line heuristic (Strasse Nr. \n PLZ Ort), keine Mehrländer-
// Erkennung. Manuelles Nachbessern im Textfeld bleibt immer möglich.
const ADDRESS_REGEX = /([^\n]*\d[^\n]*)\r?\n\s*(\d{4}\s+[A-Za-zÀ-ÖØ-öø-ÿ'’.\- ]+)/;

export function extractAddress(text: string): string {
  const match = text.match(ADDRESS_REGEX);
  if (!match) return "";
  return `${match[1].trim()}\n${match[2].trim()}`;
}

// Self-check: `npx tsx lib/address.ts`
if (process.argv[1] && import.meta.url === require("url").pathToFileURL(process.argv[1]).href) {
  console.assert(
    extractAddress("Hoi\nMusterstrasse 12\n8000 Zürich\nDanke!") === "Musterstrasse 12\n8000 Zürich",
    "should extract street + PLZ/Ort",
  );
  console.assert(extractAddress("Hoi, kein Adresse hier.") === "", "should return empty without match");
  console.assert(
    extractAddress("Route de la Gare 4\n1201 Genève") === "Route de la Gare 4\n1201 Genève",
    "should handle accented city names",
  );
  console.log("address.ts self-check passed");
}
