"use client";

import { useState, useTransition } from "react";
import { updateCustomerNote } from "@/lib/actions/orders";
import { inputClasses } from "@/components/ui/field";

export function CustomerNoteSection({
  orderId,
  initialNote,
}: {
  orderId: string;
  initialNote: string;
}) {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState(initialNote);
  const [saved, setSaved] = useState(false);
  const dirty = note !== initialNote;

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await updateCustomerNote(orderId, formData);
          setSaved(true);
          setTimeout(() => setSaved(false), 1500);
        });
      }}
      className="space-y-3"
    >
      <textarea
        name="customerNote"
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaved(false);
        }}
        rows={2}
        placeholder='z. B. "12 von 40 fertiggestellt"'
        className={`${inputClasses} w-full`}
      />
      <button
        type="submit"
        disabled={pending || (!dirty && !saved)}
        className="rounded-xl border-2 border-border px-4 py-2 text-sm font-semibold text-ink hover:border-accent disabled:opacity-50"
      >
        {pending ? "Speichert…" : saved ? "Gespeichert!" : "Notiz speichern"}
      </button>
    </form>
  );
}
