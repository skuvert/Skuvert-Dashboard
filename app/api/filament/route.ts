import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { FilamentMaterial } from "@prisma/client";

// Öffentliche, read-only Liste der vorrätigen Filament-Farben für die Website.
// Nur Farben mit count > 0 werden ausgeliefert; exakte Stückzahlen bleiben intern.
// Diese Route ist in proxy.ts bewusst vom Login-Schutz ausgenommen.
export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET() {
  const rows = await prisma.filamentSpool.findMany({
    where: { count: { gt: 0 } },
    orderBy: { sortOrder: "asc" },
  });

  const materials: Record<FilamentMaterial, { n: string; h: string }[]> = {
    PLA: [],
    PETG: [],
    ABS: [],
    TPU: [],
  };
  for (const r of rows) materials[r.material].push({ n: r.colorName, h: r.colorHex });

  return NextResponse.json(
    { materials },
    { headers: { ...CORS, "Cache-Control": "no-store" } },
  );
}
