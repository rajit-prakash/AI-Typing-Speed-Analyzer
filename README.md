# ⌨️ AI Typing Speed Analyzer

A clean, browser-based typing speed test with live character highlighting, WPM tracking, accuracy measurement, and a persistent session history chart.

## Features

- **Live character highlights** — green for correct, red for errors, blinking cursor at current position
- **Real-time stats** — WPM, accuracy %, and error count update every second
- **Auto-advance** — moves to the next paragraph automatically when you finish one correctly
- **Configurable duration** — 30 s, 60 s, 2 min, or 5 min
- **Session history** — WPM progress chart persisted in `localStorage` (last 20 sessions)
- **Session metadata** — each session saved using the schema defined in `model.json`

## Files

| File | Purpose |
|------|---------|
| `index.html` | App markup and layout |
| `style.css` | All styles including character highlight classes |
| `script.js` | Timer, stats, rendering, and localStorage logic |
| `paragraphs.js` | Array of typing paragraphs |
| `model.json` | Session data schema (data stored in localStorage at runtime) |

## Getting Started

No build step needed — just open `index.html` in a browser, or serve with any static file server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Session Data Schema

Each completed test saves a session object to `localStorage` under the key `typingModel`, following the schema in `model.json`:

```json
{
  "id": "abc123",
  "date": "2026-06-11T14:32:05.000Z",
  "durationSetting": 60,
  "timeElapsed": 60,
  "paragraph": {
    "index": 2,
    "text": "Artificial intelligence helps analyze..."
  },
  "result": {
    "wpm": 58,
    "accuracy": 94,
    "errors": 7
  }
}
```

## Deploying to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch → main → / (root)**
4. Your app will be live at `https://<username>.github.io/<repo-name>`
