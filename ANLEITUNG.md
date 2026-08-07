# Skuvert Dashboard – Schritt-für-Schritt bis live

Der Code ist fertig, geprüft (Build + Lint laufen durch) und lokal committet. Diese Anleitung bringt ihn von deinem PC auf eine echte, für dich erreichbare Web-Adresse. Reihenfolge genau einhalten, dann klappt's.

Rechne mit ca. 20–30 Minuten, alles kostenlos (Neon Free Tier + Vercel Free Tier).

---

## Schritt 0: Auf GitHub pushen

Das Repo `skuvert/Skuvert-Dashboard` existiert schon (leer) und ist als `origin` lokal eingetragen. Es fehlt nur noch der Push — das kann ich nicht selbst auslösen (von Claude Code aus grundsätzlich blockiert), also einmal manuell im Terminal (Ordner `dashboard`):

```bash
git push -u origin master
```

Danach ist der Code unter `https://github.com/skuvert/Skuvert-Dashboard` sichtbar.

---

## Schritt 1–3: Neon-Datenbank, Konfiguration, lokaler Test — ✅ bereits erledigt

Du hast den Connection-String geschickt, den Rest habe ich übernommen:

- `.env` ausgefüllt (liegt lokal, nicht auf GitHub)
- `npx prisma migrate deploy` — alle Tabellen angelegt
- `npm run db:seed` — Hilfsmittel-Preistabellen befüllt (10 Post-Preiszeilen, 7 eigene Preiszeilen)
- Echter End-to-End-Test gegen deine Neon-Datenbank: Login-Cookie geprüft, `/`, `/tools`, `/orders/new` laufen fehlerfrei, `/tools` zeigt die echten Seed-Daten, ein Test-Auftrag inkl. automatischer Checkliste wurde angelegt, über den Tracking-Token gefunden und wieder gelöscht.
- Dabei einen echten Bug gefunden und behoben: `npm run db:seed` hat `.env` bisher nicht geladen (nur der reguläre Prisma-Migrationsweg tat das) — jetzt gefixt und committet.

Ich habe dir ein zufälliges **Admin-Passwort** generiert und in deine lokale `.env` eingetragen (steht im Chat, nicht hier — diese Datei landet auf GitHub, auch wenn das Repo privat ist, Secrets gehören da grundsätzlich nicht rein). Am besten in einem Passwort-Manager sichern — du brauchst es gleich nochmal für Vercel (Schritt 4) und danach für jeden Login.

Wenn du selbst nochmal lokal testen willst: `npm run dev`, dann [localhost:3000](http://localhost:3000) öffnen, mit dem Passwort einloggen.

---

## Schritt 4: Auf Vercel live schalten

1. Gehe zu **[vercel.com](https://vercel.com)** → **"Sign Up"** / **"Log In"** → mit GitHub anmelden (`skuvert`-Account).
2. **"Add New…"** → **"Project"**.
3. Bei "Import Git Repository" das Repo **`skuvert-dashboard`** auswählen → **"Import"**.
4. Framework wird automatisch als **Next.js** erkannt — nichts ändern.
5. Bei **"Environment Variables"** zwei Einträge hinzufügen (Name / Value):
   - `DATABASE_URL` → derselbe Neon-Connection-String, den du mir geschickt hast (steht auch in deiner lokalen `.env`)
   - `ADMIN_PASSWORD` → derselbe Wert wie in deiner lokalen `.env` (oder ein eigenes neues Passwort, dann aber auch lokal in `.env` anpassen)
6. **"Deploy"** klicken. Dauert 1–2 Minuten. Vercel installiert die Pakete, erstellt den Prisma-Client, führt automatisch offene Migrationen aus (`vercel-build`-Skript) und baut die Seite.
7. Nach Abschluss zeigt Vercel dir die Live-URL, z. B. `https://skuvert-dashboard.vercel.app`. Öffnen, mit `ADMIN_PASSWORD` einloggen — fertig, das Dashboard ist live.

> Da Schritt 2 die Migration schon lokal gegen dieselbe Datenbank ausgeführt hat, findet Vercel beim ersten Deploy nichts mehr zu tun — das ist normal und kein Fehler. Bei künftigen Schema-Änderungen (z. B. wenn du später ein neues Datenfeld brauchst) übernimmt Vercel das ab jetzt automatisch bei jedem Deploy.

---

## Schritt 5: Danach — der normale Ablauf

1. Kundenanfrage kommt per Mail/Formular rein.
2. Text kopieren → im Dashboard **"+ Neue Anfrage"** → einfügen → Auftrag erstellen.
3. Angebots-E-Mail im Auftrag zusammenstellen (Positionen, Zahlungslink) → kopieren → in dein Mailprogramm einfügen → an Kunde senden.
4. Nach Zahlungseingang: internen Status auf "Bestätigt/Bezahlt" setzen, Kunden-Status auf "Angebot gesendet" o. ä. — die beiden Status sind bewusst getrennt, du entscheidest, was der Kunde sieht.
5. Checkliste während der Produktion abhaken.
6. Kunde sieht seinen Fortschritt jederzeit über seinen persönlichen Tracking-Link (steht automatisch am Ende der generierten E-Mail).

---

## Problembehebung

| Problem | Ursache / Lösung |
|---|---|
| Deploy schlägt fehl mit "Missing required environment variable: DATABASE_URL" | `DATABASE_URL` fehlt in den Vercel-Projekteinstellungen (Settings → Environment Variables) oder ist leer. Eintragen, dann **Redeploy**. |
| Login sagt "Falsches Passwort", obwohl du sicher bist | Gross-/Kleinschreibung prüfen; `ADMIN_PASSWORD` in Vercel muss exakt mit deiner Eingabe übereinstimmen. Nach Änderung in Vercel: Redeploy nötig, damit sie greift. |
| `/status/…`-Seite zeigt einen Serverfehler | Migration wurde nicht gegen die (richtige) Datenbank ausgeführt — prüfen, ob `DATABASE_URL` lokal und auf Vercel wirklich auf dieselbe Neon-Datenbank zeigt. |
| "Auftragsnummer existiert bereits" | Kein Bug — diese Nummer ist schon vergeben. Andere wählen oder den bestehenden Auftrag suchen. |
| `npx prisma migrate deploy` meldet einen Fehler zu `DATABASE_URL` | `.env` im `dashboard`-Ordner prüfen — der Wert darf nicht leer sein und muss in Anführungszeichen stehen. |
| Neon-Datenbank "schläft" nach Inaktivität | Normal beim Free Tier — der erste Aufruf nach einer Pause dauert 1–2 Sekunden länger, dann läuft's normal weiter. |

---

## Optional: eigene Domain

Falls du dem Dashboard später eine eigene Adresse geben willst (z. B. `intern.skuvert3d.ch`), geht das in Vercel unter **Project → Settings → Domains** — braucht einen DNS-Eintrag bei deinem Domain-Anbieter. Nicht nötig, die `vercel.app`-Adresse funktioniert genauso gut für ein internes Tool, das nur du nutzt.
