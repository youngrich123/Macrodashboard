# Macro Dashboard v3

Optimierte, mobilfreundliche Version des bestehenden FRED-Macro-Dashboards.

## Deployment auf Vercel

1. Diesen Ordner in ein GitHub-Repository hochladen oder direkt in Vercel importieren.
2. In **Project Settings → Environment Variables** eine Variable `FRED_API_KEY` anlegen.
3. Neu deployen.
4. Die URL am Handy öffnen und optional zum Homescreen hinzufügen.

## Was geändert wurde

- FRED-Key aus dem Browser entfernt; `/api/fred` hält ihn serverseitig.
- Keine öffentlichen CORS-Proxys mehr als primärer Datenweg.
- Browser-Standard `localStorage` statt `window.storage`.
- Stale-while-revalidate: Cache wird sofort angezeigt und im Hintergrund erneuert.
- Eigene Serien, aktiver Tab und Auto-Refresh werden gespeichert.
- Refresh beim Zurückkehren in die App, wenn der letzte Sync >30 min alt ist.
- Offline/PWA-App-Shell per Service Worker.
- Custom-FRED-IDs werden validiert.
- Richtungsänderungen sind neutral eingefärbt; Ampelfarbe bleibt der eigentlichen Signal-Logik vorbehalten.

## Lokal testen

Die HTML-Datei kann statisch geöffnet werden, aber der zuverlässige Datenweg ist die gehostete `/api/fred`-Function. Der direkte FRED-CSV-Abruf dient nur als Fallback.
