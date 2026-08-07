"use client";

import { useState, useTransition } from "react";
import { addNote } from "@/lib/actions/orders";
import { inputClasses } from "@/components/ui/field";

type NoteItem = { id: string; text: string; createdAt: string };

export function NotesSection({ orderId, notes }: { orderId: string; notes: NoteItem[] }) {
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState("");

  return (
    <div className="space-y-4">
      <form
        action={(formData) => {
          startTransition(() => addNote(orderId, formData));
          setText("");
        }}
        className="flex gap-2"
      >
        <input
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Kurze Notiz, z. B. "Kunde will Farbe ändern, 05.08." …'
          className={`${inputClasses} flex-1`}
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl border-2 border-border px-4 text-sm font-semibold text-ink hover:border-accent"
        >
          Hinzufügen
        </button>
      </form>
      {notes.length === 0 ? (
        <p className="text-sm text-muted">Noch keine Notizen.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="border-l-2 border-border pl-3">
              <p className="text-sm text-ink">{note.text}</p>
              <p className="text-xs text-muted">{note.createdAt}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
