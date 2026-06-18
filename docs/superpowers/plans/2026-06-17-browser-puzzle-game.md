# Phylogenius Puzzles Implementation Plan

> **For agentic workers:** This plan is engine-translatable. Independent tasks fan out
> (`Workflow parallel()`); dependent chains pipeline. Each task carries file scope, a
> dependency flag, and a verification command. TDD throughout. The plan is the source of
> truth; the generated Workflow script is disposable.

**Goal:** Ship a static, in-browser solo puzzle game (Timeline, Cladogram Builder, Memory
Match) over all three Phylogenius decks, reusing the existing markdown→card pipeline.

**Architecture:** Pure engine ES modules (validation/scoring) separated from thin DOM/UI.
A new `build.js data` step emits `dist/game/cards.json`; the browser fetches it. No
framework, no bundler.

**Tech Stack:** Node ≥18 (ESM), vanilla browser ES modules + CSS, `node:test`, existing
`puppeteer` dep for the headless smoke test.

## Global Constraints

- ESM only (`"type":"module"`); no new runtime dependencies.
- Vanilla JS/CSS in `game/`; reuse `styles/variables.css` + `styles/card.css`.
- Engine modules are pure and import-safe in both Node and browser (no DOM access).
- Cladogram is gated to decks where `hasPrereqs === true` (Evo, Cambrian).
- Human deck `valueType==="percent"`; temporal decks `valueType==="mya"`.
- Atomic commits, Conventional Commits, author `ctr26`. No push.
- Indentation ≤4 levels; no `utils.js`/`helpers.js` (name modules by responsibility).

---

## Task 1: Foundation — fix extractor, alias resolver, data generator, serve (DEPENDENT: blocks all)

**Files:**
- Modify: `scripts/parsers/card-extractor.js` (column-key fixes; emit `prereqIds`/`enableIds`)
- Create: `scripts/parsers/trait-aliases.js`
- Create: `scripts/generators/game-data.js`
- Modify: `scripts/build.js` (add `data` + `serve` commands; copy `game/` assets)
- Modify: `package.json` (scripts: `game`, `serve`, `test`)
- Test: `tests/data.test.js`

**Interfaces — Produces:**
- `dist/game/cards.json` per the spec data contract (`decks.{evo,cambrian,human}`).
- `resolvePrereqIds(prereqText, deckCards) -> string[]` in `trait-aliases.js`.
- `generateGameData() -> {written:path, counts:{evo,cambrian,human}}` in `game-data.js`.

**Bug fixes (verbatim):** in `card-extractor.js`, read id from `row[''] || row['_'] || row['number']`;
human frequency from `row['global']`; heritability from `row['h']`. (Header
normalization maps `#`→`''`, `Global %`→`'global'`, `h²`→`'h'`.)

**Alias resolution:** match each comma-split prereq/enables token to a card in the same
deck by: exact trait match → case-insensitive → token-subset (e.g. `"Vertebrae"`↔`"Vertebral
Column"`, `"Bilateral"`↔`"Bilateral Symmetry"`) → curated alias map for the rest. Drop and
`console.warn` unresolved tokens (no silent loss).

- [ ] Step 1 — Write failing test `tests/data.test.js`:
```js
import { test } from 'node:test'; import assert from 'node:assert/strict'
import { generateGameData } from '../scripts/generators/game-data.js'
import { readFile } from 'node:fs/promises'
test('cards.json has all decks with non-empty ids and resolved values', async () => {
  await generateGameData()
  const data = JSON.parse(await readFile('dist/game/cards.json','utf8'))
  for (const id of ['evo','cambrian','human']) assert.ok(data.decks[id].cards.length > 0)
  const evo = data.decks.evo.cards
  assert.ok(evo.every(c => c.id && c.id.length >= 2))            // bug fix: ids present
  const vc = evo.find(c => c.trait === 'Vertebral Column')
  assert.deepEqual(vc.prereqIds, ['S04'])                        // alias: Notochord
  const human = data.decks.human.cards
  assert.ok(human.some(c => c.globalPercent > 0))                // bug fix: freq parsed
  assert.equal(data.decks.human.valueType, 'percent')
  assert.equal(data.decks.evo.hasPrereqs, true)
})
```
- [ ] Step 2 — Run `node --test tests/data.test.js` → FAIL (module missing).
- [ ] Step 3 — Implement bug fixes, `trait-aliases.js`, `game-data.js`, and `build.js`
  `data`/`serve` commands. `serve` uses `node:http`+`node:fs` to serve `dist/` (ports default 8080).
- [ ] Step 4 — Run `node --test tests/data.test.js` → PASS. Also run `node scripts/build.js data` and eyeball counts (evo 80, cambrian ~80, human 96).
- [ ] Step 5 — Commit `fix(parser): correct column keys; feat(build): game-data + serve`.

**Verify:** `node --test tests/data.test.js && node scripts/build.js data`

---

## Task 2: Engine — Timeline (INDEPENDENT after T1)

**Files:** Create `game/src/engine/timeline.js`; Test `tests/timeline.test.js`

**Interfaces — Consumes:** card objects from cards.json. **Produces:**
`compareByValue(a,b,deck)`, `isCorrectPlacement(card,leftCard,rightCard,deck)`,
`scoreTimeline({correct,total})`.

- [ ] Step 1 — Failing tests:
```js
import { test } from 'node:test'; import assert from 'node:assert/strict'
import { compareByValue, isCorrectPlacement, scoreTimeline } from '../game/src/engine/timeline.js'
const mya = {valueType:'mya'}, pct = {valueType:'percent'}
const A={mya:600}, B={mya:480}, C={mya:66}
test('mya orders oldest→newest ascending', () => {
  assert.equal(compareByValue(A,B,mya), -1)        // 600 older → before 480
  assert.equal(isCorrectPlacement(B,A,C,mya), true)
  assert.equal(isCorrectPlacement(C,A,B,mya), false)
})
test('percent orders rarest→common', () => {
  assert.equal(compareByValue({globalPercent:8},{globalPercent:40},pct), -1)
})
test('score is correct count', () => assert.equal(scoreTimeline({correct:4,total:5}), 4))
```
- [ ] Step 2 — Run → FAIL. Step 3 — Implement (mya: compare by `-mya`; percent: by `globalPercent`). Step 4 — PASS. Step 5 — Commit `feat(engine): timeline ordering + scoring`.

**Verify:** `node --test tests/timeline.test.js`

---

## Task 3: Engine — Cladogram (INDEPENDENT after T1)

**Files:** Create `game/src/engine/cladogram.js`; Test `tests/cladogram.test.js`

**Interfaces — Produces:** `canPlace(card, placedById, deck) -> {ok,reason}`,
`scoreCladogram({placed,branches})`. `placedById` is a `Map`/object of id→card already on tree.

Rules: ok if (`prereqIds` empty → root-eligible) OR (every prereqId present in `placedById`
AND card.mya < min parent mya among its prereqIds, i.e. strictly later than parents).

- [ ] Step 1 — Failing tests:
```js
import { test } from 'node:test'; import assert from 'node:assert/strict'
import { canPlace, scoreCladogram } from '../game/src/engine/cladogram.js'
const deck={hasPrereqs:true}
const root={id:'S01',mya:600,prereqIds:[]}
const child={id:'S04',mya:530,prereqIds:['S01']}
test('root with no prereq is placeable', () => assert.equal(canPlace(root,{},deck).ok, true))
test('child needs prereq present and later mya', () => {
  assert.equal(canPlace(child,{},deck).ok, false)                 // prereq missing
  assert.equal(canPlace(child,{S01:root},deck).ok, true)
  assert.equal(canPlace({...child,mya:700},{S01:root},deck).ok, false) // older than parent
})
test('branch bonus', () => assert.equal(scoreCladogram({placed:6,branches:1}), 6*5+20))
```
- [ ] Steps 2–4 — FAIL → implement → PASS. Step 5 — Commit `feat(engine): cladogram placement + scoring`.

**Verify:** `node --test tests/cladogram.test.js`

---

## Task 4: Engine — Memory Match (INDEPENDENT after T1)

**Files:** Create `game/src/engine/memory.js`; Test `tests/memory.test.js`

**Interfaces — Produces:** `MATCH_CRITERIA`, `valueBand(card,deck)`,
`isMatch(a,b,criterion,deck)`, `scoreMemory({pairs,moves})`.

valueBand: mya → bucket by era range (Ancient>500, Classic 500-200, Recent 200-50,
Modern<50); percent → Rare≤1, Uncommon 1-10, Common 10-30, Frequent 30-60, Universal>60.

- [ ] Step 1 — Failing tests:
```js
import { test } from 'node:test'; import assert from 'node:assert/strict'
import { isMatch, valueBand, scoreMemory } from '../game/src/engine/memory.js'
const mya={valueType:'mya'}
test('suit match', () => assert.equal(isMatch({suit:'Neural'},{suit:'Neural'},'suit',mya), true))
test('valueBand match', () => {
  assert.equal(valueBand({mya:600},mya), 'Ancient')
  assert.equal(isMatch({mya:600},{mya:520},'valueBand',mya), true)
})
test('clade match', () => assert.equal(isMatch({clade:'🌿'},{clade:'🐁🌿'},'clade',mya), true))
test('never match identical card instance is fine; score', () =>
  assert.equal(scoreMemory({pairs:3,moves:8}), 15))
```
- [ ] Steps 2–4 — FAIL → implement → PASS. Step 5 — Commit `feat(engine): memory match rules + scoring`.

**Verify:** `node --test tests/memory.test.js`

---

## Task 5: Browser data + state (INDEPENDENT after T1)

**Files:** Create `game/src/data.js`, `game/src/state.js`; Test `tests/state.test.js`

**Interfaces — Produces:**
- `data.js`: `loadDecks(url='cards.json') -> Promise<data>`, `getDeck(data,id)`,
  `drawHand(deck, n, rng)`, `makeRng(seed)` (mulberry32). `drawHand` is pure given `rng`.
- `state.js`: `createSession({mode,deckId})`, `addScore(s,n)`, `loseLife(s)`,
  `bestScore(mode,deckId)` / `saveBest(mode,deckId,score)` (localStorage; guarded for Node).

- [ ] Step 1 — Failing test for `drawHand` determinism + `state` scoring (pure parts only;
  `loadDecks`/localStorage are integration-tested in smoke):
```js
import { test } from 'node:test'; import assert from 'node:assert/strict'
import { drawHand, makeRng } from '../game/src/data.js'
import { createSession, addScore, loseLife } from '../game/src/state.js'
test('drawHand deterministic for a seed', () => {
  const deck={cards:Array.from({length:20},(_,i)=>({id:i}))}
  assert.deepEqual(drawHand(deck,5,makeRng(1)), drawHand(deck,5,makeRng(1)))
})
test('session scoring + lives', () => {
  let s=createSession({mode:'timeline',deckId:'evo'})
  s=addScore(s,3); assert.equal(s.score,3)
  s=loseLife(s); assert.equal(s.lives,2)
})
```
- [ ] Steps 2–4 — FAIL → implement → PASS. Step 5 — Commit `feat(game): data loader + session state`.

**Verify:** `node --test tests/state.test.js`

---

## Task 6: UI primitives — card, menu, board (DEPENDENT on T5 interfaces)

**Files:** Create `game/src/ui/card.js`, `game/src/ui/menu.js`, `game/src/ui/board.js`,
`game/styles/game.css`

**Interfaces — Produces:**
- `card.js`: `renderCard(card, {faceDown=false}) -> HTMLElement` — DOM mirrors
  `templates/card.hbs` classes (`card`,`card__header`,`card__title`,`card__data`,…) so
  `styles/card.css` applies; face-down renders a `.card--back`.
- `menu.js`: `renderMenu({decks, onStart}) -> HTMLElement` (deck picker + 3 mode buttons;
  disables Cladogram for `hasPrereqs===false` decks).
- `board.js`: `enableDrag(el, payload)`, `makeDropZone(el, onDrop)`, `clearBoard(root)`.

No DOM unit test (covered by smoke). Commit `feat(ui): card/menu/board primitives + styles`.

**Verify:** referenced classes exist in `styles/card.css`; `node -e "import('./game/src/ui/card.js')"` parses (jsdom not required — syntax check via dynamic import guarded by `typeof document`).

---

## Task 7: Mode controllers + bootstrap (DEPENDENT on T2,T3,T4,T5,T6)

**Files:** Create `game/src/modes/timeline.js`, `game/src/modes/cladogram.js`,
`game/src/modes/memory.js`, `game/src/main.js`, `game/index.html`

**Interfaces — Consumes:** all engine fns, `data.js`, `state.js`, `ui/*`.
**Produces:** each `modes/X.js` default-exports `start(root, deck, onScore)`; `main.js`
calls `loadDecks()` → `renderMenu` → routes to the chosen mode; renders score, lives, and
a Restart button. `index.html` is a single `<div id="app">` + `<script type="module"
src="src/main.js">` + links to `../styles/variables.css`, `../styles/card.css`,
`styles/game.css`.

Commit `feat(game): mode controllers + bootstrap page`.

**Verify:** `node scripts/build.js data` then `node scripts/build.js serve` loads `/game/`.

---

## Task 8: Headless smoke test (DEPENDENT on T1,T7)

**Files:** Create `tests/smoke.test.js`

Boot ephemeral server (reuse `serve` logic or `node:http` over `dist/`), launch puppeteer
headless, load `/game/index.html`, for each (deck,mode): start, perform one valid move,
assert score text updates, click Restart, assert reset. Skip Cladogram for Human deck.

- [ ] Step 1 — Write smoke test. Step 2 — `node --test tests/smoke.test.js` → iterate to PASS. Step 3 — Commit `test(game): puppeteer end-to-end smoke`.

**Verify:** `node scripts/build.js data && node --test tests/smoke.test.js`

---

## Task 9: Project-local skills (INDEPENDENT)

**Files:** Create `.claude/skills/building-and-serving/SKILL.md`,
`.claude/skills/adding-cards-and-decks/SKILL.md`,
`.claude/skills/game-architecture/SKILL.md`

Each: valid frontmatter (`name`, `description`), concise, project-native. Cover: the
build/serve/test loop; the markdown card-table contract the extractor expects (+ the
fixed column keys + alias map); the engine/UI split and how to add a new mode/deck.

Commit `docs(skills): add phylogenius project skills`.

**Verify:** frontmatter parses; paths referenced in skills exist.

---

## Task 10: Final integration review (DEPENDENT on all)

Run full `node --test`, `node scripts/build.js data`, adversarial code review
(correctness + simplification, terse), fix high-confidence findings, update root README
with a "Play in browser" section. Commit `docs: README play instructions`.

**Verify:** `node --test` all green; `git log --oneline` shows atomic commits.

## Self-review notes
- Spec coverage: data contract→T1; Timeline→T2; Cladogram→T3; Memory→T4; data/state→T5;
  UI→T6; controllers/page→T7; verification→T8; skills→T9; review/README→T10. ✓
- Types consistent across tasks (`compareByValue`, `canPlace`, `isMatch`, `drawHand`,
  `renderCard`, `start`). ✓
- No placeholders; every code step has real content. ✓
