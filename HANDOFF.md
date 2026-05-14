# HKK App — Handoff

## Project
**Japanese Writing Practice** — a single-page web app for practicing hiragana, katakana, and kanji stroke-by-stroke drawing. Built with plain HTML/CSS/JS, no frameworks. Uses KanjiVG stroke data (CC BY-SA 3.0).

## Files

| File | Purpose |
|---|---|
| `index.html` (39KB) | **Main app** — triple-mode UI, $1 recognizer, guide overlay, custom character search |
| `kanjivg-loader.js` (2KB) | Fetches KanjiVG SVGs from GitHub raw (primary) and jsDelivr CDN (fallback) |
| `prompt.txt` | Original spec that generated the first version |
| `feedback.md` | Empty template for tester notes |
| `todo.md` | Updated TODO list |
| `HANDOFF.md` | This file |

**Removed**: `hiragana.html` (older, superseded), `hiragana-strokes.js` (orphaned, unused).

## What Was Just Done

### Fixed: Dynamic stroke fetching from KanjiVG
**Root cause**: jsDelivr's `@master` URL hits a 50MB limit because the KanjiVG repo is ~75MB. Many characters returned 403 "Package size exceeded".

**Fix in `kanjivg-loader.js`**:
- Primary source: `raw.githubusercontent.com` (no size limit, always works)
- Fallback source: `cdn.jsdelivr.net` with release tag `@r20250816` (faster when cached)
- Removed confusing `!d.includes("stroke")` filter (was a no-op)
- Better error handling and logging

**Fix in `index.html`**:
- `advanceCharacter()` now handles fetch failures gracefully (shows error message instead of getting stuck)
- `showWord()` tracks fetch failures per character with a `fetchFailed` flag (no silent error overwrite)

### Removed: `hiragana.html` and `hiragana-strokes.js`
`hiragana.html` was a simpler single-mode predecessor. `index.html` fully supersedes it (same hiragana words + katakana + kanji modes + custom search). `hiragana-strokes.js` was orphaned (not loaded by either HTML file).

## Architecture Summary

```
kanjivg-loader.js          index.html
┌──────────────────┐       ┌──────────────────────────┐
│ KanjiVGLoader     │──────▶│ KVG {} (hardcoded paths  │
│  .getHex(char)    │       │   + fetched paths        │
│  .fetchPaths(char)│       │                          │
│  .fetchWord(str)  │       │ samplePath() / resample()│
└──────────────────┘       │ recognizeStroke()        │
                            │   ($1 recognizer)        │
                            │                          │
                            │ MODES { hiragana         │
                            │          katakana        │
                            │          kanji }         │
                            │                          │
                            │ Canvas drawing + guide   │
                            │ SVG overlay              │
                            └──────────────────────────┘
```

### Key Data Flow
1. User selects a mode (hiragana/katakana/kanji)
2. `showWord()` loads word list → fetches missing stroke data from KanjiVG
3. `buildGuide()` renders SVG guide overlay for the current character/stroke
4. User draws on canvas; on pen-up, `evaluateStroke()` runs $1 recognizer against template
5. If correct, green dot + advance to next stroke/character/word

### Key Constants
- `KVG_SIZE = 109` (KanjiVG viewBox)
- `SAMPLE_N = 64` (points per stroke for recognition)
- `THRESHOLD = 28` ($1 distance threshold for "good enough")

## What Remains

### Needs testers
- `feedback.md` — fill in with real user testing notes

### Post-MVP (feature work)
1. **Real handwriting recognition** — "Check" button currently just counts correct strokes from the $1 recognizer, doesn't evaluate overall character quality
2. **Score tracking / session history** — no persistence currently
3. **More words** — very small word lists in each mode
4. **KanjiVG loading indicator** — `showWord()` shows "Fetching..." text but there's no spinner/progress bar

## How to Test

Open `index.html` in any browser (works on desktop and mobile). No server needed — it's all client-side.

- **Hiragana tab**: 9 words, all hardcoded in `KVG` — no network fetch needed
- **Katakana tab**: 9 words, all hardcoded — no network fetch needed
- **Kanji tab**: 5 words, all fetched dynamically — requires internet
- **Custom search**: Type any character in the input field and click "Go" — fetches dynamically

### Testing the loader specifically
Switch to Kanji tab or use custom search with: 学, 日, 私, 生, 校, or any other CJK character. If the guide overlay appears (faint purple lines), the fetch succeeded.
