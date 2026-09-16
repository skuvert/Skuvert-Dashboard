-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "packagingCostChf" DOUBLE PRECISION,
ADD COLUMN     "depreciationChf" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "LedgerEntry" ADD COLUMN     "auto" BOOLEAN NOT NULL DEFAULT false;

-- Bestehende auftragsverknüpfte Einträge stammen alle aus der Auto-Verbuchung
-- und werden künftig aus dem Auftrag neu berechnet.
UPDATE "LedgerEntry" SET "auto" = true WHERE "orderId" IS NOT NULL;
