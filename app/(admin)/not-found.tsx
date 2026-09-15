import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function AdminNotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-5xl font-extrabold text-accent">404</p>
      <h1 className="mt-3 text-xl font-extrabold text-ink">Nicht gefunden</h1>
      <p className="mt-2 text-sm text-muted">
        Diese Seite oder dieser Auftrag existiert nicht (mehr).
      </p>
      <Link href="/" className={`${buttonClasses("primary")} mt-6`}>
        Zur Übersicht
      </Link>
    </div>
  );
}
