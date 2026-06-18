---
name: building-and-serving
description: How to build, serve, and test the Phylogenius browser puzzle game. Use when generating cards.json, running the local server, or running node:test suites for this repo.
---

# Building and serving Phylogenius

The game is static: markdown decks -> `cards.json` -> a self-contained `dist/game/`
bundle the browser fetches. No bundler, no framework, no new runtime deps. ESM only
(`package.json` has `"type": "module"`); Node >= 18.

## The loop

1. **Generate data + bundle** — `npm run data` (= `node scripts/build.js data`).
   Calls `generateGameData()` in `scripts/generators/game-data.js`: extracts all three
   decks, writes `dist/game/cards.json`, copies `game/` into `dist/game/`, and copies
   `styles/variables.css`, `styles/card.css`, `styles/game.css` into `dist/game/styles/`.
   It prints per-deck card counts (expect roughly evo 80, cambrian ~80, human 96).

2. **Serve** — `npm run serve` (= `node scripts/build.js serve [port]`, default 8080).
   The `serve(port)` function in `scripts/build.js` is a first-class `node:http` static
   server over `dist/`. Open `http://localhost:8080/game/`. Serving over http (not
   `file://`) is required because the page does `fetch('./cards.json')`.

3. **One-shot** — `npm run game` runs `data` then `serve` back to back.

## Testing

- `npm test` (= `node --test tests/`) runs every suite.
- When working on a single concern, run only that file to avoid races:
  `node --test tests/timeline.test.js`.
- Engine and data modules are **pure** (no DOM), so they are importable and unit-tested
  directly under `node:test`. UI/DOM behavior is covered by the puppeteer smoke test
  (`tests/smoke.test.js`), which boots an ephemeral server and drives the real page.

## Self-contained bundle invariant

`game/index.html` must reference `styles/variables.css`, `styles/card.css`,
`styles/game.css` and `fetch('./cards.json')` using paths that resolve identically
whether opened from `game/` in source or from the copied `dist/game/`. Do not hardcode
absolute paths or a port.

## Key files

- `scripts/build.js` — CLI dispatch (`data`, `serve`, plus existing `cards`/`rulebook`/`pdf`).
- `scripts/generators/game-data.js` — `generateGameData()`, asset copy.
- `package.json` — `data`, `serve`, `game`, `test` scripts.
- `tests/` — `*.test.js` over the pure engine + data modules.
