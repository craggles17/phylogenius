# Phylogenius

A markdown-driven evolutionary card game system. Three decks of cards are authored as
markdown tables and compiled into printable cards, a rulebook, and PDFs — and now into a
static, in-browser solo puzzle game.

- **Decks** (authored in the root `*_deck.md` files)
    - **Universal Evo** (`universal_evo_deck_1.md`) — 80 cards, the animal kingdom's
      innovations, ordered by **mya** (millions of years ago), with evolutionary prerequisites.
    - **Cambrian Prehistory** (`cambrian_prehistory_deck.md`) — 80 cards, ordered by **mya**,
      with prerequisites.
    - **Human Genetics** (`human_genetics_deck.md`) — 96 cards, ordered by **global frequency
      (percent)**, no prerequisites.

## Play in browser

A static, no-framework, no-bundler puzzle game over all three decks. Four modes:

- **Timeline** — drop cards into the correct order (oldest→newest for mya decks,
  rarest→most-common for the human deck).
- **Cladogram Builder** — build an evolutionary tree: a card is placeable only once its
  prerequisites are on the tree and it is later than its parents. Available for the Evo and
  Cambrian decks (the Human deck has no prerequisites).
- **Memory Match** — flip tiles to find pairs that share a suit, value band, or clade.
- **Which Came First** — a quick pairwise quiz: pick which of two cards came first (or is
  rarer for the human deck). Correct → +1, wrong → lose a life.

### Run it

```bash
npm install
npm run game        # builds dist/game/ then serves it
```

Then open <http://localhost:8080/game/>.

`npm run game` is `build data` + `serve`. You can run them separately:

```bash
npm run data                  # emit dist/game/ (cards.json + a self-contained bundle)
node scripts/build.js serve   # serve dist/ at http://localhost:8080/game/
```

> The browser bundle is assembled into `dist/game/` by the `data` step (it copies the
> `game/` sources and the shared `styles/`), so always build before serving — opening the
> source `game/index.html` directly will not resolve its styles.

### How it's built

- `game/src/engine/*` — pure, DOM-free rules + scoring (`timeline`, `cladogram`, `memory`);
  importable in both Node and the browser.
- `game/src/{data,state}.js` — deterministic deck loading / hand-dealing and session state.
- `game/src/ui/*` — thin DOM helpers (card rendering, menu, drag/drop); reuse `styles/card.css`.
- `game/src/modes/*` + `game/src/main.js` — wire engines to the UI and route between modes.

## Print / PDF pipeline

```bash
make all            # cards + rulebook + PDFs into dist/
make cards          # HTML card pages + print sheets
make rulebook       # HTML rulebook
make pdf            # rulebook + per-deck card-sheet PDFs
make help           # all targets
```

## Tests

```bash
npm test            # node --test over tests/
```

Engine, data, state, and UI/mode contracts are unit-tested; `tests/smoke.test.js` drives
every (deck, mode) combination end-to-end with headless puppeteer.

## Contributing

Project-local skills under `.claude/skills/` document the workflows:

- **building-and-serving** — the build/serve/test loop.
- **adding-cards-and-decks** — the markdown card-table contract the extractor expects.
- **game-architecture** — the engine/UI split and how to add a mode or deck.
