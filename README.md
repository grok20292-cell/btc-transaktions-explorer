# Bitcoin-Transaktions-Explorer

Statische Einzelseite (D3 v7 per CDN), die Bitcoin-Transaktionen als interaktiven Graphen zeigt und Verbindungen zwischen zwei Adressen sucht. Daten kommen direkt im Browser von mempool.space (Ausweichquelle: blockstream.info).

- `index.html` – die komplette App
- `build.js` – Vercel-Build: kopiert `index.html` nach `public/` und erzeugt `apple-touch-icon.png` (ohne Abhängigkeiten)
- `vercel.json` – Build-Einstellungen

Optimiert für iPhone/Safari (Bottom-Sheet, Homescreen-Icon).
