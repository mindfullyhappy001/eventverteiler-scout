# Event Distributor Desktop Runner

Der Desktop‑Runner verarbeitet Supabase‑Jobs lokal mit Playwright. Er arbeitet kostenlos “nach und nach” (sequentiell/gebatcht) und kann später 1:1 auf Remote‑Browser (WS) oder Worker‑Plattformen umgestellt werden.

## Voraussetzungen
- Node.js (>=18) oder Bun
- Supabase Projekt (URL + Anon Key)
- Bot‑User (E‑Mail/Passwort) in Supabase Auth

## Installation
```bash
cd event-distributor/runner
bun install   # oder: npm i
cp .env.example .env
```

Öffne `.env` und setze:
- SUPABASE_URL = https://<euer>.supabase.co
- SUPABASE_ANON_KEY = <Anon Key>
- SUPABASE_BOT_EMAIL = <Bot-User E-Mail>
- SUPABASE_BOT_PASSWORD = <Bot-User Passwort>
- RUNNER_MODE = local
- PARALLELISM = 1 (später erhöhbar)
- SESSIONS_BUCKET = bot-sessions
- ARTIFACTS_BUCKET = bot-artifacts

## Buckets & Policies anlegen
In Supabase SQL Editor ausführen:
```
-- Datei: event-distributor/supabase/storage_setup.sql
```
Die Datei enthält Bucket‑Erstellung und RLS‑Policies (authentifizierte Write, public Read für Artefakte).

## Starten
- Dauerhaft: `bun start` (oder `npm run start`)
- Einzellauf: `bun run once` (oder `npm run once`)

Der Runner pollt `PublishJob`, führt Bots aus (UI‑Publishing oder action='discover'), speichert Artefakte/Sitzungen in Supabase Storage und aktualisiert `EventPublication`.

## Umschalten auf Remote‑Browser (später)
Setze in `.env`:
- RUNNER_MODE=ws
- WS_ENDPOINT=wss://... (Browserless/Sauce/BrowserStack)

Ohne Codeänderung.
