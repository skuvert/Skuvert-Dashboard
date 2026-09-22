"use client";

import { useMemo, useState, useTransition } from "react";
import { addSpool, adjustSpool, deleteSpool } from "@/lib/actions/filament";
import { inputClasses } from "@/components/ui/field";
import { Button } from "@/components/ui/Button";

type Material = "PLA" | "PETG" | "ABS" | "TPU";
type Row = { id: string; material: Material; colorName: string; colorHex: string; count: number };

const MATERIALS: Material[] = ["PLA", "PETG", "ABS", "TPU"];

// Offizielle Bambu-Lab-Farbpaletten (Name + Hex) – als Schnellauswahl und für
// die automatische Farbton-Erkennung beim Tippen (hilfreich bei Farbblindheit).
const KNOWN: Record<Material, { n: string; h: string }[]> = {
  PLA: [
    { n: "Weiss", h: "#FFFFFF" }, { n: "Beige", h: "#F7E6DE" }, { n: "Hellgrau", h: "#D1D3D5" },
    { n: "Silber", h: "#A6A9AA" }, { n: "Grau", h: "#8E9089" }, { n: "Blaugrau", h: "#5B6579" },
    { n: "Dunkelgrau", h: "#545454" }, { n: "Schwarz", h: "#000000" }, { n: "Magenta", h: "#EC008C" },
    { n: "Pink", h: "#F55A74" }, { n: "Knallpink", h: "#F5547C" }, { n: "Weinrot", h: "#9D2235" },
    { n: "Rot", h: "#C12E1F" }, { n: "Orange", h: "#FF6A13" }, { n: "Dunkelorange", h: "#FF9016" },
    { n: "Gold", h: "#E4BD68" }, { n: "Sonnengelb", h: "#FEC600" }, { n: "Gelb", h: "#F4EE2A" },
    { n: "Hellgrün", h: "#BECF00" }, { n: "Grün", h: "#00AE42" }, { n: "Tannengrün", h: "#3F8E43" },
    { n: "Türkis", h: "#00B1B7" }, { n: "Cyan", h: "#0086D6" }, { n: "Blau", h: "#0A2989" },
    { n: "Kobaltblau", h: "#0056B8" }, { n: "Violett", h: "#5E43B7" }, { n: "Indigo", h: "#482960" },
    { n: "Bronze", h: "#847D48" }, { n: "Kakaobraun", h: "#6F5034" }, { n: "Braun", h: "#9D432C" },
  ],
  PETG: [
    { n: "Weiss", h: "#FFFFFF" }, { n: "Dunkelbeige", h: "#DBC8B6" }, { n: "Grau", h: "#7F7E83" },
    { n: "Schwarz", h: "#000000" }, { n: "Rot", h: "#D6001C" }, { n: "Orange", h: "#FF671F" },
    { n: "Gelb", h: "#FCE300" }, { n: "Grün", h: "#009639" }, { n: "Tannengrün", h: "#034638" },
    { n: "Nebelblau", h: "#688197" }, { n: "Blau", h: "#0086D6" }, { n: "Dunkelblau", h: "#001489" },
    { n: "Dunkelbraun", h: "#4F2C1D" },
  ],
  ABS: [
    { n: "Weiss", h: "#FFFFFF" }, { n: "Sandbeige", h: "#E8DBB7" }, { n: "Silber", h: "#87909A" },
    { n: "Schwarz", h: "#000000" }, { n: "Rot", h: "#D32941" }, { n: "Orange", h: "#FF6A13" },
    { n: "Gelb", h: "#FFC72C" }, { n: "Olivgrün", h: "#789D4A" }, { n: "Azurblau", h: "#489FDF" },
    { n: "Blau", h: "#0A2CA5" }, { n: "Dunkelblau", h: "#0C2340" }, { n: "Violett", h: "#AF1685" },
  ],
  TPU: [
    { n: "Weiss", h: "#FFFFFF" }, { n: "Grau", h: "#898D8D" }, { n: "Schwarz", h: "#101820" },
    { n: "Rot", h: "#C8102E" }, { n: "Gelb", h: "#F3E600" }, { n: "Blau", h: "#0072CE" },
  ],
};

// Farbton zu einem getippten Namen finden (erst im gewählten Material, sonst
// materialübergreifend). Ermöglicht: "Beige" tippen -> Farbe wird automatisch gesetzt.
function hexForName(material: Material, name: string): string | null {
  const key = name.trim().toLowerCase();
  if (!key) return null;
  const hit =
    KNOWN[material].find((c) => c.n.toLowerCase() === key) ||
    MATERIALS.flatMap((m) => KNOWN[m]).find((c) => c.n.toLowerCase() === key);
  return hit ? hit.h : null;
}

function Swatch({ hex, size = 20 }: { hex: string; size?: number }) {
  return (
    <span
      className="inline-block flex-none rounded-full border border-border"
      style={{ width: size, height: size, background: hex }}
    />
  );
}

export function FilamentManager({ rows }: { rows: Row[] }) {
  const [, startTransition] = useTransition();
  const [material, setMaterial] = useState<Material>("PLA");
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#1a1a1a");
  const [count, setCount] = useState(1);

  const grouped = useMemo(() => {
    const g: Record<Material, Row[]> = { PLA: [], PETG: [], ABS: [], TPU: [] };
    for (const r of rows) g[r.material].push(r);
    return g;
  }, [rows]);

  const totalSpools = useMemo(() => rows.reduce((s, r) => s + r.count, 0), [rows]);
  const totalColors = useMemo(() => rows.filter((r) => r.count > 0).length, [rows]);

  // Name tippen -> passenden Bambu-Farbton automatisch übernehmen (Farbblindheit).
  function onNameChange(v: string) {
    setColorName(v);
    const h = hexForName(material, v);
    if (h) setColorHex(h);
  }
  function onMaterialChange(m: Material) {
    setMaterial(m);
    setColorName("");
    const h = hexForName(m, colorName);
    if (h) setColorHex(h);
  }

  function add() {
    if (!colorName.trim()) return;
    startTransition(() =>
      addSpool({ material, colorName: colorName.trim(), colorHex, count: Number(count) || 1 }),
    );
    setColorName("");
    setCount(1);
  }

  const pickerValue = /^#[0-9a-fA-F]{6}$/.test(colorHex) ? colorHex : "#1a1a1a";

  return (
    <div className="space-y-5">
      {/* ---- Gesamtübersicht ---- */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl bg-accent/5 px-4 py-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold tabular-nums text-accent">{totalSpools}</span>
          <span className="text-sm font-semibold text-ink">Spulen gesamt</span>
        </div>
        <span className="text-sm text-muted">{totalColors} Farben aktiv</span>
        <div className="ml-auto flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          {MATERIALS.map((m) => (
            <span key={m}>
              <span className="font-semibold text-ink">{m}</span> {grouped[m].reduce((s, r) => s + r.count, 0)}
            </span>
          ))}
        </div>
      </div>

      {/* ---- Hinzufügen (kompakt) ---- */}
      <div className="rounded-xl border border-border bg-bg/40 p-3">
        <div className="flex flex-wrap items-end gap-2.5">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">Material</span>
            <select
              value={material}
              onChange={(e) => onMaterialChange(e.target.value as Material)}
              className={`${inputClasses} h-10 w-24 py-1.5`}
            >
              {MATERIALS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">Farbe</span>
            <input
              value={colorName}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="z. B. Beige"
              list="bambu-colors"
              className={`${inputClasses} h-10 w-44 py-1.5`}
            />
            <datalist id="bambu-colors">
              {KNOWN[material].map((c) => (
                <option key={c.n} value={c.n} />
              ))}
            </datalist>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">Farbton</span>
            <input
              type="color"
              value={pickerValue}
              onChange={(e) => setColorHex(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded-xl border-2 border-border bg-white p-1"
              aria-label="Farbton wählen"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">Anzahl</span>
            <input
              type="number"
              min={1}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className={`${inputClasses} h-10 w-16 py-1.5`}
            />
          </label>
          <Button type="button" onClick={add} className="h-10 py-1.5">+ Hinzufügen</Button>
        </div>
        <p className="mt-2 text-[11px] text-muted">
          Tipp: Bambu-Farbnamen tippen (z. B. „Beige") — der Farbton wird automatisch gesetzt.
        </p>
      </div>

      {/* ---- Bestand (kompakt, 2 Spalten) ---- */}
      {MATERIALS.map((m) => (
        <div key={m}>
          <div className="mb-1.5 flex items-baseline gap-2">
            <h2 className="text-base font-bold text-ink">{m}</h2>
            <span className="text-xs text-muted">
              {grouped[m].reduce((s, r) => s + r.count, 0)} Spulen · {grouped[m].filter((r) => r.count > 0).length} Farben
            </span>
          </div>

          {grouped[m].length === 0 ? (
            <p className="text-xs text-muted">Noch keine Farben erfasst.</p>
          ) : (
            <div className="grid gap-1.5 sm:grid-cols-2">
              {grouped[m].map((r) => (
                <div
                  key={r.id}
                  className={`flex items-center gap-2.5 rounded-lg border border-border px-2.5 py-1.5 ${r.count === 0 ? "opacity-45" : ""}`}
                >
                  <Swatch hex={r.colorHex} />
                  <span className="flex-1 truncate text-sm font-medium text-ink">{r.colorName}</span>
                  {r.count === 0 && (
                    <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                      leer
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => startTransition(() => adjustSpool(r.id, -1))}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-ink hover:bg-bg disabled:opacity-40"
                    disabled={r.count === 0}
                    aria-label="Eine weniger"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-bold tabular-nums text-ink">{r.count}</span>
                  <button
                    type="button"
                    onClick={() => startTransition(() => adjustSpool(r.id, 1))}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-ink hover:bg-bg"
                    aria-label="Eine mehr"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => startTransition(() => deleteSpool(r.id))}
                    className="text-muted hover:text-red-600"
                    aria-label="Entfernen"
                    title="Entfernen"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
