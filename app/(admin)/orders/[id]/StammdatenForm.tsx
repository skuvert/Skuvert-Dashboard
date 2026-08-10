"use client";

import { useActionState, useRef } from "react";
import { updateOrderDetails } from "@/lib/actions/orders";
import { extractAddress } from "@/lib/address";
import { inputClasses, labelClasses } from "@/components/ui/field";
import { Button } from "@/components/ui/Button";

export function StammdatenForm({
  order,
}: {
  order: {
    id: string;
    customerName: string;
    customerEmail: string;
    orderNumber: string;
    paymentLink: string | null;
    shippingAddress: string | null;
    rawRequestText: string;
  };
}) {
  const action = updateOrderDetails.bind(null, order.id);
  const [state, formAction, pending] = useActionState(action, {});
  const addressRef = useRef<HTMLTextAreaElement>(null);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className={labelClasses} htmlFor="orderNumber">
          Auftragsnummer
        </label>
        <input
          id="orderNumber"
          name="orderNumber"
          defaultValue={order.orderNumber}
          className={`${inputClasses} w-full`}
          required
        />
      </div>
      <div>
        <label className={labelClasses} htmlFor="customerName">
          Kundenname
        </label>
        <input
          id="customerName"
          name="customerName"
          defaultValue={order.customerName}
          className={`${inputClasses} w-full`}
          required
        />
      </div>
      <div>
        <label className={labelClasses} htmlFor="customerEmail">
          Kunden-E-Mail
        </label>
        <input
          id="customerEmail"
          name="customerEmail"
          type="email"
          defaultValue={order.customerEmail}
          className={`${inputClasses} w-full`}
        />
      </div>
      <div>
        <label className={labelClasses} htmlFor="paymentLink">
          Zahlungslink (TWINT / PayPal)
        </label>
        <input
          id="paymentLink"
          name="paymentLink"
          defaultValue={order.paymentLink ?? ""}
          placeholder="https://…"
          className={`${inputClasses} w-full`}
        />
      </div>
      <div className="sm:col-span-2">
        <div className="flex items-center justify-between">
          <label className={labelClasses} htmlFor="shippingAddress">
            Lieferadresse (für Versandetikett)
          </label>
          <button
            type="button"
            onClick={() => {
              const extracted = extractAddress(order.rawRequestText);
              if (extracted && addressRef.current) addressRef.current.value = extracted;
            }}
            className="text-xs font-semibold text-accent hover:underline"
          >
            Aus Anfrage übernehmen
          </button>
        </div>
        <textarea
          ref={addressRef}
          id="shippingAddress"
          name="shippingAddress"
          defaultValue={order.shippingAddress ?? ""}
          placeholder={"Strasse Nr.\nPLZ Ort\nLand (falls nicht Schweiz)"}
          rows={3}
          className={`${inputClasses} w-full`}
        />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Speichert…" : "Stammdaten speichern"}
        </Button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      </div>
    </form>
  );
}
