-- Material- und Abnutzungskosten werden neu aus dem Materialgewicht abgeleitet,
-- daher die manuellen Spalten entfernen und Designzeit ergänzen.
ALTER TABLE "Order" DROP COLUMN "materialCostChf";
ALTER TABLE "Order" DROP COLUMN "depreciationChf";
ALTER TABLE "Order" ADD COLUMN "designHours" DOUBLE PRECISION;

-- Bestehende abgeleitete Null-Franken-Zeilen aufräumen (keine 0.00-Einträge mehr).
DELETE FROM "LedgerEntry" WHERE "auto" = true AND "amount" = 0;
