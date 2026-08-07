"use client";

import { useState, useTransition } from "react";
import { upsertPostPriceRow, deletePostPriceRow } from "@/lib/actions/tools";
import { inputClasses } from "@/components/ui/field";
import { Button } from "@/components/ui/Button";

type Row = { id: string; weightClass: string; destinationZone: string; price: number };

function RowEditor({ row }: { row: Row }) {
  const [values, setValues] = useState(row);
  const [, startTransition] = useTransition();

  function save(next: Row) {
    setValues(next);
    startTransition(() => upsertPostPriceRow(next));
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="p-2">
        <input
          value={values.weightClass}
          onChange={(e) => setValues((v) => ({ ...v, weightClass: e.target.value }))}
          onBlur={() => save(values)}
          className={`${inputClasses} w-full`}
        />
      </td>
      <td className="p-2">
        <input
          value={values.destinationZone}
          onChange={(e) => setValues((v) => ({ ...v, destinationZone: e.target.value }))}
          onBlur={() => save(values)}
          className={`${inputClasses} w-full`}
        />
      </td>
      <td className="p-2">
        <input
          type="number"
          step="0.05"
          value={values.price}
          onChange={(e) => setValues((v) => ({ ...v, price: Number(e.target.value) }))}
          onBlur={() => save(values)}
          className={`${inputClasses} w-28`}
        />
      </td>
      <td className="p-2 text-right">
        <button
          type="button"
          onClick={() => startTransition(() => deletePostPriceRow(row.id))}
          className="text-xs text-muted hover:text-red-600"
        >
          Entfernen
        </button>
      </td>
    </tr>
  );
}

export function PostPriceTable({ rows }: { rows: Row[] }) {
  const [, startTransition] = useTransition();
  const [draft, setDraft] = useState({ weightClass: "", destinationZone: "", price: "" });

  function addRow() {
    if (!draft.weightClass.trim() || !draft.destinationZone.trim()) return;
    startTransition(() =>
      upsertPostPriceRow({
        weightClass: draft.weightClass.trim(),
        destinationZone: draft.destinationZone.trim(),
        price: Number(draft.price) || 0,
      }),
    );
    setDraft({ weightClass: "", destinationZone: "", price: "" });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            <th className="p-2 font-semibold">Gewichtsklasse</th>
            <th className="p-2 font-semibold">Zielland / Zone</th>
            <th className="p-2 font-semibold">Preis (CHF)</th>
            <th className="p-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <RowEditor key={row.id} row={row} />
          ))}
          <tr>
            <td className="p-2">
              <input
                value={draft.weightClass}
                onChange={(e) => setDraft((d) => ({ ...d, weightClass: e.target.value }))}
                placeholder="z. B. bis 1 kg"
                className={`${inputClasses} w-full`}
              />
            </td>
            <td className="p-2">
              <input
                value={draft.destinationZone}
                onChange={(e) => setDraft((d) => ({ ...d, destinationZone: e.target.value }))}
                placeholder="z. B. Inland CH"
                className={`${inputClasses} w-full`}
              />
            </td>
            <td className="p-2">
              <input
                type="number"
                step="0.05"
                value={draft.price}
                onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                className={`${inputClasses} w-28`}
              />
            </td>
            <td className="p-2 text-right">
              <Button type="button" variant="secondary" onClick={addRow}>
                + Zeile
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
