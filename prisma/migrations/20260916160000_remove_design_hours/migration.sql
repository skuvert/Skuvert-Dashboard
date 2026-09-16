-- Designzeit-Feld aus den Auftrags-Stammdaten entfernt (Konstruktion läuft
-- neu über normale Kostenpositionen).
ALTER TABLE "Order" DROP COLUMN "designHours";
