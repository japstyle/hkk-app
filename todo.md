# HKK App — TODO

## Completed
- [x] `kanjivg-loader.js` — fixed jsDelivr URL (`@master` → multi-source with GitHub raw as primary, jsDelivr release tag as fallback); removed confusing no-op filter; added proper error handling
- [x] `index.html` — added `advanceCharacter()` error handling when fetch fails; fixed `showWord()` to not silently overwrite fetch errors
- [x] Kanji tab — loader fix ensures kanji characters (学, 日, 私, etc.) are fetched dynamically from KanjiVG
- [x] `hiragana.html` — reviewed and removed (fully superseded by `index.html` which has all its functionality plus katakana/kanji modes)
- [x] `hiragana-strokes.js` — removed (orphaned file, unused by either HTML file)

## Feedback
- [ ] Fill in `feedback.md` with real tester notes once testing begins

## Nice to have (post-MVP)
- [ ] Real handwriting recognition (currently just checks if something was drawn for "Check" button)
- [ ] Score tracking / session history
- [ ] More words in each mode's word list
