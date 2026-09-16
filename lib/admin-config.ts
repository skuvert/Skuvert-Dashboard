// Fallback-Zugangsdaten für den Admin-Login.
//
// Vorrang haben immer die Umgebungsvariablen ADMIN_PASSWORD_HASH und
// SESSION_SECRET (sicherer, weil nicht im Repo). Sind sie nicht gesetzt —
// z. B. wenn auf Vercel keine Env-Vars konfiguriert sind — nutzt die App
// diese Werte, damit der Login trotzdem funktioniert. Ein Passwortwechsel
// braucht dann nur einen Push (kein Vercel-Setup).
//
// Sicherheit: Das Passwort steht NICHT im Klartext hier, nur sein scrypt-Hash
// (nicht rückrechenbar). Das Repo ist privat. Wer es strenger will, setzt die
// Env-Vars in Vercel — die gewinnen dann automatisch.
//
// Passwort ändern:
//   npx tsx scripts/hash-password.ts "<neues-passwort>"
// und den ausgegebenen Hash unten bei FALLBACK_ADMIN_PASSWORD_HASH eintragen.

// Hash des aktuellen Passworts (scrypt, "salt:hash").
export const FALLBACK_ADMIN_PASSWORD_HASH =
  "d3497d94aaf606d45f88b7f8662da4b4:34b983f740ab886aa1790a95c05ff2ec35c6c3b2ba0fe5c01a7b2480ae2f75bf97dbe7f7cdf37e557d932a9caf35c73da9c11ebd8736b61f4af83add3d5b9d5a";

// Zufälliges Secret zum Signieren des Session-Cookies.
export const FALLBACK_SESSION_SECRET =
  "745133282958be37442fa0342418a1f7e9cfbd28d8bd5a05d796010c8f8dd768";
