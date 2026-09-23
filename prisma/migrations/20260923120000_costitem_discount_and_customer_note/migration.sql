-- Rabatt-Positionen: kind unterscheidet reguläre Zeilen von Rabatten
-- (line | discountPct | discountFixed). Bestehende Zeilen = reguläre Positionen.
ALTER TABLE "CostItem" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'line';

-- Kundennotiz (Freitext, optional) – sichtbar in der öffentlichen Status-Ansicht.
ALTER TABLE "Order" ADD COLUMN "customerNote" TEXT;
