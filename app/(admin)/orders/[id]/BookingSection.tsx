"use client";

import { useTransition } from "react";
import Link from "next/link";
import { bookOrder } from "@/lib/actions/ledger";
import { buttonClasses } from "@/components/ui/Button";

type Entry = { id: string; type: "in" | "out"; amount: number; category: string; description: string };

const chf = new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" });

export function BookingSection({ orderId, entries }: { orderId: string; entries: Entry[] }) {
  const [pending, start] = useTransition();

  if (entries.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">
          Noch nicht verbucht. Erstellt eine Einnahme (aus den Kostenpositionen) plus editierbare
          Ausgabenzeilen für Material, Versand und Gebühren — mit dem Auftrag verknüpft.
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await bookOrder(orderId);
              if (!r.ok) alert(r.reason ?? "Verbuchen fehlgeschlagen.");
            })
          }
          className={buttonClasses("primary")}
        >
          {pending ? "Verbucht…" : "Zur Abrechnung verbuchen"}
        </button>
      </div>
    );
  }

  const income = entries.filter((e) => e.type === "in").reduce((s, e) => s + e.amount, 0);
  const expense = entries.filter((e) => e.type === "out").reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-border rounded-xl border border-border">
        {entries.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
            <span className="text-ink">
              {e.description || e.category}
              {e.category && <span className="ml-2 text-xs text-muted">{e.category}</span>}
            </span>
            <span
              className={`tabular-nums font-semibold ${e.type === "out" ? "text-red-600" : "text-emerald-600"}`}
            >
              {e.type === "out" ? "−" : ""}
              {chf.format(e.amount)}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-muted">
          Einnahmen <b className="text-emerald-600">{chf.format(income)}</b> · Ausgaben{" "}
          <b className="text-red-600">{chf.format(expense)}</b> · Saldo{" "}
          <b className="text-accent">{chf.format(income - expense)}</b>
        </span>
        <Link href="/abrechnung" className="font-semibold text-accent hover:underline">
          In der Abrechnung öffnen →
        </Link>
      </div>
    </div>
  );
}
