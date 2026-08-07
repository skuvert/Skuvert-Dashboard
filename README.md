# Skuvert Dashboard

Internes Auftrags-Dashboard für [Skuvert, Custom 3D Service](https://skuvert.github.io): Kundenanfragen verwalten, Angebots-Mails erstellen, Bestellstatus verfolgen. Kunden erhalten einen privaten Link, unter dem sie den Fortschritt ihrer Bestellung sehen.

**Tech-Stack:** Next.js (App Router) + TypeScript, Tailwind CSS, Prisma + PostgreSQL, Deployment auf Vercel.

## 1. Lokale Entwicklung einrichten

### 1.1 Datenbank anlegen (Neon, kostenlos)

1. Auf [neon.com](https://neon.com) mit GitHub-Account registrieren (kostenloser Free-Tier reicht locker).
2. Ein neues Projekt anlegen (Region z.B. Frankfurt).
3. Im Dashboard unter **Connection Details** die **pooled** Connection-String-Variante kopieren (Häkchen/Toggle "Pooled connection" — Format `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require`).

   Alternative: [Supabase](https://supabase.com) Free-Tier funktioniert ebenso (dort die "Connection Pooling"-URI aus den Datenbank-Einstellungen verwenden). Die Schritte unten sind identisch, nur die `DATABASE_URL` unterscheidet sich.

### 1.2 Projekt konfigurieren

```bash
npm install
```

`.env` (liegt schon im Projektordner, siehe `.env.example` für die Vorlage) ausfüllen:

```
DATABASE_URL="<deine Neon Connection-String>"
ADMIN_PASSWORD="<ein selbst gewähltes Passwort>"
```

`ADMIN_PASSWORD` ist das einzige Passwort für den Admin-Bereich — es gibt kein Benutzerkonto, da nur du das Tool nutzt.

### 1.3 Datenbank-Schema anlegen + Beispieldaten

```bash
npx prisma migrate dev --name init
npm run db:seed
```

`migrate dev` legt alle Tabellen an, `db:seed` befüllt die Hilfsmittel-Preistabellen (`/tools`) mit einer Beispielstruktur.

### 1.4 Starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) — du wirst zum Login weitergeleitet, dort dein `ADMIN_PASSWORD` eingeben.

## 2. Deploy auf Vercel

1. Projekt auf [vercel.com](https://vercel.com) importieren (aus dem git-Repo, das du aus diesem Ordner erstellst — siehe unten).
2. Unter **Environment Variables** setzen:
   - `DATABASE_URL` — dieselbe Neon-Connection-String wie lokal (oder eine separate Produktions-DB, falls gewünscht).
   - `ADMIN_PASSWORD` — dein Passwort.
3. Deployen. Der Build-Befehl ist `vercel-build` (`prisma migrate deploy && next build`) — Vercel führt also bei jedem Deploy automatisch offene Migrationen aus, du musst das nicht manuell tun.
4. **Einmalig** die Beispieldaten für `/tools` einspielen (lokal, mit der Produktions-`DATABASE_URL` in `.env`): `npm run db:seed`.

### Eigenes git-Repo erstellen

Dieser Ordner ist bereits ein git-Repo mit einem fertigen Commit (Branch `master`). Um ihn auf GitHub zu pushen (per GitHub-CLI, dort bereits als `skuvert` eingeloggt):

```bash
gh repo create skuvert-dashboard --private --source=. --remote=origin --push
```

Alternative ohne `gh`: auf github.com ein neues, leeres Repo anlegen, dann:

```bash
git remote add origin <deine-neue-repo-url>
git push -u origin master
```

## 3. Struktur

- `app/(admin)/` — geschützter Bereich: Auftragsübersicht (`/`), neue Anfrage (`/orders/new`), Auftrags-Detail (`/orders/[id]`), Hilfsmittel (`/tools`)
- `app/login/` — Passwort-Login
- `app/status/[token]/` — öffentliche, kundenfreundliche Tracking-Seite (kein Login nötig)
- `lib/actions/` — Server Actions (alle Datenbank-Schreibvorgänge)
- `lib/order-types.ts` — Auftragstypen inkl. ihrer Default-Checklisten-Punkte. **Neuer Auftragstyp: hier einen Eintrag ergänzen**, keine Datenbank-Änderung nötig.
- `lib/status.ts` — Interne und Kunden-Status-Labels
- `prisma/schema.prisma` — Datenmodell
- `prisma/seed.ts` — Beispieldaten für die Hilfsmittel-Tabellen

## 4. Hinweise

- Passwortschutz ist bewusst einfach gehalten (ein Passwort, kein User-System) — für ein Single-User-Tool ausreichend.
- Der Kunden-Tracking-Link (`/status/{token}`) nutzt ein langes, zufälliges Token statt der Auftragsnummer — nicht erratbar, zeigt nur einen vereinfachten Status ohne Preise/Notizen.
- Es wird keine E-Mail automatisch versendet — der generierte Mailtext wird per "In Zwischenablage kopieren" in dein eigenes Mailprogramm übernommen.
