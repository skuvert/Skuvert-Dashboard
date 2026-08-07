"use client";

import { useActionState, useState } from "react";
import { createOrder } from "@/lib/actions/orders";
import { extractOrderNumber } from "@/lib/order-number";
import { ORDER_TYPES } from "@/lib/order-types";
import { inputClasses, labelClasses } from "@/components/ui/field";
import { Button } from "@/components/ui/Button";

export function NewOrderForm() {
  const [state, formAction, pending] = useActionState(createOrder, {});
  const [orderNumber, setOrderNumber] = useState("");
  const [orderNumberTouched, setOrderNumberTouched] = useState(false);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="rawRequestText" className={labelClasses}>
          Anfrage-Text (E-Mail, Kontaktformular …)
        </label>
        <textarea
          id="rawRequestText"
          name="rawRequestText"
          required
          rows={10}
          className={`${inputClasses} w-full min-h-[220px] resize-y`}
          placeholder="Text der Kundenanfrage hier einfügen …"
          onChange={(e) => {
            if (!orderNumberTouched) {
              setOrderNumber(extractOrderNumber(e.target.value));
            }
          }}
        />
        <p className="mt-1.5 text-xs text-muted">
          Enthält der Text ein Muster wie <code>SKV-2026-014</code>, wird die Auftragsnummer
          unten automatisch vorgeschlagen.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="orderNumber" className={labelClasses}>
            Auftragsnummer
          </label>
          <input
            id="orderNumber"
            name="orderNumber"
            required
            className={`${inputClasses} w-full`}
            value={orderNumber}
            onChange={(e) => {
              setOrderNumberTouched(true);
              setOrderNumber(e.target.value);
            }}
            placeholder="SKV-2026-014"
          />
        </div>
        <div>
          <label htmlFor="customerName" className={labelClasses}>
            Kundenname
          </label>
          <input
            id="customerName"
            name="customerName"
            required
            className={`${inputClasses} w-full`}
          />
        </div>
        <div>
          <label htmlFor="customerEmail" className={labelClasses}>
            Kunden-E-Mail
          </label>
          <input
            id="customerEmail"
            name="customerEmail"
            type="email"
            className={`${inputClasses} w-full`}
          />
        </div>
      </div>

      <div>
        <span className={labelClasses}>Auftragstyp</span>
        <div className="flex flex-wrap gap-2">
          {ORDER_TYPES.map((type) => (
            <label
              key={type.id}
              className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-border bg-white px-4 py-2 text-sm font-semibold text-ink has-[:checked]:border-accent has-[:checked]:bg-accent/10 has-[:checked]:text-accent"
            >
              <input type="checkbox" name="orderTypes" value={type.id} className="hidden" />
              {type.emoji} {type.label}
            </label>
          ))}
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Wird erstellt…" : "Auftrag erstellen"}
      </Button>
    </form>
  );
}
