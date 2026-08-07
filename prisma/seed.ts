import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  if ((await prisma.postPriceRow.count()) === 0) {
    await prisma.postPriceRow.createMany({
      data: [
        { weightClass: "bis 100 g", destinationZone: "Inland CH", price: 2.0, sortOrder: 0 },
        { weightClass: "bis 250 g", destinationZone: "Inland CH", price: 3.0, sortOrder: 1 },
        { weightClass: "bis 500 g", destinationZone: "Inland CH", price: 4.5, sortOrder: 2 },
        { weightClass: "bis 1 kg", destinationZone: "Inland CH", price: 7.0, sortOrder: 3 },
        { weightClass: "bis 2 kg", destinationZone: "Inland CH", price: 9.5, sortOrder: 4 },
        { weightClass: "bis 100 g", destinationZone: "Ausland Europa (DE/IT/FR/AT/LI)", price: 9.5, sortOrder: 5 },
        { weightClass: "bis 250 g", destinationZone: "Ausland Europa (DE/IT/FR/AT/LI)", price: 13.0, sortOrder: 6 },
        { weightClass: "bis 500 g", destinationZone: "Ausland Europa (DE/IT/FR/AT/LI)", price: 17.0, sortOrder: 7 },
        { weightClass: "bis 1 kg", destinationZone: "Ausland Europa (DE/IT/FR/AT/LI)", price: 24.0, sortOrder: 8 },
        { weightClass: "bis 2 kg", destinationZone: "Ausland Europa (DE/IT/FR/AT/LI)", price: 34.0, sortOrder: 9 },
      ],
    });
  }

  if ((await prisma.ownPriceRow.count()) === 0) {
    await prisma.ownPriceRow.createMany({
      data: [
        { label: "Druckzeit", unit: "CHF / Stunde", price: 3.5, note: "Faustpreis, je nach Drucker & Aufwand anpassen", sortOrder: 0 },
        { label: "Material PLA", unit: "CHF / g", price: 0.06, note: null, sortOrder: 1 },
        { label: "Material PETG", unit: "CHF / g", price: 0.07, note: null, sortOrder: 2 },
        { label: "Material TPU", unit: "CHF / g", price: 0.1, note: null, sortOrder: 3 },
        { label: "Material ABS", unit: "CHF / g", price: 0.07, note: null, sortOrder: 4 },
        { label: "Design / Modellierung", unit: "CHF / Stunde", price: 25, note: null, sortOrder: 5 },
        { label: "Mindestpreis pro Auftrag", unit: "CHF", price: 15, note: "siehe Webseite: Design + Druck ab 15 CHF", sortOrder: 6 },
      ],
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
