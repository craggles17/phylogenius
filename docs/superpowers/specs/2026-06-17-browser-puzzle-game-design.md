# Phylogenius Puzzles — In-Browser Game (Design Spec)

**Date:** 2026-06-17
**Status:** Approved (brainstorming gate passed)
**Branch:** `worktree-feature+browser-puzzle-game`

## Goal

Turn the existing print-and-play card data into a **fully playable in-browser puzzle
game**. A single static page offers a menu of three solo puzzle modes across all three
decks. No backend, no framework, no build step beyond emitting a JSON dataset.

"Done" = served page loads; all three modes are playable end-to-end with scoring and
restart; engine logic is unit-tested green; a headless browser smoke test drives each
mode successfully.

## Scope (locked decisions)

| Decision | Choice |
|----------|--------|
| Modes | Menu with **Timeline**, **Cladogram Builder**, **Memory Match** |
| Polish | Single polished session per mode (score + restart). No daily/seed/share. |
| Tech | Vanilla JS (ES modules) + CSS, reuse existing `card-extractor` pipeline |
| Decks | All three selectable (Cambrian, Human Genetics, Universal Evo) |
| Cladogram prereqs | **Normalize source data**: canonical alias map → `prereqIds` per card |

Mode/deck applicability:
- **Timeline** — all decks. Temporal decks order by MYA (oldest→newest); Human deck has
  no MYA, so it orders by **global frequency %** (rarest→common). Abstracted by
  `compareByValue(a, b, deck)`.
- **Cladogram Builder** — temporal decks only (Evo, Cambrian). Human deck has no
  prereqs; it is hidden/disabled for this mode.
- **Memory Match** — all decks.

## Architecture

**Core principle:** pure **engine** (orderable values, placement validity, match rules,
scoring) is separate from thin **DOM/UI**. Engine modules are pure ES modules importable
in both Node (for `node --test`) and the browser. This is what enables TDD and low LoC.

### Data flow
```
*_deck.md ──► card-extractor.js ──► game-data.js generator ──► dist/game/cards.json
                  (FIXED + alias map)                                    │
                                                                         ▼ fetch()
  index.html ──► main.js ──► data.js (index) ──► modes/* ──► engine/* (validate)
                                │                     │
                                └──► ui/* (render) ◄──┘  state.js (score, localStorage)
```

### Source layout (committed)
```
game/
  index.html                  menu + board container, imports src/main.js as module
  styles/game.css             game chrome; reuses styles/variables.css + styles/card.css
  src/
    main.js                   bootstrap: load cards.json → render menu → route to mode
    data.js                   load/index cards; drawHand(); deterministic RNG (mulberry32)
    state.js                  session score/lives + best-score persistence (localStorage)
    engine/
      timeline.js             compareByValue, isCorrectPlacement, scoreTimeline
      cladogram.js            canPlace (uses prereqIds + MYA), scoreCladogram
      memory.js               isMatch(criterion), valueBand, scoreMemory
    modes/
      timeline.js             controller: hand → board, wire engine → ui
      cladogram.js            controller: tree placement
      memory.js               controller: grid flip/match
    ui/
      card.js                 renderCard(card,{faceDown}) → element matching card.hbs
      menu.js                 deck + mode selector
      board.js                shared drag/drop + layout helpers
scripts/
  build.js                    + `data` and `serve` subcommands
  parsers/card-extractor.js   FIXED column mapping; emits prereqIds via alias map
  parsers/trait-aliases.js    NEW: canonical prereq/enables → card-id resolver
  generators/game-data.js     NEW: emit cards.json
tests/
  *.test.js                   node:test over engine/* + alias resolver + smoke (puppeteer)
```

## Data contract — `dist/game/cards.json`

```jsonc
{
  "decks": {
    "evo": {
      "id": "evo", "title": "Universal Evo",
      "valueType": "mya",          // "mya" | "percent"
      "hasPrereqs": true,
      "suits": { "Structural": {"primary":"#F5F5DC","secondary":"#FFFAF0","icon":"🦴"}, ... },
      "cards": [
        { "id":"S05", "trait":"Vertebral Column", "suit":"Structural", "deckType":"evo",
          "mya":480, "era":"ORD", "eraColor":"#8BC34A", "clade":"🐟",
          "prereq":"Notochord", "enables":"Jaws, Limbs",
          "prereqIds":["S04"], "enableIds":["S06","S09"],
          "colors":{"primary":"#F5F5DC","secondary":"#FFFAF0","icon":"🦴"},
          "flavour":"…" }
      ]
    },
    "cambrian": { "valueType":"mya", "hasPrereqs":true, ... },
    "human":    { "valueType":"percent", "hasPrereqs":false,
                  "cards":[{ "id":"S01","trait":"…","globalPercent":8,"gene":"…",
                             "rsid":"…","peak":"…","effect":"…","h2":1.0, ... }] }
  }
}
```

`prereqIds`/`enableIds` are resolved by `trait-aliases.js` from the free-text
`prereq`/`enables` strings to canonical card ids within the same deck. Unresolved tokens
are dropped and **logged** during build (no silent loss). A card with empty `prereqIds`
is root-eligible in Cladogram.

## Engine interfaces (pure; the parallel-build contract)

```js
// engine/timeline.js
export function compareByValue(a, b, deck)        // -1|0|1, ascending = correct order
export function isCorrectPlacement(card, leftCard, rightCard, deck) // bool
export function scoreTimeline({ correct, total })  // number

// engine/cladogram.js
export function canPlace(card, placedById, deck)   // { ok:boolean, reason:string }
export function scoreCladogram({ placed, branches }) // number

// engine/memory.js
export const MATCH_CRITERIA = ['suit','valueBand','clade']
export function valueBand(card, deck)              // string bucket
export function isMatch(a, b, criterion, deck)     // bool
export function scoreMemory({ pairs, moves })      // number
```

Scoring (from `core_rules.md`, simplified for solo play):
- Timeline: +1 per correct placement; 3 lives; session ends at 0 lives or hand empty.
- Cladogram: +5 correct placement; +20 per connected branch ≥5; invalid = rejected (no
  score change), card returns to hand.
- Memory: +5 per pair, +10 if both cards convergent (🌿 in clade); fewer moves = better.

## Latent extractor bugs to fix (foundation step, atomic)

`scripts/parsers/table-parser.js#normalizeHeader` produces keys the extractor never
reads:
- `#` → `''` ⇒ `card.id` is empty today (see `dist/cards/evo/-jaws.html` filenames).
- `Global %` → `'global'` ⇒ extractor reads `'global__'`; all human frequencies = 0.
- `h²` → `'h'` ⇒ extractor reads `'h_'`; all heritability defaults to 0.5.

Fix `card-extractor.js` to read the real keys (`''`, `'global'`, `'h'`). This also
repairs the existing PDF/HTML pipeline (correct ids in filenames). Committed separately
from the game-data generator.

## Tooling

- `node scripts/build.js data` → write `dist/game/cards.json` (+ copy `game/` assets and
  `styles/` into `dist/game/`).
- `node scripts/build.js serve [port]` → first-class static server for `dist/` (fetch of
  cards.json requires http, not `file://`). No new dependency.
- `npm run game` = `data` then print the serve URL. `npm test` = `node --test`.

## Testing & verification

- `node --test tests/` green: engine modules + alias resolver (every deck's prereqs
  resolve; report any unresolved).
- `build.js data` produces schema-valid `cards.json` (counts match deck headers).
- Headless **puppeteer** smoke test (reuses existing dep): boot ephemeral server, load
  page, assert menu renders, start each mode, perform one scoring move, assert score
  updates and Restart resets.

## Out of scope (YAGNI)

Daily seed, result sharing, multiplayer/AI, online persistence/accounts, sound, the
auction/rummy/war/20-questions/extinction modes, mobile-native packaging.
