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

