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
    packagingCostChf: number | null;
    designHours: number | null;
    rawRequestText: string;
  };
}) {
  const action = updateOrderDetails.bind(null, order.id);
  const [state, formAction, pending] = useActionState(action, {});
  const addressRef = useRef<HTMLTextAreaElement>(null);

  // Aus dem Materialgewicht abgeleitet (server-seitig identisch berechnet):
  // Material 100 g = 3 CHF, Abnutzung 100 g = 1.5 CHF, Strom = Material × 0.15.
  const [grams, setGrams] = useState(order.materialGrams?.toString() ?? "");
  const [designHours, setDesignHours] = useState(order.designHours?.toString() ?? "");
  const g = parseFloat(grams.replace(",", ".")) || 0;
  const materialCost = g * 0.03;
  const electricity = materialCost * 0.15;
  const depreciation = g * 0.015;
  const designValue = (parseFloat(designHours.replace(",", ".")) || 0) * 25;
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
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              placeholder="z. B. 240"
              className={`${inputClasses} w-full`}
            />
          </div>
          <div>
            <label className={labelClasses}>Materialkosten (auto, 100 g = 3.–)</label>
            <div className={`${inputClasses} w-full bg-bg text-muted`}>{chf.format(materialCost)}</div>
          </div>
          <div>
            <label className={labelClasses}>Strom (auto, Material × 0.15)</label>
            <div className={`${inputClasses} w-full bg-bg text-muted`}>{chf.format(electricity)}</div>
          </div>
          <div>
            <label className={labelClasses}>Abnutzung (auto, 100 g = 1.50)</label>
            <div className={`${inputClasses} w-full bg-bg text-muted`}>{chf.format(depreciation)}</div>
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
            <label className={labelClasses} htmlFor="designHours">
              Designzeit (h) — {chf.format(designValue)}
            </label>
            <input
              id="designHours"
              name="designHours"
              type="number"
              step="0.25"
              min="0"
              inputMode="decimal"
              value={designHours}
              onChange={(e) => setDesignHours(e.target.value)}
              placeholder="z. B. 1.5"
              className={`${inputClasses} w-full`}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          Material, Strom und Abnutzung werden automatisch aus dem Gewicht berechnet. Beim Speichern
          werden die verknüpften Abrechnungs-Zeilen aktualisiert (Null-Beträge erzeugen keine Zeile).
          Designzeit (25.–/h) wird vorerst nur hier festgehalten.
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
