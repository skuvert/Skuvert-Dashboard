"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import { inputClasses, labelClasses } from "@/components/ui/field";
import {
  createLedgerEntry,
  updateLedgerEntry,
  deleteLedgerEntry,
  importBackup,
  saveProfile,
  type LedgerInput,
} from "@/lib/actions/ledger";

export type Row = {
  id: string;
  date: string; // YYYY-MM-DD
  type: "in" | "out";
  amount: number;
  category: string;
  description: string;
  party: string;
  receipt: boolean;
  orderId: string | null;
  orderNumber: string | null;
};

export type Profile = { name: string; addr: string; taxId: string; place: string; iban: string };

const chf = new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" });
const fmtCHF = (n: number) => chf.format(n || 0);
const fmtDate = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};
const today = () => new Date().toISOString().slice(0, 10);

const CATEGORIES = [
  "Auftragsarbeit",
  "Produktverkauf",
  "Filament / Material",
  "Verpackung / Versand",
  "Strom / Drucker",
  "Werkzeug / Ersatzteile",
  "Gebühren",
  "Sonstiges",
];

const emptyForm = (): LedgerInput => ({
  date: today(),
  type: "in",
  amount: 0,
  category: "",
  description: "",
  party: "",
  receipt: true,
  orderId: null,
});

export function Ledger({
  entries,
  profile,
  orders,
}: {
  entries: Row[];
  profile: Profile;
  orders: { id: string; orderNumber: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [year, setYear] = useState<string>(() => {
    const years = [...new Set(entries.map((e) => e.date.slice(0, 4)))].sort().reverse();
    return years[0] ?? String(new Date().getFullYear());
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LedgerInput | null>(null);
  const [amountStr, setAmountStr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const years = useMemo(() => {
    const s = new Set(entries.map((e) => e.date.slice(0, 4)));
    s.add(String(new Date().getFullYear()));
    return [...s].sort().reverse();
  }, [entries]);

  const list = useMemo(
    () => entries.filter((e) => e.date.slice(0, 4) === year).sort((a, b) => a.date.localeCompare(b.date)),
    [entries, year],
  );

  const totals = useMemo(() => {
    let i = 0,
      o = 0;
    for (const e of list) e.type === "in" ? (i += e.amount) : (o += e.amount);
    return { in: i, out: o, profit: i - o };
  }, [list]);

  function openForm(row?: Row) {
    if (row) {
      setEditingId(row.id);
      setForm({
        date: row.date,
        type: row.type,
        amount: row.amount,
        category: row.category,
        description: row.description,
        party: row.party,
        receipt: row.receipt,
        orderId: row.orderId,
      });
      setAmountStr(String(row.amount));
    } else {
      setEditingId(null);
      setForm(emptyForm());
      setAmountStr("");
    }
  }
  const closeForm = () => {
    setForm(null);
    setEditingId(null);
  };

  function submit() {
    if (!form) return;
    const amount = parseFloat(amountStr.replace(",", "."));
    if (!form.date || !(amount > 0)) {
      alert("Bitte Datum und einen Betrag > 0 eingeben.");
      return;
    }
    const payload: LedgerInput = { ...form, amount };
    startTransition(async () => {
      if (editingId) await updateLedgerEntry(editingId, payload);
      else await createLedgerEntry(payload);
      setYear(form.date.slice(0, 4));
      closeForm();
    });
  }

  function remove(id: string) {
    if (!confirm("Diesen Eintrag löschen?")) return;
    startTransition(() => deleteLedgerEntry(id));
  }

  function exportBackup() {
    const data = {
      entries: entries.map((e) => ({
        date: e.date,
        type: e.type,
        amount: e.amount,
        cat: e.category,
        desc: e.description,
        party: e.party,
        receipt: e.receipt,
      })),
      profile,
      exported: new Date().toISOString(),
    };
    download(
      `skuvert-buchhaltung-${today()}.json`,
      JSON.stringify(data, null, 2),
      "application/json",
    );
  }

  function exportCsv() {
    const head = ["Datum", "Art", "Betrag CHF", "Kategorie", "Beschreibung", "Kunde/Quelle", "Beleg", "Auftrag"];
    const rows = list.map((e) => [
      fmtDate(e.date),
      e.type === "in" ? "Einnahme" : "Ausgabe",
      e.amount.toFixed(2),
      e.category,
      e.description,
      e.party,
      e.receipt ? "ja" : "nein",
      e.orderNumber ?? "",
    ]);
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [head, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
    download(`skuvert-abrechnung-${year}.csv`, "﻿" + csv, "text/csv;charset=utf-8");
  }

  function onImport(file: File) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(String(r.result));
        if (!Array.isArray(d.entries)) throw new Error("Kein gültiges Backup.");
        startTransition(async () => {
          const { added } = await importBackup(d.entries);
          alert(`Backup geladen: ${added} Einträge importiert.`);
        });
      } catch (e) {
        alert("Import fehlgeschlagen: " + (e as Error).message);
      }
    };
    r.readAsText(file);
  }

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .abr-print, .abr-print * { visibility: visible !important; }
          .abr-print { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .abr-printhead { display: block !important; }
        }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <h1 className="text-2xl font-extrabold text-ink">Abrechnung</h1>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={inputClasses}
            aria-label="Jahr"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button onClick={() => openForm()} className={buttonClasses("secondary")}>
            ＋ Eintrag
          </button>
          <button onClick={exportBackup} className={buttonClasses("ghost")}>
            ⤓ Backup
          </button>
          <button onClick={() => fileRef.current?.click()} className={buttonClasses("ghost")}>
            ⤒ Import
          </button>
          <button onClick={exportCsv} className={buttonClasses("ghost")}>
            CSV
          </button>
          <button onClick={() => window.print()} className={buttonClasses("primary")}>
            PDF / Drucken
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              if (e.target.files?.[0]) onImport(e.target.files[0]);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* Kopfdaten für den PDF-Kopf */}
      <details className="no-print">
        <summary className="cursor-pointer text-sm font-semibold text-muted">
          ▸ Kopfdaten (erscheinen auf dem PDF)
        </summary>
        <ProfileEditor profile={profile} pending={pending} />
      </details>

      {form && (
        <Card className="space-y-4 no-print">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            {editingId ? "Eintrag bearbeiten" : "Neuer Eintrag"}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelClasses}>Datum</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={`${inputClasses} w-full`}
              />
            </div>
            <div>
              <label className={labelClasses}>Art</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "in" | "out" })}
                className={`${inputClasses} w-full`}
              >
                <option value="in">Einnahme</option>
                <option value="out">Ausgabe</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>Betrag (CHF)</label>
              <input
                type="number"
                step="0.05"
                min="0"
                inputMode="decimal"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                className={`${inputClasses} w-full`}
              />
            </div>
            <div>
              <label className={labelClasses}>Kategorie</label>
              <input
                list="ledger-cats"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="z. B. Auftragsarbeit"
                className={`${inputClasses} w-full`}
              />
              <datalist id="ledger-cats">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="lg:col-span-2">
              <label className={labelClasses}>Beschreibung</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="z. B. Missortier-Behälter, 12 Stk."
                className={`${inputClasses} w-full`}
              />
            </div>
            <div>
              <label className={labelClasses}>Kunde / Quelle</label>
              <input
                value={form.party}
                onChange={(e) => setForm({ ...form, party: e.target.value })}
                placeholder="z. B. Firma XY / MakerWorld"
                className={`${inputClasses} w-full`}
              />
            </div>
            <div>
              <label className={labelClasses}>Auftrag (optional)</label>
              <select
                value={form.orderId ?? ""}
                onChange={(e) => setForm({ ...form, orderId: e.target.value || null })}
                className={`${inputClasses} w-full`}
              >
                <option value="">— keiner —</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={form.receipt}
                onChange={(e) => setForm({ ...form, receipt: e.target.checked })}
              />
              Beleg vorhanden
            </label>
            <div className="ml-auto flex gap-2">
              <button onClick={closeForm} className={buttonClasses("ghost")} disabled={pending}>
                Abbrechen
              </button>
              <button onClick={submit} className={buttonClasses("primary")} disabled={pending}>
                {pending ? "Speichern…" : "Speichern"}
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Druckbereich: Kopf + Kennzahlen + Tabelle */}
      <div className="abr-print space-y-6">
        <div className="abr-printhead hidden">
          <div className="text-lg font-bold text-ink">{profile.name || "Skuvert – Buchhaltung"}</div>
          {profile.addr && <div className="text-sm text-ink whitespace-pre-line">{profile.addr}</div>}
          {profile.taxId && <div className="text-sm text-ink">UID / Steuer-Nr.: {profile.taxId}</div>}
          <h2 className="mt-3 text-base font-bold text-ink">
            Einnahmen- und Ausgaben-Rechnung {year}
          </h2>
          <p className="text-sm text-muted">
            {list.length ? `${list.length} Einträge` : `01.01.${year} – 31.12.${year}`}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Einnahmen" value={fmtCHF(totals.in)} tone="text-emerald-600" />
          <StatCard label="Ausgaben" value={fmtCHF(totals.out)} tone="text-red-600" />
          <StatCard label="Gewinn (steuerbar)" value={fmtCHF(totals.profit)} tone="text-accent" />
        </div>

        <Card className="overflow-hidden p-0">
          {list.length === 0 ? (
            <p className="p-6 text-sm text-muted">Noch keine Einträge in {year}.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 font-semibold">Datum</th>
                    <th className="px-5 py-3 font-semibold">Beschreibung</th>
                    <th className="px-5 py-3 font-semibold">Kategorie</th>
                    <th className="px-5 py-3 font-semibold">Kunde / Quelle</th>
                    <th className="px-5 py-3 text-right font-semibold">Betrag</th>
                    <th className="px-5 py-3 no-print" />
                  </tr>
                </thead>
                <tbody>
                  {list.map((e) => (
                    <tr key={e.id} className="border-b border-border last:border-0">
                      <td className="whitespace-nowrap px-5 py-3 text-ink">{fmtDate(e.date)}</td>
                      <td className="px-5 py-3 text-ink">
                        {e.description || "—"}
                        {!e.receipt && (
                          <span className="ml-2 rounded-full bg-bg px-2 py-0.5 text-xs text-muted">
                            kein Beleg
                          </span>
                        )}
                        {e.orderId && e.orderNumber && (
                          <Link
                            href={`/orders/${e.orderId}`}
                            className="ml-2 text-xs font-semibold text-accent hover:underline no-print"
                          >
                            → {e.orderNumber}
                          </Link>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {e.category && (
                          <span className="rounded-full bg-bg px-2.5 py-0.5 text-xs text-muted">
                            {e.category}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-muted">{e.party}</td>
                      <td
                        className={`whitespace-nowrap px-5 py-3 text-right font-semibold tabular-nums ${
                          e.type === "out" ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {e.type === "out" ? "−" : ""}
                        {fmtCHF(e.amount)}
                      </td>
                      <td className="px-5 py-3 no-print">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openForm(e)}
                            className="rounded-lg px-2 py-1 text-muted hover:bg-bg hover:text-ink"
                            title="Bearbeiten"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => remove(e.id)}
                            className="rounded-lg px-2 py-1 text-muted hover:bg-red-50 hover:text-red-600"
                            title="Löschen"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {(profile.place || profile.name) && (
          <div className="abr-printhead hidden pt-8 text-sm text-ink">
            {profile.place ? `${profile.place}, ` : ""}
            {fmtDate(today())}
            <div className="mt-10 w-56 border-t border-ink pt-1">{profile.name} · Unterschrift</div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-muted no-print">
        Alle Daten liegen in der Datenbank (hinter dem Login), synchron auf allen Geräten. „Backup" =
        JSON-Export als zusätzliche Sicherung.
      </p>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <Card>
      <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold tabular-nums ${tone}`}>{value}</p>
    </Card>
  );
}

function ProfileEditor({ profile, pending }: { profile: Profile; pending: boolean }) {
  const [p, setP] = useState(profile);
  const [saved, setSaved] = useState(false);
  const [saving, startSave] = useTransition();
  const field = (key: keyof Profile, label: string, placeholder: string) => (
    <div>
      <label className={labelClasses}>{label}</label>
      <input
        value={p[key]}
        onChange={(e) => {
          setP({ ...p, [key]: e.target.value });
          setSaved(false);
        }}
        placeholder={placeholder}
        className={`${inputClasses} w-full`}
      />
    </div>
  );
  return (
    <Card className="mt-3 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {field("name", "Name / Firma", "Simon Kull – Skuvert")}
        {field("taxId", "UID / Steuer-Nr. (optional)", "z. B. CHE-123.456.789")}
      </div>
      {field("addr", "Adresse", "Strasse Nr., PLZ Ort")}
      <div className="grid gap-3 sm:grid-cols-2">
        {field("place", "Ort (für Unterschrift)", "z. B. Luzern")}
        {field("iban", "Konto / IBAN (optional)", "CH..")}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() =>
            startSave(async () => {
              await saveProfile(p);
              setSaved(true);
            })
          }
          className={buttonClasses("secondary")}
          disabled={saving || pending}
        >
          {saving ? "Speichern…" : "Kopfdaten speichern"}
        </button>
        {saved && <span className="text-sm text-emerald-600">Gespeichert ✓</span>}
      </div>
    </Card>
  );
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
