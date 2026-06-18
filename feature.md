# Phylogenius — Goal & Feature Notes

## Goal (north star)

Phylogenius is a modular, **educational evolution & genetics card game**, authored once
as markdown decks and delivered in two forms:

1. **Print-and-play tabletop** — the original: printable cards + rulebook/PDF, 2–8
   players, many modes on a shared "core rules engine" (`core_rules.md`). Decks: Universal
   Evo, Cambrian Prehistory, Human Genetics.
2. **Static in-browser solo** — a no-framework adaptation reusing the same decks and the
   markdown→card pipeline. Pure engine (rules/scoring) split from thin DOM UI.

The browser edition covers the core *deep-time / rarity-judgment* modes.

### Browser game modes
- **Timeline** — drag cards into the correct chronological / rarity order. ✅ shipped
- **Which Came First** — pairwise quiz: shown two cards (values hidden), pick the one that
  came first (older MYA; for the human deck, "which is rarer", lower %). Streak + lives.
  ⏳ this feature
- **Cladogram Builder** — build the evolutionary tree honouring prerequisites. ✅ shipped
  (Evo/Cambrian only; human deck has no prereqs)
- **Memory Match** — flip tiles to find pairs (suit). ✅ shipped

## Active feature: "Which Came First" mode

**Branch:** `feat/craig.russell/which-came-first` (off the shipped game at `da023db`).

**Design**
- Reuse `engine/timeline.js#compareByValue(a, b, deck)` — already returns <0 when `a`
  comes first (older for `mya`, rarer for `percent`). No new ordering logic needed.
- New mode `game/src/modes/whichcamefirst.js`: deal a hand, present two cards at a time
  with their primary value hidden, ask which came first, reveal on pick, score a streak.
- Deck-adaptive prompt: `mya` → "Which came first?"; `percent` → "Which is rarer?".
- Available for all three decks (unlike Cladogram, which needs prereqs).
- Value-hidden card render: extend `ui/card.js renderCard(card, { hideValue })` to show the
  MYA/Freq value as "???" until revealed (trait, suit, clade stay visible).

**Wiring:** add to `main.js` MODES + `menu.js` mode buttons; add smoke scenarios.

**Verify:** `npm test` green (unit + puppeteer smoke across every deck × mode).
