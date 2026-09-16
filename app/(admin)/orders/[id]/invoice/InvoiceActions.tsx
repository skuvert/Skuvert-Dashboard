"use client";

import { Button } from "@/components/ui/Button";

export function InvoiceActions() {
  return (
    <Button type="button" onClick={() => window.print()}>
      Als PDF speichern / Drucken
    </Button>
  );
}
