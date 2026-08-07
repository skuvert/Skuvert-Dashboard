import { CustomerStatus, InternalStatus } from "@/app/generated/prisma/enums";

export const INTERNAL_STATUS_ORDER: InternalStatus[] = [
  "NEU",
  "ANGEBOT_ERSTELLT",
  "ANGEBOT_VERSENDET",
  "BESTAETIGT_BEZAHLT",
  "IN_PRODUKTION",
  "FERTIG",
  "VERSENDET",
  "ABGESCHLOSSEN",
  "STORNIERT",
];

export const INTERNAL_STATUS_LABEL: Record<InternalStatus, string> = {
  NEU: "Neu",
  ANGEBOT_ERSTELLT: "Angebot erstellt",
  ANGEBOT_VERSENDET: "Angebot versendet",
  BESTAETIGT_BEZAHLT: "Bestätigt/Bezahlt",
  IN_PRODUKTION: "In Produktion",
  FERTIG: "Fertig zur Abholung/Versand",
  VERSENDET: "Versendet",
  ABGESCHLOSSEN: "Abgeschlossen",
  STORNIERT: "Storniert",
};

export const CUSTOMER_STATUS_ORDER: CustomerStatus[] = [
  "ANFRAGE_ERHALTEN",
  "ANGEBOT_GESENDET",
  "IN_PRODUKTION",
  "VERSANDBEREIT",
  "VERSENDET",
  "ABGESCHLOSSEN",
];

export const CUSTOMER_STATUS_LABEL: Record<CustomerStatus, string> = {
  ANFRAGE_ERHALTEN: "Anfrage erhalten",
  ANGEBOT_GESENDET: "Angebot gesendet",
  IN_PRODUKTION: "In Produktion",
  VERSANDBEREIT: "Versand-/Abholbereit",
  VERSENDET: "Versendet/Abgeholt",
  ABGESCHLOSSEN: "Abgeschlossen",
};

export function statusPillClasses(status: InternalStatus | CustomerStatus): string {
  if (status === "STORNIERT") return "bg-red-50 text-red-600";
  if (status === "ABGESCHLOSSEN") return "bg-emerald-50 text-emerald-700";
  if (status === "NEU" || status === "ANFRAGE_ERHALTEN") return "bg-border text-muted";
  return "bg-accent/10 text-accent";
}
