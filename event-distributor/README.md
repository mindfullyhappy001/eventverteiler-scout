# Event-Verteiler-App

Zentrale, modulare Steuerzentrale zum Erstellen, Verwalten und Verteilen von Events auf mehrere Plattformen per API oder UI-Bot.

## Stack
- Frontend: React + Vite + Tailwind (shadcn/ui)
- Backend: Node.js (Express), Prisma, PostgreSQL (auch Supabase)
- Automatisierung: Playwright (Node)

## Setup
```bash
cd event-distributor
bash setup.sh
# passe server/.env an (DATABASE_URL, API Keys)
# Server starten:
(cd server && bun run dev)
```

Frontend läuft auf der bereitgestellten Scout-URL. API auf http://localhost:8080 (anpassbar via .env).

## Funktionen
- Events: erstellen, bearbeiten, kopieren, löschen, Versionierung
- CSV Import/Export (alle Felder)
- Plattformen: Meetup, Eventbrite, Facebook (erweiterbar), je Modul strikt getrennt (API & UI-Bots getrennt)
- Publishing: API oder UI (Playwright), Scheduling, Retry, Status/Verifikation, Logs mit Belegen
- Dashboard: Filter/Suche/Sortierung, Status pro Event/Plattform, Logs-Ansicht

## Architektur & Guardrails
- server/src/platforms/<plattform>/{api,ui}
- ESLint + Skript `bun run boundary-check` erzwingt Trennung zwischen Plattformen.
- Orchestrierung lädt Adapter ausschließlich über Whitelist.

## Playwright-Bots
- Sitzungen (Cookies) werden je Plattform unter bots/sessions/<plattform> gespeichert.
- Captcha-Solver optional via .env (2Captcha/Anti-Captcha vorbereitbar).
- Artefakte (Screenshots, HTML) unter bots/artifacts/<jobId>/.

## CSV
- Export: GET /api/csv/export[?ids=,]
- Import: POST /api/csv/import (multipart/form-data, field: file)

## Erweiterung neuer Plattformen
1. Neues Modul unter `server/src/platforms/<name>/api/adapter.ts` (Interface implementieren)
2. UI-Bot unter `bots/src/<name>/createEvent.ts`
3. Adapter in `platformApiInvoker.ts` whitelisten
4. ESLint-Zonenregel ergänzen

## Sicherheit & Verifikation
- Nach jeder API-Veröffentlichung wird `get_status` aufgerufen.
- UI-Bots erzeugen Belege (Screenshots/DOM-Snapshot) und aktualisieren den Status.

---

## Deployment (Supabase-only, Production)

Diese App kann ohne eigenen Backend-Server direkt gegen Supabase betrieben werden. In der Produktion wird der Modus standardmäßig auf „supabase“ gesetzt. Die Supabase-Zugangsdaten werden zuerst aus ENV gelesen, optional dienen die UI-Felder als Fallback.

### Benötigte ENV-Variablen (Vercel)
- `VITE_SUPABASE_URL` = <Supabase Projekt-URL>
- `VITE_SUPABASE_ANON` = <Supabase Public Anon Key>

Hinweis: Wenn diese ENV in Vercel gesetzt sind, nutzt die App sie automatisch. Die Felder im Reiter „Plattformen – Konnektivität“ dienen nur als Fallback.

### Vercel Projekt-Konfiguration
Bevorzugt als Unterprojekt-Deployment:
- Root Directory: `event-distributor`
- Install Command: `bun install`
- Build Command: `bun run build`
- Output Directory: `dist`

Alternative (Monorepo-Root-Deployment): vercel.json im Repo-Root verwenden (siehe unten), das intern in `event-distributor` installiert und gebaut wird.

### Authentifizierung (Supabase Auth)
1. Erstelle in Supabase Auth einen Admin-User (E-Mail/Passwort oder Einladung/Magic Link).
2. Trage `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON` in Vercel als Environment Variables ein.
3. Lade die Datei `supabase/rls_prod.sql` im Supabase SQL Editor und führe sie aus.
   - Standard: authentifizierte Nutzer dürfen lesen/schreiben.
   - Optional: auf einen einzelnen Admin per E-Mail beschränken. Ersetze `<ADMIN_EMAIL>` in der Datei und verwende die entsprechend kommentierten Policies. Entferne/oder droppe zuvor die generischen Policies, um Überschneidungen zu vermeiden.
4. Prüfe, dass nicht authentifizierte Zugriffe abgewiesen werden und nach Login CRUD auf allen Tabellen funktioniert (`Event`, `EventVersion`, `PlatformConfig`, `PublishJob`, `EventPublication`, `LogEntry`).

### Frontend-Verhalten
- App ist standardmäßig im Supabase-Modus und zeigt eine Anmeldemaske (E-Mail/Passwort) an, bis ein gültiger Supabase-Auth-Session besteht.
- Nach erfolgreichem Login wird die App freigeschaltet. Abmelden ist jederzeit möglich.
- Hinweis neben den Supabase-Feldern: „Wenn in Vercel ENV gesetzt sind, werden sie automatisch genutzt; die Felder hier dienen als Fallback.“

### Nicht Bestandteil der Deployment-Pipeline
- `event-distributor-frontend-v2` (falls im Repo vorhanden) ist ein Template/Archiv und wird nicht deployt.

### Optional: vercel.json im Monorepo-Root
```json
{
  "installCommand": "cd event-distributor && bun install",
  "buildCommand": "cd event-distributor && bun run build",
  "outputDirectory": "event-distributor/dist"
}
```

### UI-Bot Automatisierung (Spontacts) – Supabase-only
- Plattform-Logins speicherst du in der App unter „Plattformen“. Diese werden in `PlatformConfig` (Supabase) persistiert und dauerhaft für die Bots genutzt.
- Erstelle Events im Dashboard. Zusätzliche Spontacts-Felder stehen im Formular zur Verfügung und werden in `Event.spontacts` gespeichert.
- Veröffentlichen (UI-Bot): Im Supabase-Modus wird ein `PublishJob` in Supabase angelegt.
- Ausführung: Starte den Bots-Worker lokal/Server, der Jobs aus Supabase verarbeitet und Playwright ausführt.

Bots-Worker starten
```bash
cd event-distributor/bots
bun install
bun run install:pw
# Variante 1: Service-Role Key
SUPABASE_URL=... SUPABASE_SERVICE_ROLE=... bun run supabase:worker
# Variante 2: Admin-Login (setzt zusätzlich Anon)
SUPABASE_URL=... VITE_SUPABASE_ANON=... SUPABASE_ADMIN_EMAIL=... SUPABASE_ADMIN_PASSWORD=... bun run supabase:worker
```
Der Worker pollt `PublishJob` (status=scheduled) und führt bei `spontacts/ui` den Bot `src/spontacts/createEvent.ts` aus. Nach Erfolg wird `EventPublication` und der Job-Status aktualisiert. Artefakte findest du unter `bots/artifacts/<jobId>/`.

