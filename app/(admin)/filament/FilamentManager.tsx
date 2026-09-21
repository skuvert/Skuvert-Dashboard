"use client";

import { useMemo, useState, useTransition } from "react";
import { addSpool, adjustSpool, deleteSpool } from "@/lib/actions/filament";
import { inputClasses } from "@/components/ui/field";
import { Button } from "@/components/ui/Button";

type Material = "PLA" | "PETG" | "ABS" | "TPU";
type Row = { id: string; material: Material; colorName: string; colorHex: string; count: number };

const MATERIALS: Material[] = ["PLA", "PETG", "ABS", "TPU"];

// Bekannte Standardfarben je Material – als Schnellauswahl beim Hinzufügen.
// (Deckt sich mit der bisherigen Website-Palette; eigene Farben gehen zusätzlich.)
const KNOWN: Record<Material, { n: string; h: string }[]> = {
  PLA: [
    { n: "Schwarz", h: "#1a1a1a" }, { n: "Grau", h: "#9ca3af" }, { n: "Weiss", h: "#f0f0f0" },
    { n: "Blau", h: "#2563eb" }, { n: "Dunkelblau", h: "#1e3a8a" }, { n: "Hellblau", h: "#7dd3fc" },
    { n: "Türkis", h: "#14b8a6" }, { n: "Rot", h: "#e02020" }, { n: "Orange", h: "#f97316" },
    { n: "Hellorange", h: "#fdba74" }, { n: "Gelb", h: "#facc15" }, { n: "Braun", h: "#92400e" },
    { n: "Grün", h: "#16a34a" }, { n: "Silber", h: "#c8c8c8" }, { n: "Gold", h: "#d4af37" },
  ],
  PETG: [
    { n: "Grau", h: "#9ca3af" }, { n: "Schwarz", h: "#1a1a1a" }, { n: "Dunkelgrün", h: "#14532d" },
    { n: "Durchsichtig", h: "repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%) 50% / 10px 10px" },
    { n: "Misty Blue", h: "#9db4c0" },
  ],
  ABS: [{ n: "Schwarz", h: "#1a1a1a" }, { n: "Weiss", h: "#f0f0f0" }],
  TPU: [{ n: "Schwarz", h: "#1a1a1a" }, { n: "Grau", h: "#9ca3af" }],
};

function Swatch({ hex, size = 22 }: { hex: string; size?: number }) {
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

  function add() {
    if (!colorName.trim()) return;
    startTransition(() =>
      addSpool({ material, colorName: colorName.trim(), colorHex, count: Number(count) || 1 }),
    );
    setColorName("");
    setCount(1);
  }

  // gültiger Hex-Wert für das native <input type=color> (Gradienten ausklammern)
  const pickerValue = /^#[0-9a-fA-F]{6}$/.test(colorHex) ? colorHex : "#1a1a1a";

  return (
    <div className="space-y-8">
      {/* ---- Hinzufügen ---- */}
      <div className="rounded-xl border border-border bg-bg/40 p-4">
        <div className="mb-3 text-sm font-bold text-ink">Spule hinzufügen</div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Material</span>
            <select
              value={material}
              onChange={(e) => {
                setMaterial(e.target.value as Material);
                setColorName("");
              }}
              className={`${inputClasses} w-28`}
            >
              {MATERIALS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Farbe</span>
            <input
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              placeholder="z. B. Schwarz"
              className={`${inputClasses} w-44`}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Farbton</span>
            <input
              type="color"
              value={pickerValue}
              onChange={(e) => setColorHex(e.target.value)}
              className="h-11 w-14 cursor-pointer rounded-xl border-2 border-border bg-white p-1"
              aria-label="Farbton wählen"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Anzahl</span>
            <input
              type="number"
              min={1}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className={`${inputClasses} w-20`}
            />
          </label>

          <Button type="button" onClick={add}>+ Hinzufügen</Button>
        </div>

        {/* Schnellauswahl bekannter Farben des gewählten Materials */}
        <div className="mt-3 flex flex-wrap gap-2">
          {KNOWN[material].map((c) => (
            <button
              key={c.n}
              type="button"
              onClick={() => { setColorName(c.n); setColorHex(c.h); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-xs font-medium text-ink hover:border-accent"
            >
              <Swatch hex={c.h} size={14} />
              {c.n}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Bestand ---- */}
      {MATERIALS.map((m) => (
        <div key={m}>
          <div className="mb-2 flex items-baseline gap-2">
            <h2 className="text-lg font-bold text-ink">{m}</h2>
            <span className="text-xs text-muted">
              {grouped[m].reduce((s, r) => s + r.count, 0)} Spulen · {grouped[m].filter((r) => r.count > 0).length} Farben
            </span>
          </div>

          {grouped[m].length === 0 ? (
            <p className="text-sm text-muted">Noch keine Farben erfasst.</p>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {grouped[m].map((r) => (
                <li
                  key={r.id}
                  className={`flex items-center gap-3 px-3 py-2 ${r.count === 0 ? "opacity-45" : ""}`}
                >
                  <Swatch hex={r.colorHex} />
                  <span className="flex-1 text-sm font-medium text-ink">{r.colorName}</span>
                  {r.count === 0 && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                      ausgegangen
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startTransition(() => adjustSpool(r.id, -1))}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-ink hover:bg-bg disabled:opacity-40"
                      disabled={r.count === 0}
                      aria-label="Eine weniger"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-bold tabular-nums text-ink">{r.count}</span>
                    <button
                      type="button"
                      onClick={() => startTransition(() => adjustSpool(r.id, 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-ink hover:bg-bg"
                      aria-label="Eine mehr"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => startTransition(() => deleteSpool(r.id))}
                    className="ml-1 text-xs text-muted hover:text-red-600"
                  >
                    Entfernen
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
