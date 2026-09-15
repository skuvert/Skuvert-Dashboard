"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-xl font-extrabold text-ink">Etwas ist schiefgelaufen</h1>
      <p className="mt-2 text-sm text-muted">
        Bitte versuche es erneut. Bleibt der Fehler, lade die Seite neu.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={reset} className={buttonClasses("secondary")}>
          Nochmal versuchen
        </button>
        <Link href="/" className={buttonClasses("primary")}>
          Zur Übersicht
        </Link>
      </div>
    </div>
  );
}
