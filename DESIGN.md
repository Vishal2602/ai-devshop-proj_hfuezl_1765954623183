# PDF Tarot Reader - Design System

## Design Philosophy

**Mystical meets Modern** - A design that feels magical and whimsical without being cheesy. We want users to smile, not cringe. Think "artisanal tarot deck meets Stripe's clean aesthetic."

**Generous Whitespace** - Let the cards breathe. The tarot reading is the star; everything else should support it without competing.

**Delightful Restraint** - Animations should feel like magic, not a circus. Every movement has purpose.

---

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Cosmic Purple** | `#6B46C1` | Primary actions, card backs, key accents |
| **Mystic Violet** | `#805AD5` | Hover states, secondary elements |
| **Deep Indigo** | `#2D3748` | Text, headers |

### Background Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Canvas** | `#FAFAFA` | Main background |
| **Card Surface** | `#FFFFFF` | Cards, elevated surfaces |
| **Soft Mist** | `#F7FAFC` | Alternate sections, subtle contrast |
| **Starfield** | `#1A202C` | Dark mode background, PDF cover |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Golden Glow** | `#F6AD55` | Highlights, stars, special badges |
| **Twilight Rose** | `#ED64A6` | Future card accent, warnings |
| **Sage Green** | `#68D391` | Success states, past card accent |
| **Ocean Blue** | `#4299E1` | Present card accent, links |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#48BB78` | Upload complete, export success |
| **Warning** | `#ECC94B` | File size warnings |
| **Error** | `#F56565` | Upload errors, validation failures |
| **Muted** | `#A0AEC0` | Disabled states, hints |

### Card Position Colors

Each tarot position has a distinct accent to help users quickly identify card meanings:

| Position | Primary | Subtle |
|----------|---------|--------|
| **Past** | `#68D391` (Sage Green) | `#C6F6D5` |
| **Present** | `#4299E1` (Ocean Blue) | `#BEE3F8` |
| **Future** | `#ED64A6` (Twilight Rose) | `#FED7E2` |

---

## Typography

### Font Stack

```css
--font-display: 'Playfair Display', Georgia, serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| **Display** | 48px / 3rem | 700 | 1.1 | Hero headlines |
| **H1** | 36px / 2.25rem | 600 | 1.2 | Page titles |
| **H2** | 28px / 1.75rem | 600 | 1.3 | Section headers |
| **H3** | 22px / 1.375rem | 600 | 1.4 | Card names |
| **Body Large** | 18px / 1.125rem | 400 | 1.6 | Card meanings, key text |
| **Body** | 16px / 1rem | 400 | 1.5 | Default body text |
| **Body Small** | 14px / 0.875rem | 400 | 1.5 | Secondary info, hints |
| **Caption** | 12px / 0.75rem | 500 | 1.4 | Badges, labels |

### Font Pairing Rules

- **Headlines & Card Names:** Playfair Display - adds mystical, editorial quality
- **Body & UI:** Inter - clean, highly legible, modern
- **Code & Data:** JetBrains Mono - technical elements, file names

---

## Spacing System

Based on an 8px grid for consistency:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps, inline spacing |
| `--space-2` | 8px | Icon gaps, small padding |
| `--space-3` | 12px | Button padding (vertical) |
| `--space-4` | 16px | Card padding, standard gaps |
| `--space-5` | 24px | Section spacing |
| `--space-6` | 32px | Component gaps |
| `--space-7` | 48px | Major section breaks |
| `--space-8` | 64px | Page margins |
| `--space-9` | 96px | Hero spacing |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Small elements, badges |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards, modals |
| `--radius-xl` | 16px | Large cards, dropzone |
| `--radius-full` | 9999px | Circular elements, pills |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Cards at rest |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Elevated cards |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Modals, popovers |
| `--shadow-glow` | `0 0 20px rgba(107,70,193,0.3)` | Magical hover glow |
| `--shadow-card` | `0 4px 20px rgba(107,70,193,0.15)` | Tarot card shadow |

---

## Animation Specifications

### Timing Functions

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Duration Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | 100ms | Micro-interactions |
| `--duration-fast` | 150ms | Hovers, small transitions |
| `--duration-normal` | 240ms | Standard transitions |
| `--duration-slow` | 400ms | Page transitions |
| `--duration-reveal` | 600ms | Card flip reveal |

### Specific Animations

| Element | Animation | Duration | Easing | Notes |
|---------|-----------|----------|--------|-------|
| Card entrance | fade + translateY(-20px) | 240ms | easeOut | Stagger 100ms between cards |
| Card flip | rotateY(180deg) | 600ms | spring | With perspective: 1000px |
| Card hover | scale(1.02) + shadow-lg | 150ms | ease-out | Subtle magnetic effect |
| Button hover | scale(1.02) + glow | 120ms | ease-out | |
| Progress bar | width transition | continuous | linear | With animated gradient |
| Success confetti | particle burst | 800ms | spring | 20-30 particles |
| Page transition | fade + slide | 300ms | ease-in-out | AnimatePresence |

---

## Component Specifications

### DropZone

```
┌─────────────────────────────────────────────┐
│                                             │
│         ┌─────────────────────┐             │
│         │   ☁️ Upload Icon    │             │
│         └─────────────────────┘             │
│                                             │
│        Drop your PDF here                   │
│        or click to browse                   │
│                                             │
│         ─────────────────────               │
│         PDF up to 10MB                      │
│                                             │
└─────────────────────────────────────────────┘
```

**Specifications:**
- Background: `--color-surface` with dashed border
- Border: 2px dashed `--color-muted`
- Border radius: `--radius-xl` (16px)
- Padding: `--space-8` (64px)
- Hover state: Border becomes `--color-primary`, background subtle purple tint
- Active/dragging: Solid border, scale(1.02), glow shadow
- Min height: 300px
- Max width: 500px

### TarotCard

```
┌───────────────────────┐
│  ╔═══════════════╗    │
│  ║               ║    │
│  ║   Card Art    ║    │
│  ║   / Symbol    ║    │
│  ║               ║    │
│  ╚═══════════════╝    │
│                       │
│   The Procrastinator  │
│   ─────────────────   │
│   Card meaning text   │
│   goes here with      │
│   good line height    │
│                       │
└───────────────────────┘
```

**Specifications:**
- Width: 220px (desktop), 160px (mobile)
- Aspect ratio: 2:3 (tarot standard)
- Background: `--color-surface`
- Border radius: `--radius-lg` (12px)
- Shadow: `--shadow-card`
- Padding: `--space-4` (16px)
- Card back: Gradient from `--color-primary` to `--color-secondary` with mystical pattern

**Card States:**
- Rest: Base shadow, no transform
- Hover: scale(1.02), shadow-lg, subtle glow
- Flipping: rotateY transition with backface-visibility
- Revealed: Content visible, position accent color on left edge

### AuraBadge

```
┌──────────────────────┐
│ ✨ Focus Goblin      │
└──────────────────────┘
```

**Specifications:**
- Background: Gradient based on aura type
- Border radius: `--radius-full`
- Padding: `--space-2` `--space-4`
- Font: Caption size, weight 600
- Shadow: Subtle glow matching aura color

### ExportButton

```
┌──────────────────────────────┐
│     ⬇️  Export Your Reading │
└──────────────────────────────┘
```

**Specifications:**
- Background: `--color-primary`
- Color: White
- Border radius: `--radius-md`
- Padding: `--space-3` `--space-6`
- Font: Body, weight 600
- Hover: Lighten background, scale(1.02), glow
- Loading: Spinner + "Generating..." text
- Success: Check icon + "Downloaded!" for 2s

### CertificationStamp

```
        ╭──────────────────╮
       │    CERTIFIED      │
       │  CHAOTIC NEUTRAL  │
       │  ★ ★ ★ ★ ★       │
        ╰──────────────────╯
```

**Specifications:**
- Style: Vintage rubber stamp aesthetic
- Color: `--color-primary` at 80% opacity
- Border: 3px solid, slightly rotated (-3deg)
- Font: Mono, uppercase
- Animation: Pop in with rotation and scale

---

## Layout Specifications

### Container

- Max width: 1200px
- Padding: `--space-6` (mobile), `--space-8` (desktop)
- Centered horizontally

### Upload View

- Single column, centered
- DropZone centered in viewport
- Generous vertical padding (--space-9)

### Reading View

- Card spread: 3 cards in horizontal row
- Card gap: `--space-6` (32px)
- Cards slightly overlapping on mobile
- Below cards: Aura badge + Export button
- Layout collapses to vertical stack on mobile (< 640px)

### Card Spread Positions

```
Desktop (> 768px):
┌─────────────────────────────────────────────┐
│                                             │
│   ┌─────┐      ┌─────┐      ┌─────┐        │
│   │PAST │      │ NOW │      │NEXT │        │
│   │     │      │     │      │     │        │
│   │     │      │     │      │     │        │
│   └─────┘      └─────┘      └─────┘        │
│   rotate(-5°)  rotate(0°)   rotate(5°)     │
│                                             │
└─────────────────────────────────────────────┘

Mobile (< 640px):
┌─────────────────────┐
│     ┌─────────┐     │
│     │  PAST   │     │
│     └─────────┘     │
│     ┌─────────┐     │
│     │  NOW    │     │
│     └─────────┘     │
│     ┌─────────┐     │
│     │  NEXT   │     │
│     └─────────┘     │
└─────────────────────┘
```

---

## Responsive Breakpoints

| Name | Width | Notes |
|------|-------|-------|
| `--bp-sm` | 640px | Mobile to tablet |
| `--bp-md` | 768px | Tablet to desktop |
| `--bp-lg` | 1024px | Desktop |
| `--bp-xl` | 1280px | Large desktop |

---

## Interaction States

### Focus States
- Outline: 2px solid `--color-primary`
- Outline offset: 2px
- Never remove focus outlines, only style them

### Disabled States
- Opacity: 0.5
- Cursor: not-allowed
- No hover effects

### Loading States
- Skeleton: Animated gradient shimmer
- Color: `--color-muted` base, lighter highlight sweep

---

## Iconography

Use simple, clean icons. Prefer outlined style for consistency.

**Required Icons:**
- Upload/Cloud
- File/Document
- Download/Export
- Star/Sparkle
- Check/Success
- X/Close
- Spinner/Loading

**Icon Sizes:**
- Small: 16px
- Default: 20px
- Large: 24px
- Hero: 48px

---

## Accessibility

### Color Contrast
- All text meets WCAG AA (4.5:1 for body, 3:1 for large text)
- Interactive elements have visible focus states
- Don't rely on color alone for meaning

### Motion
- Respect `prefers-reduced-motion`
- Provide instant transitions when reduced motion is preferred
- Keep essential transitions, remove decorative ones

### Screen Readers
- All interactive elements have accessible names
- Card reveal announces card name and meaning
- Progress states are announced
- Export success is announced

---

## Dark Mode (Future Enhancement)

Not in MVP, but the design system supports it:
- Swap `--color-canvas` with `--color-starfield`
- Adjust card surface colors
- Maintain contrast ratios
- Glow effects become more prominent

---

## PDF Cover Page Design

The generated cover page follows the same design language:

```
┌────────────────────────────────────────────┐
│                                            │
│            PDF TAROT READING               │
│          ═══════════════════               │
│                                            │
│    ┌──────┐  ┌──────┐  ┌──────┐           │
│    │ PAST │  │ NOW  │  │ NEXT │           │
│    │      │  │      │  │      │           │
│    │ Name │  │ Name │  │ Name │           │
│    └──────┘  └──────┘  └──────┘           │
│                                            │
│    Past: Interpretation text here          │
│    Present: Interpretation text here       │
│    Future: Interpretation text here        │
│                                            │
│    ┌─────────────────────────┐            │
│    │  AURA: Focus Goblin     │            │
│    └─────────────────────────┘            │
│                                            │
│         ╭──────────────────╮              │
│        │    CERTIFIED      │              │
│        │  CHAOTIC NEUTRAL  │              │
│         ╰──────────────────╯              │
│                                            │
│    pdftarot.app                            │
└────────────────────────────────────────────┘
```

**PDF Page Specifications:**
- Match original PDF page size
- Background: Deep purple (`#1A202C`) or gradient
- Text: White/gold for contrast
- Cards: Simplified vector versions
- Stamp: Rotated, vintage style

---

*Design System by Riley (Designer)*
*Project ID: proj_hfuezl_1765954623183*
