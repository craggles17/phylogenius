# Phylogenius: Core Rules Engine

## Overview
A modular card game system where themed decks share common mechanics. Each deck can be played standalone or combined with others for expanded gameplay.

---

## Universal Card Anatomy

All cards across decks follow this standardized layout:

```
┌─────────────────────────────────┐
│ [SUIT ICON] TRAIT NAME      [#] │
│ Subtext / Scientific Reference  │
├─────────────────────────────────┤
│                                 │
│        ILLUSTRATION AREA        │
│          (40mm × 35mm)          │
│                                 │
├─────────────────────────────────┤
│ PRIMARY VALUE       SECONDARY   │
│ Category: Label     Modifier    │
├─────────────────────────────────┤
│ Prereq: XXX    │   Enables: YYY │
├─────────────────────────────────┤
│ "Flavour text in quotes"        │
├─────────────────────────────────┤
│ [══════ SUIT COLOUR BAR ══════] │
└─────────────────────────────────┘
```

### Required Elements

| Element | Description | Game Function |
|---------|-------------|---------------|
| Suit Icon | Category symbol | Set building, filtering |
| Trait Name | Primary identifier | All games |
| Card Number | Deck position (#) | Reference, variants |
| Primary Value | Numerical score | Runs, comparisons, bidding |
| Secondary Value | Context modifier | Bonus scoring, tiebreakers |
| Category Label | Suit name | Quick identification |
| Prerequisites | What must exist first | Builder games, chains |
| Enables | What this unlocks | Builder games, combos |
| Flavour Text | Thematic/educational | Engagement |
| Colour Bar | Visual suit identifier | Fast sorting |

---

## Deck Structure Standards

Each themed deck contains:

| Component | Count | Purpose |
|-----------|-------|---------|
| Standard Cards | 72-92 | Core gameplay |
| Special Cards | 4-6 | Wild cards, events |
| **Total** | 76-98 | Complete deck |

### Suit Distribution

Every deck has 5-7 suits (categories) with:
- Minimum 8 cards per suit
- Maximum 18 cards per suit
- Each suit spans the full value range
- Distinct colour and icon per suit

---

## Primary Value Systems

Decks use one of three value types:

### Type A: Temporal (MYA)
Used by: Cambrian Deck, Universal Evo Deck

| Range | Classification | Run Potential |
|-------|----------------|---------------|
| >500 MYA | Ancient | Foundation cards |
| 500-200 MYA | Classic | Core gameplay |
| 200-50 MYA | Recent | Higher risk/reward |
| <50 MYA | Modern | Specialty plays |

### Type B: Frequency (%)
Used by: Human Genetics Deck

| Range | Classification | Base Points |
|-------|----------------|-------------|
| ≤1% | Rare | 15 pts |
| 1-10% | Uncommon | 10 pts |
| 10-30% | Common | 7 pts |
| 30-60% | Frequent | 5 pts |
| >60% | Universal | 3 pts |

### Type C: Power Rating
Used by: Future expansion decks

| Range | Classification |
|-------|----------------|
| 1-3 | Weak |
| 4-6 | Moderate |
| 7-9 | Strong |
| 10 | Legendary |

---

## Set Mechanics

### Category Sets
**Requirement:** 3+ cards of the same suit
**Scoring:** Sum of base points + set bonus

| Set Size | Bonus |
|----------|-------|
| 3 cards | +5 |
| 4 cards | +10 |
| 5 cards | +20 |
| 6+ cards | +35 |

### Regional/Clade Sets
**Requirement:** 3+ cards sharing a secondary marker
**Scoring:** 10 points per card in set

### Convergent Sets
**Requirement:** 3+ cards marked as independently evolved
**Scoring:** 15 points per card (premium for evolutionary insight)

---

## Run Mechanics

### Standard Runs
**Requirement:** 3+ cards of same suit with sequential primary values

For MYA decks:
- Gap tolerance: ≤100 MY between cards
- Tight run bonus (≤50 MY gaps): +5 per card

For Frequency decks:
- Adjacent frequency bands count as sequential
- Exact 10% increments: +3 per card

### Cross-Suit Runs
**Requirement:** 3+ cards, any suit, strictly sequential values
**Scoring:** Standard run value × 0.75

---

## Special Card Types

Each deck includes 4-6 special cards:

| Type | Effect | Quantity |
|------|--------|----------|
| Wild | Substitute for any card in sets/runs | 2 |
| Event | Trigger deck-specific events | 2 |
| Modifier | Alter scoring rules temporarily | 1-2 |

### Universal Special Cards
These function identically across all decks:

**Wild Card**
- Counts as any suit
- Assumes any valid primary value
- Cannot be played alone
- Maximum 1 wild per meld

**Shuffle Event**
- Discard pile shuffles into deck
- All players draw 1 card
- Play continues

---

## Turn Structure

### Standard Turn

1. **Draw Phase** (mandatory)
   - Draw 1 from deck, OR
   - Take top card from discard

2. **Action Phase** (optional)
   - Play melds (sets or runs)
   - Extend existing melds
   - Use special card abilities

3. **Discard Phase** (mandatory unless going out)
   - Place 1 card on discard pile

### Going Out
- Play all remaining cards in valid melds
- Final card may be discarded OR melded
- Triggers end-of-round scoring

---

## Scoring Framework

### Base Scoring

| Action | Points |
|--------|--------|
| Card in meld | Primary value ÷ 10 (MYA) or Base points (Frequency) |
| Unmelded cards | Negative base value |
| Going out first | +25 |
| Going out second | +10 |

### Bonus Categories

| Achievement | Bonus |
|-------------|-------|
| Longest run (5+ cards) | +15 |
| Complete suit set | +25 |
| All cards melded | +20 |
| No special cards used | +10 |

### Penalty Categories

| Situation | Penalty |
|-----------|---------|
| Caught with 5+ cards | -5 per card |
| Caught with special card | -15 |
| Invalid meld (corrected) | -10 |

---

## Player Counts and Adjustments

### Hand Size by Player Count

| Players | Starting Hand | Draw Pile Minimum |
|---------|---------------|-------------------|
| 2 | 10 cards | 20 cards |
| 3-4 | 7 cards | 15 cards |
| 5-6 | 5 cards | 10 cards |
| 7-8 | 4 cards | 8 cards |

### Team Variants (4 or 6 players)
- Players sit alternating teams
- Teammates may not share information
- Combined team score at round end
- First team to 500 points wins

---

## Multi-Deck Play

### Deck Mixing Rules
When combining 2+ themed decks:

1. **Remove duplicate concepts** - If both decks have "Bilateral Symmetry", keep only one
2. **Normalize values** - Use conversion table for MYA ↔ Frequency
3. **Expand hand size** - +2 cards per additional deck
4. **Lengthen game** - Target score increases by 50%

### Value Conversion Table

| MYA Range | Frequency Equivalent |
|-----------|---------------------|
| >500 | <5% (ancient = rare) |
| 500-200 | 5-25% |
| 200-50 | 25-60% |
| <50 | >60% (recent = common) |

### Cross-Deck Melds
- Sets require same suit (cannot mix deck suits)
- Runs may cross decks if values are compatible
- Special cards only affect their home deck

---

## Quick Reference Card

### Turn Order
1. Draw (deck or discard)
2. Meld (optional)
3. Discard (mandatory)

### Valid Melds
- **Set:** 3+ same suit
- **Run:** 3+ same suit, sequential values
- **Convergent:** 3+ with convergent marker

### Scoring Shorthand
- Cards in melds: +value
- Caught cards: -value
- Going out: +25
- Bonuses: See deck rules

---

## Glossary

| Term | Definition |
|------|------------|
| Meld | A valid set or run placed on table |
| Going Out | Playing final card(s) to end round |
| Wild | Card that substitutes for any other |
| Run | Sequential cards of same suit |
| Set | Matching cards of same suit |
| Primary Value | Main numerical attribute (MYA, %, etc.) |
| Prerequisite | Card(s) required before this can be played |
| Enables | Card(s) this unlocks when played |
| Convergent | Trait that evolved independently multiple times |

---

## Compatibility Matrix

| Deck | MYA Values | Frequency | Clades | Regions | Prerequisites |
|------|-----------|-----------|--------|---------|---------------|
| Cambrian Prehistory | Yes | - | Yes | - | Yes |
| Human Genetics | - | Yes | - | Yes | - |
| Universal Evo | Yes | - | Yes | - | Yes |

---

---

## Shared Game Modes (8 Cross-Deck Games)

These games work with ANY Phylogenius deck.

---

### Game 1: Timeline

**Players:** 2-8  
**Time:** 15-25 min  
**Complexity:** Easy

Place cards in chronological order without seeing their values.

**Setup:**
- Each player receives 4 cards face-down (don't peek at values)
- Place 1 card face-up as timeline start

**Turn:**
1. Look at one of your face-down cards
2. Place it where you think it belongs in the timeline
3. Reveal the value:
   - Correct position: Card stays
   - Wrong position: Discard and draw a new face-down card

**Winning:** First player to correctly place all 4 cards wins.

**Variant - Draft Timeline:**
- Players see their cards
- Take turns placing one at a time
- Wrong placement gives card to opponent

---

### Game 2: Trait Rummy

**Players:** 3-7  
**Time:** 30-45 min  
**Complexity:** Medium

Classic rummy with evolutionary sets and runs.

**Setup:**
- Deal 7 cards (3-4 players) or 5 cards (5-7 players)
- Flip one card to start discard pile

**Turn:**
1. Draw from deck or discard pile
2. Meld sets or runs (optional)
3. Extend existing melds (optional)
4. Discard one card

**Valid Melds:**
| Type | Requirement |
|------|-------------|
| Category Set | 3+ cards, same suit |
| Value Run | 3+ cards, same suit, sequential values |
| Convergent Set | 3+ cards marked convergent |

**Scoring:**
- Cards in melds: +10 pts each
- Tight run (small value gaps): +5 per card
- Caught with cards: -3 to -8 depending on value
- Going out: +25

---

### Game 3: Trait Auction

**Players:** 3-6  
**Time:** 25-35 min  
**Complexity:** Medium

Bid on cards based on estimated value.

**Setup:**
- Each player receives 500 "value points" budget
- Designate one player as auctioneer

**Round:**
1. Auctioneer draws card, reads name only (hides value)
2. Players secretly write bids
3. Reveal bids simultaneously
4. Closest to actual value without exceeding wins the card
5. Winner subtracts bid from budget

**Endgame:** When budgets are exhausted or deck is empty, sum card values. Highest total wins.

**Variant - Category Reveal:**
- Before bidding, reveal the suit
- Players with cards of that suit get +50 budget for the round

---

### Game 4: Chain Builder

**Players:** 2-4  
**Time:** 40-50 min  
**Complexity:** Hard

Build evolutionary dependency chains using prerequisites.

**Setup:**
- Lay out tree template on table
- Deal 10 cards each
- Place a foundational card (oldest available) as root

**Turn:**
1. Play one card to the tree
2. Must connect to valid prerequisite (listed on card)
3. Value must be later than parent node
4. Draw one card

**Scoring:**
| Achievement | Points |
|-------------|--------|
| Correct placement | +5 |
| Invalid placement | -5, card returns to hand |
| Branch of 5+ connected cards | +20 |
| First to empty hand | +30 |

**Verification:** Use prerequisite/enables text to validate connections.

---

### Game 5: 20 Questions (Guess the Trait)

**Players:** 3-8  
**Time:** 15-20 min  
**Complexity:** Easy

Deduce the hidden trait through yes/no questions.

**Setup:**
- One player draws a secret card
- Other players ask questions to identify it

**Valid Questions:**
- "Is it in the [suit name] category?"
- "Is the value greater than X?"
- "Does it have a prerequisite?"
- "Is it marked as convergent?"

**Rounds:**
- 20 questions maximum per card
- Correct guess: Guesser scores 10 pts
- Card holder survives all questions: 5 pts

**Team Variant:** Split into teams, alternate guessing.

---

### Game 6: Trait War

**Players:** 2-4  
**Time:** 10-15 min  
**Complexity:** Easy

Simple comparison game for quick play.

**Setup:**
- Shuffle deck and deal evenly to all players
- Players hold cards in face-down stack

**Turn:**
1. All players flip top card simultaneously
2. Highest value wins all flipped cards
3. Ties: "War" - flip 3 face-down, 1 face-up, highest wins all

**Winning:** Collect all cards, or most cards when deck exhausts.

**Variant - Category War:**
- Before each flip, announce a category
- Only cards of that category count
- Non-matching cards are discarded

---

### Game 7: Memory Match

**Players:** 2-6  
**Time:** 20-30 min  
**Complexity:** Easy

Match pairs based on suit or value range.

**Setup:**
- Lay 20-40 cards face-down in grid
- More cards = longer game

**Turn:**
1. Flip two cards
2. Match criteria (choose one per game):
   - Same suit
   - Same value band (within 50 MYA or 10%)
   - Same prerequisite
3. Match: Keep pair, go again
4. No match: Flip back, next player

**Scoring:**
- Each matched pair: +5
- Matched convergent cards: +10
- Most pairs wins

---

### Game 8: Draft and Build

**Players:** 3-8  
**Time:** 45-60 min  
**Complexity:** Hard

Pick-and-pass drafting followed by deck construction.

**Phase 1 - Draft:**
1. Deal 8 cards to each player
2. Choose 1 card, pass remaining left
3. Repeat until all cards chosen
4. You now have your "genome" of 8 cards

**Phase 2 - Build:**
1. From your 8 cards, construct the best possible melds
2. May discard up to 2 cards (no replacement)
3. Reveal all genomes simultaneously

**Scoring:**
| Meld Type | Points |
|-----------|--------|
| 3-card set | 15 |
| 4-card set | 25 |
| 3-card run | 20 |
| 4-card run | 30 |
| Unmelded cards | -5 each |
| All cards melded | +20 bonus |

**Strategy:** Balance taking good cards vs denying opponents.

---

## Game Mode Quick Reference

| Game | Players | Time | Key Mechanic | Complexity |
|------|---------|------|--------------|------------|
| Timeline | 2-8 | 15 min | Ordering | Easy |
| Trait Rummy | 3-7 | 35 min | Sets/Runs | Medium |
| Trait Auction | 3-6 | 30 min | Bidding | Medium |
| Chain Builder | 2-4 | 45 min | Prerequisites | Hard |
| 20 Questions | 3-8 | 15 min | Deduction | Easy |
| Trait War | 2-4 | 10 min | Comparison | Easy |
| Memory Match | 2-6 | 25 min | Matching | Easy |
| Draft and Build | 3-8 | 50 min | Drafting | Hard |

---

*Core Rules v1.0 - Compatible with all Phylogenius themed decks*

