# Event-Verteiler Deployment Guide

## Vercel Deployment

Die Event-Verteiler App ist für die Bereitstellung auf Vercel optimiert.

### Automatische Deployment

1. **Repository mit Vercel verbinden**
   - Gehe zu [vercel.com](https://vercel.com)
   - Verbinde dein GitHub Repository
   - Wähle das `event-distributor` Verzeichnis als Root Directory

2. **Build Settings (automatisch erkannt)**
   - Framework: Vite
   - Build Command: `bun run build`
   - Output Directory: `dist`
   - Install Command: `bun install`

3. **Environment Variables (optional)**
   - `VITE_API_URL`: URL des Backend-Servers (falls verwendet)

### Funktionsweise

- **Supabase Modus**: Direkte Verbindung zur bereitgestellten Supabase-Datenbank
- **API Modus**: Verbindung zu einem separaten Backend-Server

### Bereits konfiguriert

✅ Supabase-Credentials sind bereits in der App eingebaut  
✅ Automatische Konfiguration beim ersten Start  
✅ Vollständiges Event-Management verfügbar  
✅ Responsive Design für alle Geräte  

### Hinweise

- Die App funktioniert sofort nach dem Deployment
- Alle Events und Daten werden in Supabase gespeichert
- Publishing-Features erfordern den Backend-Server (optional)

## Lokale Entwicklung

```bash
cd event-distributor
bun install
bun run dev
```

Die App läuft dann auf `http://localhost:5173`