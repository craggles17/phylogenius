# Human Genetic Traits: The 23andMe Card Game

## Overview
A standalone card game focused on human genetic variants with real population genetics data. Designed for science-curious players who want depth beyond the evolutionary game.

---

## Card Anatomy

```
┌───────────────────────────────┐
│ [CATEGORY ICON] TRAIT NAME    │
│ Gene: CYP1A2 | rs762551       │
│                               │
│ ┌───────────────────────────┐ │
│ │                           │ │
│ │     [ILLUSTRATION]        │ │
│ │                           │ │
│ └───────────────────────────┘ │
│                               │
│ PHENOTYPE: Fast Caffeine      │
│            Metaboliser        │
│                               │
│ ┌─────────┬─────────────────┐ │
│ │ EFFECT  │ +2 Energy       │ │
│ │         │ -1 Sleep        │ │
│ ├─────────┼─────────────────┤ │
│ │ GLOBAL  │ 45%             │ │
│ │ FREQ    │ ████████░░      │ │
│ ├─────────┼─────────────────┤ │
│ │ PEAK    │ 🇪🇹 Ethiopia 78% │ │
│ │ REGION  │ 🇯🇵 Japan 68%    │ │
│ ├─────────┼─────────────────┤ │
│ │ LOW     │ 🇮🇹 Italy 32%    │ │
│ │ REGION  │ 🇬🇷 Greece 35%   │ │
│ ├─────────┼─────────────────┤ │
│ │ h²      │ 0.75            │ │
│ │         │ ●●●●○           │ │
│ └─────────┴─────────────────┘ │
│                               │
│ INHERITANCE: Autosomal        │
│ ZYGOSITY MATTERS: No          │
│                               │
│ "The espresso gene"           │
│                               │
│ [CATEGORY COLOUR BAR]         │
└───────────────────────────────┘
```

### Card Elements

| Element | Description | Game Use |
|---------|-------------|----------|
| Category Icon | Biological system | Suit for sets |
| Trait Name | Common name | Identification |
| Gene/rsID | Scientific reference | Educational |
| Phenotype | Observable effect | Thematic |
| Effect Values | +/- point modifiers | Scoring |
| Global Frequency | World average % | Rarity scoring |
| Peak Regions | Highest prevalence | Geography games |
| Low Regions | Lowest prevalence | Geography games |
| Heritability (h²) | Genetic vs environment | Variance mechanic |
| Inheritance | Auto/X-linked/Mito | Special rules |
| Zygosity Matters | Dose effect | Homozygous bonuses |

---

## Categories (Suits)

| Category | Icon | Colour | Cards |
|----------|------|--------|-------|
| Sensory | 👁 | Blue #1E90FF | 16 |
| Digestive | 🍽 | Green #32CD32 | 14 |
| Metabolic | ⚡ | Orange #FF8C00 | 14 |
| Cosmetic | ✨ | Pink #FF69B4 | 16 |
| Behavioural | 🧠 | Purple #8B008B | 12 |
| Immunity | 🛡 | Red #DC143C | 10 |
| Structural | 🦴 | Grey #708090 | 8 |
| Special | 🎲 | Gold #FFD700 | 6 |

**Total: 96 cards**

---

## Complete Card List

### 👁 Sensory (16 cards)

| Trait | Gene | rsID | Global % | Peak Region | Effect |
|-------|------|------|----------|-------------|--------|
| Red-Green Colourblind | OPN1LW | - | 8% ♂ / 0.5% ♀ | European 8% | -2 Colour, X-linked |
| Blue-Yellow Colourblind | OPN1SW | - | 0.01% | Uniform | -3 Colour, Rare |
| Tetrachromat | OPN1MW | - | 12% ♀ only | European | +3 Colour, X-linked |
| Supertaster (PTC) | TAS2R38 | rs713598 | 25% | West Africa 45% | +2 Bitter sense |
| Non-taster (PTC) | TAS2R38 | rs713598 | 30% | East Asia 40% | -1 Bitter sense |
| Cilantro Soap | OR6A2 | rs72921001 | 14% | European 21% | -1 Taste |
| Asparagus Smell | OR2M7 | rs4481887 | 40% | European 50% | +1 Smell |
| Photic Sneeze | ACHOO | rs10427255 | 25% | European 35% | +1 Quirk |
| Pain Insensitivity | SCN9A | rs6746030 | 0.001% | Scattered | +3 Pain resist, Rare |
| Enhanced Pain | SCN9A | rs6746030 | 3% | European | -2 Pain resist |
| Perfect Pitch | ? | Polygenic | 0.01% | East Asia 0.1% | +3 Music, Rare |
| Tone Deaf | ? | Polygenic | 4% | Uniform | -2 Music |
| Motion Sickness | ? | Polygenic | 30% | East Asia 40% | -1 Travel |
| Misophonia | ? | rs2937573 | 15% | Unknown | -1 Sound tolerance |
| Hyperacusis | ? | Polygenic | 8% | Unknown | +1 Hearing, -1 Noise |
| Anosmia (COVID type) | ACE2/TMPRSS2 | Various | Variable | - | -2 Smell, Conditional |

### 🍽 Digestive (14 cards)

| Trait | Gene | rsID | Global % | Peak Region | Effect |
|-------|------|------|----------|-------------|--------|
| Lactase Persistent | LCT | rs4988235 | 35% | N. Europe 95% | +2 Dairy |
| Lactose Intolerant | LCT | rs4988235 | 65% | E. Asia 95% | -2 Dairy, +1 Gut |
| Alcohol Flush | ALDH2 | rs671 | 8% | E. Asia 45% | -2 Alcohol, +1 Cancer resist |
| Fast Alcohol Clear | ADH1B | rs1229984 | 15% | E. Asia 70% | +1 Alcohol |
| Coeliac Risk | HLA-DQ | Various | 1% | N. Europe 2% | -2 Gluten |
| Bitter Coffee Love | CYP1A2 | rs762551 | 45% | Ethiopia 78% | +2 Bitter foods |
| Asparagus Pee | Multiple | rs4481887 | 50% | European 60% | +1 Quirk |
| FUT2 Secretor | FUT2 | rs601338 | 80% | Uniform | +1 Gut microbiome |
| FUT2 Non-secretor | FUT2 | rs601338 | 20% | Uniform | -1 Gut, +1 Norovirus resist |
| High Flatulence | FUT2/Diet | Polygenic | 30% | Variable | +1 Quirk, -1 Social |
| Spicy Tolerance | TRPV1 | rs8065080 | 25% | Mexico 40% | +2 Spice |
| MSG Sensitivity | ? | Unknown | 15% | European 20% | -1 Umami |
| Fructose Malabsorption | SLC2A5 | Various | 35% | European 40% | -1 Fruit |
| High Amylase | AMY1 | CNV | 50% | Agricultural | +1 Starch |

### ⚡ Metabolic (14 cards)

| Trait | Gene | rsID | Global % | Peak Region | Effect |
|-------|------|------|----------|-------------|--------|
| Fast Caffeine | CYP1A2 | rs762551 | 45% | Ethiopia 78% | +2 Energy |
| Slow Caffeine | CYP1A2 | rs762551 | 55% | S. Europe 65% | -1 Sleep, +1 Duration |
| Thrifty Metabolism | FTO | rs9939609 | 45% | Pacific Island 75% | +2 Fat storage |
| Lean Metabolism | FTO | rs9939609 | 25% | E. Africa 35% | -1 Fat storage |
| High VO2max Potential | ACTN3 | rs1815739 | 18% | W. Africa 25% | +3 Endurance |
| Sprint Gene | ACTN3 | rs1815739 | 30% | Jamaica 75% | +3 Power |
| Vitamin D Efficient | GC/CYP2R1 | Various | 40% | N. Europe 60% | +1 Bone |
| Folate Metabolism | MTHFR | rs1801133 | 35% | Hispanic 50% | -1 Folate |
| Iron Overload Risk | HFE | rs1800562 | 1% | N. Europe 5% | +1 Iron, -2 if homozygous |
| B12 Absorption | FUT2 | rs602662 | 20% | Uniform | -1 B12 |
| High Cholesterol | PCSK9 | Various | 2% | Uniform | -2 Heart |
| Low Cholesterol | PCSK9 | rs11591147 | 3% | African 10% | +2 Heart |
| Nicotine Metabolism | CYP2A6 | Various | 30% | Variable | +1 Smoking quit |
| THC Sensitivity | CNR1 | rs1049353 | 25% | European 30% | +2 Cannabis effect |

### ✨ Cosmetic (16 cards)

| Trait | Gene | rsID | Global % | Peak Region | Effect |
|-------|------|------|----------|-------------|--------|
| Wet Earwax | ABCC11 | rs17822931 | 70% | African 100% | +1 Body odour |
| Dry Earwax | ABCC11 | rs17822931 | 30% | E. Asia 95% | -1 Body odour |
| Freckles | MC1R | rs1805007 | 15% | N. Europe 40% | +1 Sun sensitivity |
| Red Hair | MC1R | rs1805007 | 2% | Scotland 13% | +2 Sun sens, Rare |
| Widow's Peak | ? | Polygenic | 35% | Uniform | +1 Quirk |
| Attached Earlobes | EDAR | rs3827760 | 50% | Variable | +1 Quirk |
| Cleft Chin | ? | Polygenic | 25% | European 30% | +1 Quirk |
| Dimples | ? | Polygenic | 20% | Uniform | +1 Quirk |
| Blue Eyes | OCA2/HERC2 | rs12913832 | 8% | N. Europe 80% | +1 Light sens |
| Green Eyes | Multiple | Polygenic | 2% | N. Europe 15% | +2 Rare |
| Heterochromia | Multiple | Various | 0.6% | Uniform | +3 Rare |
| Unibrow | PAX3 | rs7544528 | 25% | Middle East 40% | +1 Quirk |
| Thick Hair | EDAR | rs3827760 | 30% | E. Asia 90% | +1 Hair |
| Male Pattern Bald | AR | rs6152 | 50% ♂ | European 60% | -1 Hair |
| Early Grey Hair | IRF4 | rs12203592 | 20% | European 30% | +1 Quirk |
| Double Eyelash | FOXC2 | Rare | 0.01% | Scattered | +2 Rare |

### 🧠 Behavioural (12 cards)

| Trait | Gene | rsID | Global % | Peak Region | Effect |
|-------|------|------|----------|-------------|--------|
| Morning Person | PER2 | rs2304672 | 25% | N. Europe 35% | +2 Morning |
| Night Owl | CLOCK | rs1801260 | 30% | S. Europe 40% | +2 Night |
| Short Sleeper | DEC2 | rs121912617 | 1% | Scattered | +3 Time, Rare |
| High Sleep Need | ADA | rs73598374 | 10% | Uniform | -1 Time |
| Novelty Seeking | DRD4 | 7R allele | 20% | Americas 60% | +2 Adventure |
| Risk Averse | DRD4 | 4R allele | 65% | E. Asia 80% | +1 Caution |
| Warrior Gene | MAOA | Low activity | 35% ♂ | Variable | +1 Aggression, X-linked |
| High Empathy | OXTR | rs53576 | 60% | Uniform | +2 Social |
| Optimism Bias | OXTR/5-HTT | Polygenic | 40% | Uniform | +1 Mood |
| Anxiety Prone | SLC6A4 | rs25531 | 45% | European 50% | -1 Mood |
| ADHD Risk | DRD4/DAT1 | Various | 5% | European 8% | -1 Focus, +1 Creativity |
| High Pain Empathy | ? | Polygenic | 30% | Unknown | +1 Empathy |

### 🛡 Immunity (10 cards)

| Trait | Gene | rsID | Global % | Peak Region | Effect |
|-------|------|------|----------|-------------|--------|
| Malaria Resist (Sickle) | HBB | rs334 | 8% | W. Africa 25% | +3 Malaria, Carrier only |
| Malaria Resist (Duffy) | DARC | rs2814778 | 3% | W. Africa 95% | +2 Malaria |
| HIV Resistance | CCR5 | rs333 (Δ32) | 1% | N. Europe 10% | +3 HIV, Rare |
| Norovirus Resist | FUT2 | rs601338 | 20% | Uniform | +2 Stomach bugs |
| Autoimmune Risk | HLA-B27 | - | 8% | N. Europe 12% | -2 Joints |
| Coeliac HLA | HLA-DQ2/8 | - | 30% | N. Europe 40% | -1 Gluten risk |
| Strong Sneeze | ? | Polygenic | 20% | Uniform | +1 Pathogen clear |
| Allergic Tendency | IL-4/13 | Various | 30% | Developed nations | -1 Immune |
| High Fever Response | IL-6 | Various | 25% | African 35% | +1 Infection fight |
| Low Inflammation | CRP | rs1205 | 20% | Uniform | +1 Longevity |

### 🦴 Structural (8 cards)

| Trait | Gene | rsID | Global % | Peak Region | Effect |
|-------|------|------|----------|-------------|--------|
| Tall Stature | HMGA2/GDF5 | Polygenic | 15% | N. Europe 30% | +2 Height |
| Short Stature | HMGA2/GDF5 | Polygenic | 15% | S.E. Asia 25% | -1 Height |
| Double-Jointed | COL5A1 | rs12722 | 15% | Uniform | +2 Flexibility |
| Dense Bones | LRP5 | rs3736228 | 5% | Uniform | +2 Bone |
| Osteoporosis Risk | LRP5 | rs3736228 | 15% | European 20% | -2 Bone |
| High Muscle Insert | MSTN | Polygenic | 10% | W. Africa 20% | +1 Power |
| Long Achilles | ? | Polygenic | 20% | E. Africa 60% | +2 Running |
| Morton's Toe | ? | Polygenic | 20% | Greek 30% | +1 Quirk |

### 🎲 Special Cards (6 cards)

| Card | Effect |
|------|--------|
| Genetic Counsellor | View top 3 cards of deck, keep 1 |
| 23andMe Kit | Draw 2 extra cards |
| CRISPR Edit | Swap one card with any player |
| Founder Effect | All players reveal cards of one category |
| Genetic Drift | Shuffle all hands, redistribute evenly |
| De Novo Mutation | Wild card for any category |

---

## Game Modes

### 1. Genetic Blackjack (2-4 players)
**Goal:** Hit target phenotype score without busting

**Setup:**
- Choose a phenotype target (Energy, Social, Health, etc.)
- Target score: 21
- Deal 2 cards face down

**Gameplay:**
- Sum effect values for chosen phenotype
- Hit (draw) or stand
- Closest to 21 without going over wins
- Exact 21 with 2 cards = "Genetic Jackpot"

**Variant - Multi-trait:** Balance 3 phenotypes simultaneously

---

### 2. Phenotype Poker (3-6 players)
**Goal:** Build best 5-card genome hand

**Hand Rankings (low to high):**
1. High card
2. Pair (same trait, different variants)
3. Two pair
4. Category flush (5 same category)
5. Full house (3 + 2 same category)
6. Straight (5 cards, h² values sequential: 0.1-0.5)
7. Regional flush (5 cards, same peak region)
8. Four of a kind (4 same category)
9. Ancestral straight flush (5 cards, same region + category)

**Betting:** Use heritability values as chip multipliers

---

### 3. Population Rummy (3-7 players)
**Goal:** Form regional or category sets

**Melds:**
- **Category set:** 3+ cards same category
- **Regional set:** 3+ cards same peak region
- **Frequency run:** 3+ cards with adjacent global frequencies (within 10%)

**Bonus scoring:**
- All cards from one continent: +20
- Complete category (all cards): +50
- Rare cards (≤1% frequency): 3x point value

---

### 4. Ancestry Journey (2-6 players)
**Goal:** Build a coherent "ancestry" across regions

**Setup:**
- Deal 7 cards each
- Place world map board in centre

**Gameplay:**
- Play cards to regions on map
- Must have genetic connection (shared peak regions)
- First to play all cards wins

**Scoring:**
- Connected path across map: +30
- Most diverse regions: +20
- Most cards in single region: +15

---

### 5. Genetic Counsellor (3-5 players)
**Goal:** Predict opponent's hidden traits

**Setup:**
- Each player draws 5 cards secretly
- These represent their "genome"

**Gameplay:**
- Ask yes/no questions about categories, frequencies, regions
- Deduce opponents' cards
- First to correctly guess all 5 cards of an opponent wins

**Educational value:** Teaches genetic inheritance patterns

---

### 6. Natural Selection Survival (4-7 players)
**Goal:** Survive environmental challenges

**Setup:**
- Deal 5 cards each
- Shuffle environment deck

**Environment cards:**
- Famine (+Thrifty, -Lean metabolism)
- Plague (+HIV resist, +Malaria resist, -Autoimmune)
- Migration (+Lactase, +Vitamin D)
- UV Exposure (+Melanin, -Fair skin)
- Cold Climate (+Insulation, +Vitamin D efficient)

**Gameplay:**
- Flip environment each round
- Traits score +/- based on environment
- Below 0 = elimination
- Last player standing wins

---

## Scoring Reference

### Base Values by Frequency

| Global Frequency | Base Points |
|------------------|-------------|
| ≤1% (Rare) | 15 |
| 1-10% | 10 |
| 10-30% | 7 |
| 30-60% | 5 |
| >60% (Common) | 3 |

### Heritability Modifier

| h² Range | Modifier | Meaning |
|----------|----------|---------|
| 0.8-1.0 | x1.5 | Highly genetic |
| 0.5-0.8 | x1.2 | Mostly genetic |
| 0.3-0.5 | x1.0 | Mixed |
| <0.3 | x0.8 | Mostly environmental |

### Regional Bonuses

| Region | Bonus Condition |
|--------|-----------------|
| Sub-Saharan Africa | 3+ cards peak here: +10 |
| Northern Europe | 3+ cards peak here: +10 |
| East Asia | 3+ cards peak here: +10 |
| Americas | 3+ cards peak here: +15 (underrepresented) |
| Oceania | 3+ cards peak here: +20 (rare) |

### X-Linked Special Rules
- Male players: Full effect
- Female players: Halved effect (unless homozygous)
- Creates strategic gender role selection

---

## Population Frequency Reference

### By Region (for Regional Sets)

**Northern Europe**
- Lactase persistent (95%)
- Blue eyes (80%)
- Red hair (13% Scotland)
- CCR5-Δ32 HIV resist (10%)
- Photic sneeze (35%)

**East Asia**
- Dry earwax (95%)
- Alcohol flush (45%)
- Thick hair (90%)
- Lactose intolerant (95%)
- Risk averse DRD4 (80%)

**West Africa**
- Wet earwax (100%)
- Sickle cell carrier (25%)
- Duffy null (95%)
- Sprint ACTN3 (75%)
- High fever response (35%)

**Americas (Indigenous)**
- Novelty seeking DRD4 (60%)
- Dry earwax (95%)
- Thrifty metabolism (45%)

**South Asia**
- Lactose intolerant (70%)
- Spicy tolerance (35%)
- Type 2 diabetes risk (higher)

---

## Component List

| Component | Quantity |
|-----------|----------|
| Trait cards | 96 |
| Environment cards | 12 |
| Region reference cards | 6 |
| Scoring pad | 1 |
| Player reference cards | 7 |
| World map board | 1 |
| Rulebook | 1 |

---

## Educational Notes

Each card includes accurate:
- Gene names and rs numbers (where known)
- Population frequencies from gnomAD/1000 Genomes
- Heritability estimates from twin studies
- Regional distributions from published GWAS

**Disclaimer:** Genetics is complex. Single variants rarely determine traits absolutely. This game simplifies for playability while maintaining scientific accuracy where possible.
