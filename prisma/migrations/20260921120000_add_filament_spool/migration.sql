-- CreateEnum
CREATE TYPE "FilamentMaterial" AS ENUM ('PLA', 'PETG', 'ABS', 'TPU');

-- CreateTable
CREATE TABLE "FilamentSpool" (
    "id" TEXT NOT NULL,
    "material" "FilamentMaterial" NOT NULL,
    "colorName" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL DEFAULT '#9ca3af',
    "count" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FilamentSpool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FilamentSpool_material_colorName_key" ON "FilamentSpool"("material", "colorName");

-- Seed: bisherige Website-Farben (count = 1), damit die öffentliche Auswahl
-- nach dem Umstieg identisch bleibt. Simon passt Bestände danach im Dashboard an.
INSERT INTO "FilamentSpool" ("id","material","colorName","colorHex","count","sortOrder","updatedAt") VALUES
(gen_random_uuid(),'PLA','Schwarz','#1a1a1a',1,0,CURRENT_TIMESTAMP),
(gen_random_uuid(),'PLA','Grau','#9ca3af',1,1,CURRENT_TIMESTAMP),
(gen_random_uuid(),'PLA','Weiss','#f0f0f0',1,2,CURRENT_TIMESTAMP),
(gen_random_uuid(),'PLA','Blau','#2563eb',1,3,CURRENT_TIMESTAMP),
(gen_random_uuid(),'PLA','Dunkelblau','#1e3a8a',1,4,CURRENT_TIMESTAMP),
(gen_random_uuid(),'PLA','Hellblau','#7dd3fc',1,5,CURRENT_TIMESTAMP),
(gen_random_uuid(),'PLA','Türkis','#14b8a6',1,6,CURRENT_TIMESTAMP),
(gen_random_uuid(),'PLA','Rot','#e02020',1,7,CURRENT_TIMESTAMP),
(gen_random_uuid(),'PLA','Orange','#f97316',1,8,CURRENT_TIMESTAMP),
(gen_random_uuid(),'PLA','Hellorange','#fdba74',1,9,CURRENT_TIMESTAMP),
(gen_random_uuid(),'PLA','Gelb','#facc15',1,10,CURRENT_TIMESTAMP),
(gen_random_uuid(),'PLA','Braun','#92400e',1,11,CURRENT_TIMESTAMP),
(gen_random_uuid(),'PLA','Grün','#16a34a',1,12,CURRENT_TIMESTAMP),
(gen_random_uuid(),'PLA','Silber','#c8c8c8',1,13,CURRENT_TIMESTAMP),
(gen_random_uuid(),'PLA','Gold','#d4af37',1,14,CURRENT_TIMESTAMP),
(gen_random_uuid(),'PETG','Grau','#9ca3af',1,15,CURRENT_TIMESTAMP),
(gen_random_uuid(),'PETG','Schwarz','#1a1a1a',1,16,CURRENT_TIMESTAMP),
(gen_random_uuid(),'PETG','Dunkelgrün','#14532d',1,17,CURRENT_TIMESTAMP),
(gen_random_uuid(),'PETG','Durchsichtig','repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%) 50% / 10px 10px',1,18,CURRENT_TIMESTAMP),
(gen_random_uuid(),'PETG','Misty Blue','#9db4c0',1,19,CURRENT_TIMESTAMP),
(gen_random_uuid(),'ABS','Schwarz','#1a1a1a',1,20,CURRENT_TIMESTAMP),
(gen_random_uuid(),'ABS','Weiss','#f0f0f0',1,21,CURRENT_TIMESTAMP),
(gen_random_uuid(),'TPU','Schwarz','#1a1a1a',1,22,CURRENT_TIMESTAMP),
(gen_random_uuid(),'TPU','Grau','#9ca3af',1,23,CURRENT_TIMESTAMP);
