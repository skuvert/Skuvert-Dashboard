# Skuvert Dashboard – Schritt-für-Schritt bis live

Der Code ist fertig, geprüft (Build + Lint laufen durch) und lokal committet. Diese Anleitung bringt ihn von deinem PC auf eine echte, für dich erreichbare Web-Adresse. Reihenfolge genau einhalten, dann klappt's.

Rechne mit ca. 20–30 Minuten, alles kostenlos (Neon Free Tier + Vercel Free Tier).

---

## Schritt 0: Auf GitHub pushen

Öffne ein Terminal im Ordner `dashboard` (Rechtsklick im Explorer → "Terminal öffnen", oder in VS Code).

```bash
gh repo create skuvert-dashboard --private --source=. --remote=origin --push
```

Das legt ein **privates** Repo namens `skuvert-dashboard` in deinem GitHub-Account (`skuvert`) an und pusht den fertigen Code hinein. Danach siehst du es unter `https://github.com/skuvert/skuvert-dashboard`.

> Kein `gh` zur Hand oder Fehler? Alternativ auf [github.com](https://github.com/new) manuell ein neues, **leeres** Repo `skuvert-dashboard` anlegen (kein README/.gitignore ankreuzen), dann:
> ```bash
> git remote add origin https://github.com/skuvert/skuvert-dashboard.git
> git push -u origin master
> ```

---

## Schritt 1: Neon-Datenbank anlegen (kostenlos)

1. Gehe zu **[neon.com](https://neon.com)** → **"Sign up"** → mit GitHub anmelden (derselbe `skuvert`-Account geht am einfachsten).
2. **"Create a project"** klicken. Name z. B. `skuvert-dashboard`, Region **Frankfurt (eu-central-1)** — am nächsten an der Schweiz.
3. Nach dem Erstellen landest du auf der Projektseite. Dort auf **"Connect"** (oder "Connection Details").
4. Wichtig: Toggle **"Pooled connection"** aktivieren, falls vorhanden — das ist die Verbindung, die mit Vercel funktioniert.
5. Den kompletten Connection-String kopieren. Er sieht so aus:
   ```
   postgresql://neondb_owner:xxxxx@ep-xxxxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
   → in eine Notiz/Editor zwischenspeichern, du brauchst ihn gleich zweimal (lokal + Vercel).

---

## Schritt 2: Projekt lokal fertig konfigurieren

Im Ordner `dashboard` die Datei **`.env`** öffnen (existiert schon, mit leeren Werten) und ausfüllen:

```env
DATABASE_URL="<dein Connection-String aus Schritt 1>"
ADMIN_PASSWORD="<ein Passwort deiner Wahl>"
```

`ADMIN_PASSWORD` ist das einzige Passwort für den Admin-Bereich — frei wählbar, nur du kennst es.

Danach im Terminal (im `dashboard`-Ordner):

```bash
npx prisma migrate deploy
npm run db:seed
```

- `migrate deploy` legt alle Tabellen in deiner Neon-Datenbank an.
- `db:seed` befüllt die Hilfsmittel-Preistabellen (`/tools`) mit Beispielzeilen, die du danach direkt anpassen kannst.

---

## Schritt 3: Lokal testen

```bash
npm run dev
```

Öffne **[http://localhost:3000](http://localhost:3000)**:

1. Du wirst zu `/login` weitergeleitet → dein `ADMIN_PASSWORD` eingeben.
2. **"+ Neue Anfrage"** → Testtext einfügen, z. B. `Hallo, ich hätte gerne SKV-2026-001, Testfigur in PLA. Gruss Anna` → Auftragsnummer wird automatisch erkannt.
3. Kundenname ausfüllen → **"Auftrag erstellen"**. Du landest auf der Detailseite.
4. Checkliste, Notizen, E-Mail-Generator kurz ausprobieren.
5. Den **Kunden-Tracking-Link** von der Detailseite kopieren und in einem privaten/Inkognito-Fenster öffnen — dort siehst du, was der Kunde sieht (kein Login nötig).

Läuft alles? Dann `Strg+C` im Terminal zum Stoppen, weiter zu Schritt 4.

---

## Schritt 4: Auf Vercel live schalten

1. Gehe zu **[vercel.com](https://vercel.com)** → **"Sign Up"** / **"Log In"** → mit GitHub anmelden (`skuvert`-Account).
2. **"Add New…"** → **"Project"**.
3. Bei "Import Git Repository" das Repo **`skuvert-dashboard`** auswählen → **"Import"**.
4. Framework wird automatisch als **Next.js** erkannt — nichts ändern.
5. Bei **"Environment Variables"** zwei Einträge hinzufügen (Name / Value):
   - `DATABASE_URL` → derselbe Neon-Connection-String wie in Schritt 1
   - `ADMIN_PASSWORD` → dein Passwort (kann dasselbe wie lokal sein oder ein neues)
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
