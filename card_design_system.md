# Phylogenius Card Design System

## Overview
Comprehensive design specifications for all Phylogenius card decks. This document covers print specifications, visual design guidelines, typography, colour systems, and production-ready templates.

---

## Print Specifications

### Card Dimensions

| Element | Measurement |
|---------|-------------|
| Card Size | 63mm × 88mm (2.48" × 3.46") |
| Corner Radius | 3mm (0.12") |
| Bleed | 3mm (0.12") all edges |
| Safe Zone | 5mm (0.20") from trim edge |
| Full Bleed Size | 69mm × 94mm (2.72" × 3.70") |

### Print Area Diagram

```
┌─────────────────────────────────────┐ ← Bleed edge (69×94mm)
│  ┌─────────────────────────────┐    │
│  │ ┌─────────────────────────┐ │    │ ← Safe zone (53×78mm)
│  │ │                         │ │    │
│  │ │    SAFE CONTENT AREA    │ │    │
│  │ │       53mm × 78mm       │ │    │
│  │ │                         │ │    │
│  │ └─────────────────────────┘ │    │
│  │                             │    │ ← Trim edge (63×88mm)
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### Card Stock

| Property | Specification |
|----------|---------------|
| Weight | 300-350 gsm |
| Core | Blue or black core (prevent light bleed) |
| Finish | Matte, Linen, or Satin |
| Coating | UV spot gloss on icons (optional) |

### Colour Mode

| Property | Value |
|----------|-------|
| Colour Space | CMYK |
| Resolution | 300 DPI minimum, 450 DPI recommended |
| Rich Black | C:40 M:40 Y:40 K:100 |
| File Format | PDF/X-1a:2001 or TIFF |

---

## Card Layout Template

### Universal Layout Grid

```
┌─────────────────────────────────────────────────┐
│ 3mm BLEED                                       │
│ ┌─────────────────────────────────────────────┐ │
│ │ 5mm SAFE ZONE                               │ │
│ │ ┌─────────────────────────────────────────┐ │ │
│ │ │                                         │ │ │
│ │ │  HEADER ZONE (10mm height)              │ │ │
│ │ │  [Icon] Trait Name            [Number]  │ │ │
│ │ │  Subtext line                           │ │ │
│ │ │                                         │ │ │
│ │ ├─────────────────────────────────────────┤ │ │
│ │ │                                         │ │ │
│ │ │                                         │ │ │
│ │ │        ILLUSTRATION ZONE                │ │ │
│ │ │            (35mm height)                │ │ │
│ │ │                                         │ │ │
│ │ │                                         │ │ │
│ │ ├─────────────────────────────────────────┤ │ │
│ │ │                                         │ │ │
│ │ │  DATA ZONE (20mm height)                │ │ │
│ │ │  Primary Value      Secondary Value     │ │ │
│ │ │  Category           Modifier            │ │ │
│ │ │  Prereq     │      Enables              │ │ │
│ │ │                                         │ │ │
│ │ ├─────────────────────────────────────────┤ │ │
│ │ │                                         │ │ │
│ │ │  FLAVOUR ZONE (8mm height)              │ │ │
│ │ │  "Flavour text in italics"              │ │ │
│ │ │                                         │ │ │
│ │ ├─────────────────────────────────────────┤ │ │
│ │ │  COLOUR BAR (5mm height)                │ │ │
│ │ └─────────────────────────────────────────┘ │ │
│ │                                             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Zone Specifications

| Zone | Height | Purpose |
|------|--------|---------|
| Header | 10mm | Card identity, suit icon, card number |
| Illustration | 35mm | Visual representation of trait |
| Data | 20mm | Game-relevant values and connections |
| Flavour | 8mm | Educational/thematic text |
| Colour Bar | 5mm | Visual suit identification |

---

## Typography

### Font Stack

| Element | Font | Weight | Size | Fallback |
|---------|------|--------|------|----------|
| Trait Name | Barlow Condensed | Bold | 14pt | Arial Narrow Bold |
| Subtext | Barlow | Regular | 9pt | Arial |
| Values | JetBrains Mono | Medium | 10pt | Consolas |
| Category | Barlow | SemiBold | 8pt | Arial Bold |
| Flavour | Merriweather | Italic | 8pt | Georgia Italic |
| Card Number | Barlow Condensed | Bold | 11pt | Arial Narrow Bold |

### Text Colour

| Context | Colour | Hex |
|---------|--------|-----|
| Primary text | Charcoal | #2D2D2D |
| Secondary text | Dark Grey | #5A5A5A |
| Value numbers | Near Black | #1A1A1A |
| Flavour text | Medium Grey | #6B6B6B |
| Light backgrounds | White | #FFFFFF |

### Text Alignment

| Zone | Alignment |
|------|-----------|
| Header - Trait Name | Left |
| Header - Card Number | Right |
| Values | Left/Right paired |
| Flavour | Centre |
| Colour Bar | Full width |

---

## Colour Palette

### Cambrian Prehistory Deck

| Suit | Primary | Hex | CMYK | Secondary | Hex |
|------|---------|-----|------|-----------|-----|
| Body Plan 🌀 | Deep Blue | #1A237E | C:95 M:85 Y:0 K:15 | Light Blue | #7986CB |
| Armour 🛡 | Stone Grey | #607D8B | C:50 M:30 Y:20 K:30 | Light Grey | #B0BEC5 |
| Locomotion 🌊 | Teal | #00897B | C:85 M:0 Y:45 K:25 | Light Teal | #4DB6AC |
| Feeding 🦷 | Crimson | #C62828 | C:0 M:90 Y:80 K:15 | Light Red | #EF5350 |
| Respiration 💨 | Sky Blue | #03A9F4 | C:75 M:15 Y:0 K:0 | Pale Blue | #81D4FA |
| Reproduction 🥚 | Coral | #FF7043 | C:0 M:65 Y:70 K:0 | Peach | #FFAB91 |
| Special ⚡ | Gold | #FFD700 | C:0 M:15 Y:95 K:0 | Light Gold | #FFF176 |

### Human Genetics Deck

| Category | Primary | Hex | CMYK | Secondary | Hex |
|----------|---------|-----|------|-----------|-----|
| Sensory 👁 | Ocean Blue | #1E90FF | C:75 M:35 Y:0 K:0 | Sky | #87CEEB |
| Digestive 🍽 | Leaf Green | #32CD32 | C:70 M:0 Y:90 K:0 | Mint | #90EE90 |
| Metabolic ⚡ | Amber | #FF8C00 | C:0 M:50 Y:100 K:0 | Peach | #FFB347 |
| Cosmetic ✨ | Hot Pink | #FF69B4 | C:0 M:70 Y:0 K:0 | Blush | #FFB6C1 |
| Behavioural 🧠 | Deep Purple | #8B008B | C:50 M:100 Y:0 K:20 | Lavender | #DDA0DD |
| Immunity 🛡 | Crimson | #DC143C | C:0 M:95 Y:75 K:5 | Rose | #FF6B6B |
| Structural 🦴 | Slate | #708090 | C:40 M:25 Y:15 K:35 | Silver | #C0C0C0 |
| Special 🎲 | Gold | #FFD700 | C:0 M:15 Y:95 K:0 | Cream | #FFFDD0 |

### Universal Evo Deck (Existing)

| System | Primary | Hex | CMYK |
|--------|---------|-----|------|
| Structural 🦴 | Bone White | #F5F5DC | C:3 M:3 Y:15 K:0 |
| Sensory 👁 | Ocean Blue | #1E90FF | C:75 M:35 Y:0 K:0 |
| Reproductive 🥚 | Soft Pink | #FFB6C1 | C:0 M:35 Y:15 K:0 |
| Metabolic 🔥 | Amber Orange | #FF8C00 | C:0 M:50 Y:100 K:0 |
| Neural 🧠 | Deep Purple | #8B008B | C:50 M:100 Y:0 K:20 |
| Special ⚡ | Gold | #FFD700 | C:0 M:15 Y:95 K:0 |

---

## Suit Icons

### Icon Specifications

| Property | Value |
|----------|-------|
| Size | 7mm × 7mm |
| Style | Filled, single colour |
| Stroke | None (solid fill) |
| Position | Top-left corner, 5mm from edges |

### Icon Set - Cambrian Deck

| Suit | Icon | Unicode | Description |
|------|------|---------|-------------|
| Body Plan | 🌀 | U+1F300 | Spiral (body symmetry) |
| Armour | 🛡 | U+1F6E1 | Shield (protection) |
| Locomotion | 🌊 | U+1F30A | Wave (movement) |
| Feeding | 🦷 | U+1F9B7 | Tooth (feeding apparatus) |
| Respiration | 💨 | U+1F4A8 | Wind (breathing) |
| Reproduction | 🥚 | U+1F95A | Egg (reproduction) |
| Special | ⚡ | U+26A1 | Lightning (event) |

### Icon Set - Human Genetics Deck

| Category | Icon | Unicode | Description |
|----------|------|---------|-------------|
| Sensory | 👁 | U+1F441 | Eye (senses) |
| Digestive | 🍽 | U+1F37D | Fork/Knife (digestion) |
| Metabolic | ⚡ | U+26A1 | Lightning (energy) |
| Cosmetic | ✨ | U+2728 | Sparkles (appearance) |
| Behavioural | 🧠 | U+1F9E0 | Brain (behaviour) |
| Immunity | 🛡 | U+1F6E1 | Shield (protection) |
| Structural | 🦴 | U+1F9B4 | Bone (structure) |
| Special | 🎲 | U+1F3B2 | Dice (random/wild) |

---

## Card Back Designs

### Cambrian Prehistory Deck Back

```
┌─────────────────────────────────┐
│                                 │
│    ╔═══════════════════════╗    │
│    ║   ████████████████    ║    │
│    ║   ██ TRILOBITE  ██    ║    │
│    ║   ██ SILHOUETTE ██    ║    │
│    ║   ████████████████    ║    │
│    ╠═══════════════════════╣    │
│    ║                       ║    │
│    ║      PHYLOGENIUS      ║    │
│    ║    CAMBRIAN EDITION   ║    │
│    ║                       ║    │
│    ╚═══════════════════════╝    │
│                                 │
│   [Fossil texture background]   │
│                                 │
└─────────────────────────────────┘
```

**Design Elements:**
- Background: Subtle fossil texture in Stone Grey (#607D8B)
- Central element: Trilobite silhouette in Deep Blue (#1A237E)
- Border: Double-line frame in Gold (#FFD700)
- Typography: "PHYLOGENIUS" in Barlow Condensed Bold
- Subtitle: "CAMBRIAN EDITION" in smaller caps

**Colour Scheme:**
- Primary: Stone Grey #607D8B
- Accent: Deep Blue #1A237E
- Highlight: Gold #FFD700
- Text: Bone White #F5F5DC

### Human Genetics Deck Back

```
┌─────────────────────────────────┐
│                                 │
│    ╔═══════════════════════╗    │
│    ║                       ║    │
│    ║      ╭───╮            ║    │
│    ║      │DNA│            ║    │
│    ║      │HEL│            ║    │
│    ║      │IX │            ║    │
│    ║      ╰───╯            ║    │
│    ╠═══════════════════════╣    │
│    ║                       ║    │
│    ║      PHYLOGENIUS      ║    │
│    ║    GENETICS EDITION   ║    │
│    ║                       ║    │
│    ╚═══════════════════════╝    │
│                                 │
│  [Chromosome pattern overlay]   │
│                                 │
└─────────────────────────────────┘
```

**Design Elements:**
- Background: DNA helix pattern in Deep Purple (#8B008B)
- Central element: Stylized double helix in Hot Pink (#FF69B4)
- Border: Double-line frame in Gold (#FFD700)
- Overlay: Subtle chromosome banding pattern
- Typography: "PHYLOGENIUS" in Barlow Condensed Bold

**Colour Scheme:**
- Primary: Deep Purple #8B008B
- Accent: Hot Pink #FF69B4
- Highlight: Gold #FFD700
- Text: White #FFFFFF

---

## Visual Mockups

### Cambrian Card Example

```
┌─────────────────────────────────┐
│ 🌀 BILATERAL SYMMETRY       B06 │
│ Body Plan • Ediacaran           │
├─────────────────────────────────┤
│                                 │
│   ┌─────────────────────────┐   │
│   │                         │   │
│   │    [Illustration of     │   │
│   │     bilateral worm      │   │
│   │     fossil - Kimberella]│   │
│   │                         │   │
│   └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│ MYA: 555           Era: PRO     │
│ Clade: 🦠 Basal                 │
├─────────────────────────────────┤
│ Prereq: Multicellularity        │
│ Enables: Head/tail axis         │
├─────────────────────────────────┤
│  "Left and right: the original  │
│         design upgrade"         │
├─────────────────────────────────┤
│ ██████████████████████████████  │
│         [Deep Blue Bar]         │
└─────────────────────────────────┘
```

### Human Genetics Card Example

```
┌─────────────────────────────────┐
│ 👁 TETRACHROMAT             S03 │
│ Gene: OPN1MW • X-linked         │
├─────────────────────────────────┤
│                                 │
│   ┌─────────────────────────┐   │
│   │                         │   │
│   │    [Illustration of     │   │
│   │     colour spectrum     │   │
│   │     with extra band]    │   │
│   │                         │   │
│   └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│ PHENOTYPE: Enhanced Colour      │
│            Vision (4 cones)     │
├─────────────────────────────────┤
│ FREQ: 12% ♀  ████░░░░░░         │
│ PEAK: 🇪🇺 European               │
│ h²: 1.0  ●●●●●                  │
├─────────────────────────────────┤
│ EFFECT: +3 Colour               │
│ INHERIT: X-linked (♀ only)      │
├─────────────────────────────────┤
│   "Seeing colours others        │
│        can only imagine"        │
├─────────────────────────────────┤
│ ██████████████████████████████  │
│        [Ocean Blue Bar]         │
└─────────────────────────────────┘
```

### Special Card Example

```
┌─────────────────────────────────┐
│ ⚡ CAMBRIAN EXPLOSION       X01 │
│ Event Card                      │
├─────────────────────────────────┤
│                                 │
│   ┌─────────────────────────┐   │
│   │                         │   │
│   │    [Illustration of     │   │
│   │     diverse Cambrian    │   │
│   │     fauna explosion]    │   │
│   │                         │   │
│   └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│          WILD CARD              │
│   Counts as any suit for runs   │
├─────────────────────────────────┤
│ BONUS: +10 if played in         │
│        Cambrian-era run         │
├─────────────────────────────────┤
│   "In 20 million years, every   │
│     body plan that exists       │
│          appeared."             │
├─────────────────────────────────┤
│ ██████████████████████████████  │
│          [Gold Bar]             │
└─────────────────────────────────┘
```

---

## Data Visualization Elements

### Frequency Bar

Horizontal bar showing global frequency percentage:

```
10% frequency:  ██░░░░░░░░
45% frequency:  █████░░░░░
80% frequency:  ████████░░
```

**Specifications:**
- Width: 40mm
- Height: 3mm
- Filled: Primary suit colour
- Empty: Light grey (#E0E0E0)
- 10 segments for 10% increments

### Heritability Dots

Visual representation of h² value:

```
h² 0.20:  ●○○○○
h² 0.50:  ●●●○○
h² 0.80:  ●●●●○
h² 1.00:  ●●●●●
```

**Specifications:**
- 5 dots per indicator
- Filled dot: Primary suit colour
- Empty dot: Light grey (#E0E0E0)
- Dot size: 2.5mm diameter
- Spacing: 1mm gap

### Era Badge

Small badge indicating geological era:

```
┌─────┐
│ CAM │  Cambrian
└─────┘
```

**Specifications:**
- Size: 12mm × 6mm
- Background: Era-specific colour
- Text: White, 8pt Barlow Bold
- Corner radius: 2mm

### Era Colours

| Era | Background | Hex |
|-----|------------|-----|
| ARC/PRO | Dark Slate | #3D5A6C |
| CAM | Bright Green | #7CB342 |
| ORD | Green-Grey | #8BC34A |
| SIL | Mauve | #9575CD |
| DEV | Brown | #795548 |
| CAR | Blue-Grey | #546E7A |
| PER | Red | #EF5350 |
| PAL/NEO | Yellow | #FDD835 |
| QUA | Beige | #D7CCC8 |

---

## Production Files Checklist

### Required Deliverables

| File | Format | Purpose |
|------|--------|---------|
| Card fronts | PDF/X-1a | Print-ready artwork |
| Card backs | PDF/X-1a | Print-ready artwork |
| Icon set | SVG | Scalable icons |
| Colour swatches | ASE | Adobe swatch exchange |
| Font files | OTF/TTF | Typography |
| Bleed templates | AI/PSD | Design templates |

### Preflight Checklist

- [ ] All text converted to outlines
- [ ] All images at 300+ DPI
- [ ] Colour mode: CMYK
- [ ] Bleed: 3mm all sides
- [ ] No RGB colours remaining
- [ ] Rich black for large black areas
- [ ] Trim marks included
- [ ] Font embedding complete

---

## Accessibility Considerations

### Colour Blindness

All suit colours tested for distinguishability under:
- Protanopia (red-blind)
- Deuteranopia (green-blind)
- Tritanopia (blue-blind)

**Solutions:**
- Icons provide redundant identification
- Colour bars have different saturation levels
- Pattern overlay option for high-contrast needs

### Text Legibility

| Element | Minimum Contrast |
|---------|------------------|
| Trait name | 7:1 (AAA) |
| Values | 4.5:1 (AA) |
| Flavour text | 4.5:1 (AA) |

### Touch Targets

For digital versions:
- Minimum tap target: 44×44 px
- Card spacing: 8px minimum

---

## Component Specifications

### Complete Game Box Contents

**Cambrian Prehistory Deck:**
| Component | Quantity |
|-----------|----------|
| Trait cards | 80 |
| Rule booklet | 1 |
| Quick reference cards | 4 |
| Life tokens (for Extinction) | 40 |
| Era reference card | 1 |

**Human Genetics Deck:**
| Component | Quantity |
|-----------|----------|
| Trait cards | 96 |
| Environment cards | 12 |
| World map board | 1 |
| Rule booklet | 1 |
| Quick reference cards | 6 |
| Score pad | 1 |

### Box Dimensions

| Component | Size |
|-----------|------|
| Tuck box (single deck) | 70mm × 95mm × 25mm |
| Standard box (deck + extras) | 120mm × 100mm × 35mm |
| Deluxe box (multi-deck) | 200mm × 150mm × 50mm |

---

## Digital Adaptation

### Screen Dimensions

| Platform | Card Size | Resolution |
|----------|-----------|------------|
| Mobile (portrait) | 180px × 252px | 2x |
| Tablet | 252px × 353px | 2x |
| Desktop | 315px × 441px | 1x |
| Print preview | 630px × 882px | 2x |

### Animation Guidelines

| Element | Animation | Duration |
|---------|-----------|----------|
| Card flip | 3D rotate | 300ms |
| Card draw | Slide + fade | 200ms |
| Meld placement | Scale + slide | 250ms |
| Score update | Number roll | 400ms |

---

*Card Design System v1.0 - Production-ready specifications for Phylogenius*

