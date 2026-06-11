# tt/ TypeTest — AI Typing Speed Analyzer

A dark-themed, browser-based typing speed test with live character highlighting, real-time WPM tracking, and persistent session history.

## Features

- Live character highlights — green for correct, red for errors, blinking cursor
- Real-time stats — WPM, accuracy %, and error count updated every second
- Auto-advance — moves to the next paragraph when you finish one correctly
- Duration toggle — 30s, 60s, 2m, 5m pill buttons
- Session history — WPM progress chart persisted in localStorage (last 20 sessions)
- Session metadata — each result saved using the schema defined in model.json

## Files

| File           | Purpose                                                    |
|----------------|------------------------------------------------------------|
| index.html     | App markup and layout                                      |
| style.css      | Dark theme, mint accent, character highlight classes       |
| script.js      | Timer, stats, rendering, localStorage persistence, chart   |
| paragraphs.js  | Array of 8 typing passages selected randomly each test     |
| model.json     | Session data schema (runtime data lives in localStorage)   |

## Getting Started

No build step needed. Open index.html in a browser, or serve locally:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then visit http://localhost:8080

## Deploying to GitHub Pages

1. Push this repo to GitHub
2. Go to Settings → Pages
3. Set source to: Deploy from a branch → main → / (root)
4. Live at: https://<username>.github.io/<repo-name>
