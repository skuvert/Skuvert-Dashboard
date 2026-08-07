"use client";

import { useMemo, useState } from "react";
import { saveCostItems } from "@/lib/actions/orders";
import { buildEmailText, costTotal, formatCHF, type CostLine } from "@/lib/email-template";
import { inputClasses, labelClasses } from "@/components/ui/field";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";

export function EmailGenerator({
  orderId,
  customerName,
  initialItems,
  initialPaymentLink,
  trackingUrl,
}: {
  orderId: string;
  customerName: string;
  initialItems: CostLine[];
  initialPaymentLink: string;
  trackingUrl: string;
}) {
  const [items, setItems] = useState<CostLine[]>(
    initialItems.length ? initialItems : [{ label: "", qty: 1, unitPrice: 0 }],
  );
  const [paymentLink, setPaymentLink] = useState(initialPaymentLink);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [textTouched, setTextTouched] = useState(false);
  const [mailText, setMailText] = useState("");

  const generatedText = useMemo(
    () => buildEmailText({ customerName, items, paymentLink, trackingUrl }),
    [customerName, items, paymentLink, trackingUrl],
  );
  const displayText = textTouched ? mailText : generatedText;
  const total = costTotal(items);

  function updateItem(index: number, patch: Partial<CostLine>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  async function handleSave() {
    setSaving(true);
    await saveCostItems(orderId, items.filter((i) => i.label.trim()));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <input
              value={item.label}
              onChange={(e) => updateItem(i, { label: e.target.value })}
              placeholder="Bezeichnung"
              className={`${inputClasses} min-w-[140px] flex-1`}
            />
            <input
              type="number"
              min={0}
              step="0.1"
              value={item.qty}
              onChange={(e) => updateItem(i, { qty: Number(e.target.value) })}
              className={`${inputClasses} w-20`}
              aria-label="Menge"
            />
            <input
              type="number"
              min={0}
              step="0.05"
              value={item.unitPrice}
              onChange={(e) => updateItem(i, { unitPrice: Number(e.target.value) })}
              className={`${inputClasses} w-24`}
              aria-label="Einzelpreis"
            />
            <span className="w-20 text-right text-sm font-semibold text-ink">
              {formatCHF(item.qty * item.unitPrice)}
            </span>
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
              className="text-xs text-muted hover:text-red-600"
            >
              Entfernen
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, { label: "", qty: 1, unitPrice: 0 }])}
          className="text-sm font-semibold text-accent hover:underline"
        >
          + Position hinzufügen
        </button>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-accent/5 px-4 py-3">
        <span className="text-sm font-semibold text-muted">Total</span>
        <span className="text-lg font-extrabold text-accent">{formatCHF(total)}</span>
      </div>

      <div>
        <label className={labelClasses} htmlFor="paymentLink">
          Zahlungslink (TWINT / PayPal)
        </label>
        <input
          id="paymentLink"
          value={paymentLink}
          onChange={(e) => setPaymentLink(e.target.value)}
          placeholder="https://…"
          className={`${inputClasses} w-full`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="button" variant="secondary" onClick={handleSave} disabled={saving}>
          {saving ? "Speichert…" : saved ? "Gespeichert!" : "Kosten speichern"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setMailText(generatedText);
            setTextTouched(false);
          }}
          className="text-sm font-semibold text-accent hover:underline"
        >
          Mailtext neu generieren
        </button>
      </div>

      <div>
        <label className={labelClasses} htmlFor="mailText">
          Mailtext (editierbar)
        </label>
        <textarea
          id="mailText"
          value={displayText}
          onChange={(e) => {
            setTextTouched(true);
            setMailText(e.target.value);
          }}
          rows={14}
          className={`${inputClasses} w-full font-mono text-[13px] leading-relaxed`}
        />
        <div className="mt-2">
          <CopyButton text={displayText} label="In Zwischenablage kopieren" />
        </div>
      </div>
    </div>
  );
}
