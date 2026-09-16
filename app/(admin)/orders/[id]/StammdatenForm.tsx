"use client";

import { useActionState, useRef, useState } from "react";
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
    trackingNumber: string | null;
    materialGrams: number | null;
    materialCostChf: number | null;
    packagingCostChf: number | null;
    depreciationChf: number | null;
    rawRequestText: string;
  };
}) {
  const action = updateOrderDetails.bind(null, order.id);
  const [state, formAction, pending] = useActionState(action, {});
  const addressRef = useRef<HTMLTextAreaElement>(null);

  // Strom = Materialkosten × 0.15, live berechnet (server-seitig genauso).
  const [materialCost, setMaterialCost] = useState(order.materialCostChf?.toString() ?? "");
  const electricity = (parseFloat(materialCost.replace(",", ".")) || 0) * 0.15;
  const chf = new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" });

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
      <div>
        <label className={labelClasses} htmlFor="trackingNumber">
          Sendungsnummer (Versandverfolgung)
        </label>
        <input
          id="trackingNumber"
          name="trackingNumber"
          defaultValue={order.trackingNumber ?? ""}
          placeholder="z. B. 99.00.123456.78901234"
          className={`${inputClasses} w-full`}
        />
      </div>
      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink">
          Kosten (fliessen in die Abrechnung)
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClasses} htmlFor="materialGrams">
              Material (g)
            </label>
            <input
              id="materialGrams"
              name="materialGrams"
              type="number"
              step="1"
              min="0"
              inputMode="decimal"
              defaultValue={order.materialGrams ?? ""}
              placeholder="z. B. 240"
              className={`${inputClasses} w-full`}
            />
          </div>
          <div>
            <label className={labelClasses} htmlFor="materialCostChf">
              Materialkosten (CHF)
            </label>
            <input
              id="materialCostChf"
              name="materialCostChf"
              type="number"
              step="0.05"
              min="0"
              inputMode="decimal"
              value={materialCost}
              onChange={(e) => setMaterialCost(e.target.value)}
              placeholder="z. B. 6.00"
              className={`${inputClasses} w-full`}
            />
          </div>
          <div>
            <label className={labelClasses}>Strom (auto = Material × 0.15)</label>
            <div
              className={`${inputClasses} w-full bg-bg text-muted`}
              aria-label="Stromkosten automatisch"
            >
              {chf.format(electricity)}
            </div>
          </div>
          <div>
            <label className={labelClasses} htmlFor="packagingCostChf">
              Verpackung (CHF)
            </label>
            <input
              id="packagingCostChf"
              name="packagingCostChf"
              type="number"
              step="0.05"
              min="0"
              inputMode="decimal"
              defaultValue={order.packagingCostChf ?? ""}
              placeholder="z. B. 1.50"
              className={`${inputClasses} w-full`}
            />
          </div>
          <div>
            <label className={labelClasses} htmlFor="depreciationChf">
              Abnutzung Drucker (CHF)
            </label>
            <input
              id="depreciationChf"
              name="depreciationChf"
              type="number"
              step="0.05"
              min="0"
              inputMode="decimal"
              defaultValue={order.depreciationChf ?? ""}
              placeholder="z. B. 2.00"
              className={`${inputClasses} w-full`}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          Strom wird automatisch aus den Materialkosten berechnet. Beim Speichern werden die
          verknüpften Abrechnungs-Zeilen aktualisiert.
        </p>
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
