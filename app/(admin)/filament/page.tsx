import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { FilamentManager } from "./FilamentManager";

export const dynamic = "force-dynamic";

export default async function FilamentPage() {
  const spools = await prisma.filamentSpool.findMany({ orderBy: { sortOrder: "asc" } });
  const rows = spools.map((s) => ({
    id: s.id,
    material: s.material as "PLA" | "PETG" | "ABS" | "TPU",
    colorName: s.colorName,
    colorHex: s.colorHex,
    count: s.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Filament-Bestand</h1>
        <p className="mt-1 text-sm text-muted">
          Deine 1-kg-Spulen. Diese Liste steuert direkt die Material-/Farbauswahl auf der{" "}
          <a
            href="https://skuvert.github.io"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-accent hover:underline"
          >
            Website
          </a>{" "}
          — geht eine Farbe aus (Anzahl 0 oder entfernt), verschwindet sie dort automatisch.
        </p>
      </div>

      <Card>
        <FilamentManager rows={rows} />
      </Card>
    </div>
  );
}
