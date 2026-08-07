"use client";

import { useState, useTransition } from "react";
import { upsertOwnPriceRow, deleteOwnPriceRow } from "@/lib/actions/tools";
import { inputClasses } from "@/components/ui/field";
import { Button } from "@/components/ui/Button";

type Row = { id: string; label: string; unit: string; price: number; note: string | null };

function RowEditor({ row }: { row: Row }) {
  const [values, setValues] = useState({ ...row, note: row.note ?? "" });
  const [, startTransition] = useTransition();

  function save(next: typeof values) {
    setValues(next);
    startTransition(() => upsertOwnPriceRow(next));
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="p-2">
        <input
          value={values.label}
          onChange={(e) => setValues((v) => ({ ...v, label: e.target.value }))}
          onBlur={() => save(values)}
          className={`${inputClasses} w-full`}
        />
      </td>
      <td className="p-2">
        <input
          value={values.unit}
          onChange={(e) => setValues((v) => ({ ...v, unit: e.target.value }))}
          onBlur={() => save(values)}
          className={`${inputClasses} w-32`}
        />
      </td>
      <td className="p-2">
        <input
          type="number"
          step="0.01"
          value={values.price}
          onChange={(e) => setValues((v) => ({ ...v, price: Number(e.target.value) }))}
          onBlur={() => save(values)}
          className={`${inputClasses} w-24`}
        />
      </td>
      <td className="p-2">
        <input
          value={values.note}
          onChange={(e) => setValues((v) => ({ ...v, note: e.target.value }))}
          onBlur={() => save(values)}
          placeholder="Notiz (optional)"
          className={`${inputClasses} w-full`}
        />
      </td>
      <td className="p-2 text-right">
        <button
          type="button"
          onClick={() => startTransition(() => deleteOwnPriceRow(row.id))}
          className="text-xs text-muted hover:text-red-600"
        >
          Entfernen
        </button>
      </td>
    </tr>
  );
}

export function OwnPriceTable({ rows }: { rows: Row[] }) {
  const [, startTransition] = useTransition();
  const [draft, setDraft] = useState({ label: "", unit: "", price: "", note: "" });

  function addRow() {
    if (!draft.label.trim() || !draft.unit.trim()) return;
    startTransition(() =>
      upsertOwnPriceRow({
        label: draft.label.trim(),
        unit: draft.unit.trim(),
        price: Number(draft.price) || 0,
        note: draft.note.trim(),
      }),
    );
    setDraft({ label: "", unit: "", price: "", note: "" });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            <th className="p-2 font-semibold">Bezeichnung</th>
            <th className="p-2 font-semibold">Einheit</th>
            <th className="p-2 font-semibold">Preis (CHF)</th>
            <th className="p-2 font-semibold">Notiz</th>
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
                value={draft.label}
                onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                placeholder="z. B. Material PLA"
                className={`${inputClasses} w-full`}
              />
            </td>
            <td className="p-2">
              <input
                value={draft.unit}
                onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))}
                placeholder="CHF / g"
                className={`${inputClasses} w-32`}
              />
            </td>
            <td className="p-2">
              <input
                type="number"
                step="0.01"
                value={draft.price}
                onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                className={`${inputClasses} w-24`}
              />
            </td>
            <td className="p-2">
              <input
                value={draft.note}
                onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
                placeholder="Notiz (optional)"
                className={`${inputClasses} w-full`}
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
