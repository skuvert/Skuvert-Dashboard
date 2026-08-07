import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { PostPriceTable } from "./PostPriceTable";
import { OwnPriceTable } from "./OwnPriceTable";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const [postRows, ownRows] = await Promise.all([
    prisma.postPriceRow.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.ownPriceRow.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-ink">Hilfsmittel</h1>

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-ink">Versandkosten-Referenz (Post CH)</h2>
          <p className="text-sm text-muted">
            Selbst gepflegte Referenztabelle — Preise ändern sich, daher kein automatischer Abruf.
            Aktuelle Preise:{" "}
            <a
              href="https://www.post.ch/de/pakete-versenden/preisrechner"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-accent hover:underline"
            >
              post.ch Preisrechner
            </a>
            .
          </p>
        </div>
        <PostPriceTable rows={postRows} />
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-ink">Eigene Preistabelle / Kalkulationshilfe</h2>
          <p className="text-sm text-muted">Faustpreise zum Nachschlagen beim Angebot-Erstellen.</p>
        </div>
        <OwnPriceTable rows={ownRows} />
      </Card>
    </div>
  );
}
