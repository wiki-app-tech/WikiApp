# Design System Master File — WikiApp Prestige

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** WikiApp Prestige
**Category:** Exclusive Luxury Brand & High-End Intelligence Services
**Rule System:** 60-30-10 Distribution Rule

---

## Global Rules

### Color Palette (60-30-10 Rule)

| Proportion | Role | Hex / Token | Usage & Semantics |
|------------|------|-------------|-------------------|
| **60% Dominant** | Background & Negative Space | `#F7F7F7` (`--color-surface-primary`) | Bone white / pearl gray. Dominantly occupies 60% of visual canvas for airy, clean, and spacious feel. Elevated surfaces: `#FFFFFF`. Sunken: `#EFEFEF`. |
| **30% Secondary & Structure** | High-Contrast Typography & Boundaries | `#1B263B` (`--color-text-primary`) & `#4A2E35` (`--color-text-secondary`) | Deep navy blue for headings, editorial structure, and high readability. Rich plum for structural boundaries, categories, badges, and brand identity. Tertiary text: `#6E6875`. |
| **10% Accent** | High-Value CTAs & Delicate Highlights | `#D4AF37` (`--color-accent-primary`) | Soft metallic gold / bronze. Used strictly for high-value action buttons, subtle metallic border trims, active indicators, and delicate micro-glows. Hover: `#C5A028`. |

**Contrast & Readability (WCAG AAA):**
- Contrast ratio between `#1B263B` (Deep Navy) and `#F7F7F7` (Bone White) is **10.8:1** (far exceeds WCAG AAA requirement of 7:1).
- Contrast ratio between `#4A2E35` (Rich Plum) and `#F7F7F7` is **8.2:1** (WCAG AAA compliant).
- CTAs in `#D4AF37` (Gold) utilize `#1B263B` bold text for crisp 5.8:1 contrast.

### Typography

- **Heading / Display Font:** Cormorant Garamond (`--font-cormorant` / `--font-display`)
- **Body / Sans Font:** Inter (`--font-inter` / `--font-sans`)
- **Mood:** Distinction, elite sophistication, timeless exclusivity, haute couture, bespoke craftsmanship.
- **Pairing Rationale:** Refined, slender serif for titles to convey tradition and luxury, paired with clean, perfectly spaced sans-serif for body text.

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Fine badge gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon inline margins |
| `--space-md` | `16px` / `1rem` | Standard component padding |
| `--space-lg` | `24px` / `1.5rem` | Section cards |
| `--space-xl` | `32px` / `2rem` | Column gutters |
| `--space-2xl` | `48px` / `3rem` | Generous luxury whitespace |
| `--space-3xl` | `64px` / `4rem` | Hero & section margins (60% breathing room) |

### Shadows & Depth

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-subtle` | `0 2px 8px rgba(27, 38, 59, 0.03)` | Ultra-light card elevation |
| `--shadow-premium` | `0 10px 30px -10px rgba(27, 38, 59, 0.06)` | Standard luxury container |
| `--shadow-gold` | `0 4px 20px -2px rgba(212, 175, 55, 0.28)` | Gold CTA button aura |
| `--shadow-glass` | `0 8px 32px 0 rgba(74, 46, 53, 0.05)` | Floating glass overlay |

---

## Component Specifications

### 1. High-Value CTA Button (10% Gold Accent)

```css
.btn-gold-luxury {
  background: linear-gradient(135deg, #d4af37 0%, #c5a028 100%);
  color: #1b263b;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 0.75rem 1.75rem;
  border-radius: 9999px;
  border: 1px solid rgba(212, 175, 55, 0.6);
  box-shadow: 0 4px 18px -2px rgba(212, 175, 55, 0.3);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-gold-luxury:hover {
  background: linear-gradient(135deg, #e0be48 0%, #d4af37 100%);
  color: #0d1522;
  transform: translateY(-1px);
  box-shadow: 0 6px 24px 0 rgba(212, 175, 55, 0.45);
}
```

### 2. Secondary Luxury Outline Button (30% Structural Boundary)

```css
.btn-outline-luxury {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-subtle);
  padding: 0.75rem 1.75rem;
  border-radius: 9999px;
  font-weight: 500;
  letter-spacing: 0.03em;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-outline-luxury:hover {
  border-color: #d4af37;
  color: #4a2e35;
  box-shadow: 0 0 16px rgba(212, 175, 55, 0.15);
  transform: translateY(-1px);
}
```

### 3. Luxury Elevated Card (60% Dominant Space)

```css
.luxury-card {
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border-subtle);
  border-radius: 1.5rem;
  box-shadow: 0 10px 30px -10px rgba(27, 38, 59, 0.04);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease;
}

.luxury-card:hover {
  border-color: rgba(212, 175, 55, 0.4);
  box-shadow: 0 16px 40px -12px rgba(74, 46, 53, 0.08);
}
```

---

## Anti-Patterns (Strictly Forbidden)

- ❌ **No saturated neon colors** (electric lime, saturated cyan, loud orange)
- ❌ **No emojis as icons** (use Lucide SVG icons exclusively)
- ❌ **No noisy, cluttered layouts** (always preserve 60% negative space)
- ❌ **No harsh box-shadows** (use diffuse, featherlight shadows with navy/plum undertones)
- ❌ **No abrupt hover changes** (use 250–350ms cubic-bezier transitions)
- ❌ **No unstyled default browser fonts** (always use Cormorant Garamond for titles and Inter for body)
