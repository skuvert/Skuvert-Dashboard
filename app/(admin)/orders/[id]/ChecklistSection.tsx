"use client";

import { useState, useTransition } from "react";
import { toggleChecklistItem, addChecklistItem, deleteChecklistItem } from "@/lib/actions/orders";
import { inputClasses } from "@/components/ui/field";

type Item = { id: string; label: string; isDefault: boolean; isChecked: boolean };

function ChecklistItemRow({ orderId, item }: { orderId: string; item: Item }) {
  const [checked, setChecked] = useState(item.isChecked);
  const [pending, startTransition] = useTransition();

  return (
    <li className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.checked;
          setChecked(next);
          startTransition(() => toggleChecklistItem(item.id, orderId, next));
        }}
        className="h-4 w-4 accent-accent"
      />
      <span className={`flex-1 text-sm ${checked ? "text-muted line-through" : "text-ink"}`}>
        {item.label}
      </span>
      {!item.isDefault && (
        <button
          type="button"
          onClick={() => startTransition(() => deleteChecklistItem(item.id, orderId))}
          className="text-xs text-muted hover:text-red-600"
        >
          Entfernen
        </button>
      )}
    </li>
  );
}

export function ChecklistSection({ orderId, items }: { orderId: string; items: Item[] }) {
  const [pending, startTransition] = useTransition();
  const [newLabel, setNewLabel] = useState("");

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <p className="text-sm text-muted">
          Keine Checklisten-Punkte. Wähle oben einen Auftragstyp oder füge unten einen Punkt hinzu.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <ChecklistItemRow key={item.id} orderId={orderId} item={item} />
          ))}
        </ul>
      )}

      <form
        action={(formData) => {
          startTransition(() => addChecklistItem(orderId, formData));
          setNewLabel("");
        }}
        className="flex gap-2"
      >
        <input
          name="label"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Eigenen Punkt hinzufügen …"
          className={`${inputClasses} flex-1`}
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl border-2 border-border px-4 text-sm font-semibold text-ink hover:border-accent"
        >
          +
        </button>
      </form>
      <p className="text-xs text-muted">Punkte werden bei Erstellung anhand des Auftragstyps vorbefüllt.</p>
    </div>
  );
}
