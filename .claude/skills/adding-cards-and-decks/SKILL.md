---
name: adding-cards-and-decks
description: The markdown card-table contract the Phylogenius extractor expects, the fixed column-key mapping, and the prereq/enables alias resolver. Use when editing deck *.md files, adding cards, or wiring cladogram prerequisites.
---

# Adding cards and decks

Decks live as markdown tables in repo-root `*.md` (e.g. `universal_evo_deck_1.md`,
`cambrian_prehistory_deck.md`, `human_genetics_deck.md`). `scripts/parsers/table-parser.js`
slices tables under a `#`/`##` heading; `scripts/parsers/card-extractor.js` turns rows
into card objects.

## The table contract

- A table is treated as a card table when a row has a `trait` or `card` column
  (`findCardTables`). The heading above it becomes the suit title
  (`extractSuitFromTitle`, e.g. `## 🦴 Structural (16 cards)` -> suit `Structural`).
- The suit name must match a key in the deck's color map in
  `scripts/utils/color-utils.js` (`EVO_COLORS`, `CAMBRIAN_COLORS`, `HUMAN_COLORS`),
  otherwise the card falls back to grey `?` colors.

## FIXED column-key behavior (do not regress)

`normalizeHeader` lowercases and collapses non-alphanumerics to `_`, trimming edges.
This collapses some headers to short keys the extractor must read by their real keys:

| Markdown header | Normalized key | Read as |
|-----------------|----------------|---------|
| `#`             | `''` (empty)   | `card.id` — `row[''] \|\| row['_'] \|\| row['number']` |
| `Global %`      | `global`       | `card.globalPercent` — `row['global']` |
| `h²`            | `h`            | `card.h2` — `row['h']` |

Earlier code read `'global__'` / `'h_'`, so every id was empty and every frequency /
heritability was zero. Keep `card-extractor.js` reading `''`, `'global'`, `'h'`.
Other columns map straightforwardly: `MYA`->`mya`, `Era`->`era`, `Clade`->`clade`,
`Prereq`->`prereq`, `Enables`->`enables`, `Gene`->`gene`, `Effect`->`effect`.

## Prereq / enables -> ids (cladogram prerequisite map)

`prereq` and `enables` are free text (comma-separated). After the whole deck is parsed,
`resolveConnections` calls `resolvePrereqIds(text, deckCards)` in
`scripts/parsers/trait-aliases.js` to produce `prereqIds` / `enableIds` (card ids in the
same deck). Resolution order per token: exact trait -> case-insensitive ->
token-subset (`Vertebrae` <-> `Vertebral Column`) -> curated `ALIAS_MAP`. Unresolved
tokens are dropped and `console.warn`-ed (no silent loss).

When adding a card whose prereq names a concept rather than the exact trait, prefer
matching the wording to an existing trait; only add an `ALIAS_MAP` entry as a last
resort. After editing, run `npm run data` and watch for `[trait-aliases] unresolved`
warnings.

## Key files

- `scripts/parsers/table-parser.js` — `normalizeHeader`, `findCardTables`.
- `scripts/parsers/card-extractor.js` — `buildTemporalCard`, `buildGeneticsCard`.
- `scripts/parsers/trait-aliases.js` — `resolvePrereqIds`, `ALIAS_MAP`.
- `scripts/utils/color-utils.js` — suit color maps (suit names must match).
