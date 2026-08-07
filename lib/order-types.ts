export type OrderTypeId = "design" | "print" | "shipping" | "digitalOnly" | "pickup";

export interface OrderTypeDef {
  id: OrderTypeId;
  label: string;
  emoji: string;
  checklist: string[];
}

export const ALWAYS_CHECKLIST = [
  "Anfrage geprüft",
  "Angebot erstellt",
  "Angebot versendet",
  "Angebot bestätigt",
  "Zahlung erhalten",
];

// Neuer Auftragstyp? Einfach hier einen Eintrag ergänzen.
export const ORDER_TYPES: OrderTypeDef[] = [
  {
    id: "design",
    label: "Design/Modellierung",
    emoji: "✏️",
    checklist: ["Modell entworfen", "Kunde hat Entwurf freigegeben"],
  },
  {
    id: "print",
    label: "Druck",
    emoji: "🖨️",
    checklist: ["Druck gestartet", "Druck abgeschlossen", "Qualitätskontrolle"],
  },
  {
    id: "shipping",
    label: "Versand",
    emoji: "📦",
    checklist: ["Verpackt", "Versandetikett erstellt", "Versendet", "Zugestellt"],
  },
  {
    id: "digitalOnly",
    label: "Nur digitale Datei",
    emoji: "💾",
    checklist: ["Datei exportiert", "Datei an Kunde gesendet"],
  },
  {
    id: "pickup",
    label: "Abholung",
    emoji: "🤝",
    checklist: ["Kunde für Abholung kontaktiert", "Abgeholt"],
  },
];

export function orderTypeLabel(id: string): string {
  return ORDER_TYPES.find((t) => t.id === id)?.label ?? id;
}

export function buildDefaultChecklist(orderTypeIds: string[]): string[] {
  const labels = new Set(ALWAYS_CHECKLIST);
  for (const id of orderTypeIds) {
    const type = ORDER_TYPES.find((t) => t.id === id);
    type?.checklist.forEach((l) => labels.add(l));
  }
  return Array.from(labels);
}
