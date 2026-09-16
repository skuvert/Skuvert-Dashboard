-- Einheit pro Kostenposition (z. B. h, g, Stk.) für Angebot und Rechnung.
ALTER TABLE "CostItem" ADD COLUMN "unit" TEXT NOT NULL DEFAULT '';
