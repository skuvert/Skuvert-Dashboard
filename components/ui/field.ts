// Kein "w-full" hier drin: Tailwinds Kaskaden-Reihenfolge ist nicht die
// Reihenfolge der Klassen im Template-String, daher würde ein angehängtes
// "w-20"/"w-24" nicht zuverlässig gewinnen. Breite pro Aufrufstelle angeben.
export const inputClasses =
  "rounded-xl border-2 border-border bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent";

export const labelClasses = "block mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink";
