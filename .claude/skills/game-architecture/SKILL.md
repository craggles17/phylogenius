---
name: game-architecture
description: The pure-engine vs DOM/UI split, the cards.json data contract, and step-by-step recipes for adding a new game mode or a new deck in the Phylogenius browser game. Use when extending game/ logic or wiring a new mode/deck.
---

# Game architecture

**Core principle:** pure **engine** logic (ordering, placement validity, match rules,
scoring) is separate from thin **DOM/UI**. Engine and data modules are pure ES modules,
importable in both Node (`node:test`) and the browser. This is what enables TDD and keeps
LoC low. UI modules touch `document`; engine modules never do.

## Layers (under `game/src/`)

- `engine/timeline.js` — `compareByValue(a,b,deck)`, `isCorrectPlacement(card,left,right,deck)`,
  `scoreTimeline({correct,total})`. mya orders oldest->newest (compare by `-mya`);
  percent orders rarest->common (by `globalPercent`).
- `engine/cladogram.js` — `canPlace(card, placedById, deck) -> {ok,reason}`,
  `scoreCladogram({placed,branches})`. Root-eligible when `prereqIds` empty; else all
  prereqs present and `mya` strictly less than each parent (later in time).
- `engine/memory.js` — `MATCH_CRITERIA`, `valueBand(card,deck)`, `isMatch(a,b,criterion,deck)`,
  `scoreMemory({pairs,moves})`.
- `data.js` — `loadDecks(url='cards.json')`, `getDeck(data,id)`, `drawHand(deck,n,rng)`,
  `makeRng(seed)` (mulberry32). `drawHand` is pure given an `rng`.
- `state.js` — `createSession({mode,deckId})`, `addScore`, `loseLife`, plus
  `bestScore`/`saveBest` (localStorage, guarded for Node).
- `ui/` (DOM): `card.js` `renderCard`, `menu.js` `renderMenu`, `board.js` drag/drop.
- `modes/` (controllers): each default-exports `start(root, deck, onScore)`, wiring an
  engine to `ui/`. `main.js` bootstraps: `loadDecks()` -> `renderMenu` -> route to mode.

## cards.json contract (`dist/game/cards.json`)

`{ decks: { evo, cambrian, human } }`. Each deck: `id`, `title`,
`valueType` (`"mya"` | `"percent"`), `hasPrereqs` (bool), `suits` (color map), `cards[]`.
Cards carry `id`, `trait`, `suit`, `deckType`, `colors`; temporal cards add
`mya`/`era`/`clade`/`prereqIds`/`enableIds`; human cards add `globalPercent`/`gene`/`h2`.
Empty `prereqIds` => root-eligible in cladogram. Mode/deck applicability: Timeline and
Memory = all decks; Cladogram = `hasPrereqs===true` only (evo, cambrian; human disabled).

## Add a new mode

1. Write the pure rules + scoring in `game/src/engine/<mode>.js`; TDD it in
   `tests/<mode>.test.js` (`node --test tests/<mode>.test.js`).
2. Add a controller `game/src/modes/<mode>.js` default-exporting
   `start(root, deck, onScore)` that renders via `ui/` and validates via the engine.
3. Register the mode in `ui/menu.js` and route it in `main.js`. Gate by deck capability
   (e.g. require `deck.hasPrereqs`) if the mode does not apply to every deck.
4. Cover the happy path in `tests/smoke.test.js`.

## Add a new deck

1. Add the deck markdown at repo root following the `adding-cards-and-decks` skill, and a
   suit color map in `scripts/utils/color-utils.js`.
2. Register it in the `DECKS` map in `scripts/generators/game-data.js` (and the matching
   map in `scripts/build.js`) with `file`, `title`, `valueType`, `hasPrereqs`, `colors`.
3. `npm run data`, confirm the new deck and counts; it appears in the menu automatically.

## Key files

- `game/src/engine/{timeline,cladogram,memory}.js`, `game/src/data.js`, `game/src/state.js`.
- `scripts/generators/game-data.js` — deck registry + cards.json emit.
