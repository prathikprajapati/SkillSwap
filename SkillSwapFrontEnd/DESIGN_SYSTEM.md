# SkillSwap Design System v2.0

A comprehensive, optimized design system following modern UI principles.

## Design Principles

1. **Modular Typography Scale** - Using Golden Ratio (1.618) and Perfect Fourth (1.333)
2. **8px Grid System** - All spacing is multiples of 8px
3. **60:30:10 Color Rule** - Balanced visual hierarchy
4. **Harmonious Ratios** - Golden Ratio, Perfect Fourth, Major Third for alignment
5. **Claymorphism + Glassmorphism** - Modern tactile UI with soft 3D effects

---

## Typography Scale

The typography system uses a modular scale based on musical ratios for visual harmony.

### Size Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `--text-3xs` | 10px | 1.5 | Micro labels |
| `--text-2xs` | 12px | 1.5 | Captions |
| `--text-xs` | 14px | 1.5 | Small text |
| `--text-sm` | 16px | 1.5 | Body text |
| `--text-base` | 18px | 1.618 | Lead paragraph |
| `--text-lg` | 20px | 1.333 | H4 |
| `--text-xl` | 24px | 1.333 | H3 |
| `--text-2xl` | 32px | 1.2 | H2 |
| `--text-3xl` | 42.6px | 1.2 | H1 |
| `--text-4xl` | 56.8px | 1 | Display Small |
| `--text-5xl` | 75.8px | 1 | Display Medium |

### Usage Classes

```tsx
// Headings
<h1 className="text-h1">Heading 1</h1>
<h2 className="text-h2">Heading 2</h2>
<h3 className="text-h3">Heading 3</h3>
<h4 className="text-h4">Heading 4</h4>

// Body text
<p className="text-body-lg">Large body text</p>
<p className="text-body">Default body text</p>
<p className="text-body-sm">Small body text</p>

// Meta text
<span className="text-caption">Caption text</span>
<span className="text-micro">Micro labels</span>
```

---

## Spacing System (8px Grid)

All spacing values are multiples of 8px for visual consistency.

### Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Micro adjustments |
| `--space-2` | 8px | Tight spacing |
| `--space-3` | 12px | Compact |
| `--space-4` | 16px | Default |
| `--space-5` | 20px | Comfortable |
| `--space-6` | 24px | Relaxed |
| `--space-8` | 32px | Section padding |
| `--space-10` | 40px | Large gaps |
| `--space-12` | 48px | Section gaps |
| `--space-16` | 64px | Major sections |
| `--space-20` | 80px | Hero spacing |
| `--space-24` | 96px | Page sections |

### Golden Ratio Spacing

For more organic layouts, use Golden Ratio spacing:

| Token | Value | Calculation |
|-------|-------|-------------|
| `--space-golden-sm` | 13px | 8 × 1.618 |
| `--space-golden-md` | 21px | 13 × 1.618 |
| `--space-golden-lg` | 34px | 21 × 1.618 |
| `--space-golden-xl` | 55px | 34 × 1.618 |

### Usage

```tsx
// Using Tailwind-like utility classes
<div className="p-4">16px padding</div>
<div className="m-6">24px margin</div>
<div className="gap-8">32px gap</div>

// Using CSS variables
<div style={{ padding: 'var(--space-6)' }}>24px padding</div>
```

---

## Color System (60:30:10 Rule)

The color system follows the 60:30:10 rule for visual balance:
- **60%** - Primary/Background (Dominant)
- **30%** - Secondary (Supporting)
- **10%** - Accent (Action/Highlight)

### Primary Colors (60%)

```css
--color-primary-60: #F8F6F3;           /* Background */
--color-primary-60-elevated: #FFFFFF;    /* Elevated surfaces */
--color-primary-60-sunken: #EDE9E4;    /* Sunken areas */
```

### Secondary Colors (30%)

```css
--color-secondary-30: #E8ECE4;         /* Default */
--color-secondary-30-hover: #DDE3D7;   /* Hover state */
--color-secondary-30-active: #D2DAC9;  /* Active state */
```

### Accent Colors (10%)

```css
--color-accent-10: #6B8E5A;            /* Primary accent (Olive) */
--color-accent-10-hover: #5A7A4A;    /* Hover state */
--color-accent-10-active: #4A6640;     /* Active state */
--color-accent-10-subtle: rgba(107, 142, 90, 0.1);
--color-accent-10-glow: rgba(107, 142, 90, 0.4);

--color-accent-2: #C9A87C;             /* Secondary accent (Terracotta) */
--color-accent-3: #5A7A8A;             /* Tertiary accent (Blue) */
```

### Text Colors

```css
--color-text-primary: #1A1D21;         /* Headings */
--color-text-secondary: #4A5059;       /* Body text */
--color-text-tertiary: #6E7681;        /* Meta text */
--color-text-disabled: #A0A7B0;        /* Disabled state */
```

---

## Border Radius (Uniform Shapes)

All shapes follow an 8px-based scale:

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` | 4px | Small elements |
| `--radius-sm` | 8px | Buttons, inputs |
| `--radius-md` | 12px | Cards |
| `--radius-lg` | 16px | Modals, panels |
| `--radius-xl` | 24px | Large cards |
| `--radius-2xl` | 32px | Feature cards |
| `--radius-3xl` | 48px | Hero sections |

### Claymorphism Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-clay-sm` | 20px | Small clay cards |
| `--radius-clay-md` | 28px | Medium clay cards |
| `--radius-clay-lg` | 40px | Large clay cards |

---

## Claymorphism Effects

Soft, tactile 3D UI effects with gentle shadows.

### Basic Clay

```tsx
// Default clay effect
<div className="clay">Content</div>

// Size variants
<div className="clay clay-xs">Extra small</div>
<div className="clay clay-sm">Small</div>
<div className="clay clay-md">Medium</div>
<div className="clay clay-lg">Large</div>
```

### Interactive Clay

```tsx
// Button with hover and active states
<button className="btn-clay">Click me</button>

// Accent colored button
<button className="btn-clay clay-accent">Primary Action</button>
```

### Inset Clay (Pressed State)

```tsx
<div className="clay clay-inset">Pressed appearance</div>
```

### Clay + Glass Combination

```tsx
<div className="clay-glass">Combined effect</div>
```

---

## Glassmorphism Effects

Frosted glass UI effects with backdrop blur.

### Basic Glass

```tsx
// Default glass effect
<div className="glass">Content</div>

// Subtle glass
<div className="glass glass-subtle">Subtle blur</div>

// Strong glass
<div className="glass glass-strong">Strong blur</div>
```

### Glass Blur Variants

```tsx
<div className="glass glass-blur-xs">4px blur</div>
<div className="glass glass-blur-sm">8px blur</div>
<div className="glass glass-blur-md">12px blur</div>
<div className="glass glass-blur-lg">20px blur</div>
<div className="glass glass-blur-xl">32px blur</div>
```

### Glass Patterns

```tsx
// Glass button
<button className="btn-glass">Glass Button</button>

// Glass navigation
<nav className="nav-glass">Navigation</nav>

// Glass card
<div className="card-glass">Card content</div>
```

---

## Layout Ratios

Use harmonic ratios for layouts and sizing.

### Aspect Ratios

```tsx
// Golden Ratio (1.618:1)
<div className="ratio-golden">Golden rectangle</div>

// Perfect Fourth (1.333:1)
<div className="ratio-perfect-fourth">Standard ratio</div>

// Perfect Fifth (1.5:1)
<div className="ratio-perfect-fifth">Wide ratio</div>

// Octave (2:1)
<div className="ratio-octave">Double ratio</div>
```

### Content Widths

```tsx
// Narrow content (optimal reading: 45ch)
<div className="container-narrow">Narrow content</div>

// Default content (optimal reading: 65ch)
<div className="container-default">Default content</div>

// Wide content (75ch)
<div className="container-wide">Wide content</div>
```

---

## Utility Classes

### Effects

```tsx
// Glow effects
<div className="glow-accent">Accent glow</div>
<div className="glow-lg">Large glow</div>

// Transitions
<div className="transition-smooth">Smooth transition</div>
<div className="transition-spring">Spring transition</div>

// Hover lift
<div className="hover-lift">Lifts on hover</div>

// Focus ring
<button className="focus-ring">Visible focus</button>
```

### Color Utilities

```tsx
// Background colors
<div className="bg-primary-60">Primary background</div>
<div className="bg-secondary-30">Secondary background</div>
<div className="bg-accent-10">Accent background</div>

// Text colors
<p className="text-primary">Primary text</p>
<p className="text-secondary">Secondary text</p>
<p className="text-tertiary">Tertiary text</p>
```

---

## Pre-built Patterns

### Cards

```tsx
// Standard card
<div className="card">Card content</div>

// Clay card
<div className="card-clay">Clay card content</div>

// Glass card
<div className="card-glass">Glass card content</div>
```

### Inputs

```tsx
// Clay input
<input className="input-clay" placeholder="Enter text..." />
```

### Sections

```tsx
// Padded section
<section className="section-padded">
  <div className="section-narrow">Content</div>
</section>
```

---

## Dark Mode

The design system automatically supports dark mode via CSS media queries and the `.dark` class.

### Automatic (System Preference)

```css
@media (prefers-color-scheme: dark) {
  /* Dark mode styles applied automatically */
}
```

### Manual Toggle

```tsx
// Add .dark class to parent
<div className="dark">
  {/* All content uses dark mode colors */}
</div>
```

---

## File Structure

```
src/
├── styles/
│   ├── design-tokens.css    # All CSS variables
│   ├── utilities.css          # Utility classes
│   ├── theme.css              # Shadcn theme integration
│   └── tailwind.css           # Tailwind config
├── components/
│   └── DesignShowcase.tsx     # Demo component
└── index.css                   # Main entry point
```

---

## Best Practices

1. **Use CSS Variables** - Always use the design tokens instead of hardcoded values
2. **Stick to the 8px Grid** - All spacing should be multiples of 8px
3. **Follow 60:30:10** - Respect the color hierarchy for visual balance
4. **Combine Effects** - Use clay + glass together for premium UI
5. **Maintain Ratios** - Use harmonic ratios for layouts and sizing
6. **Test Both Modes** - Ensure designs work in both light and dark mode

---

## Migration Guide

### From Old System

Replace hardcoded values with design tokens:

```css
/* Before */
font-size: 18px;
padding: 20px;
background: #f0f0f0;
border-radius: 10px;

/* After */
font-size: var(--text-base);
padding: var(--space-5);
background: var(--color-primary-60);
border-radius: var(--radius-md);
```

### Using Tailwind

The design system works alongside Tailwind. Use `var()` for custom values:

```tsx
<div className="p-[var(--space-6)] text-[var(--text-lg)]">
  Content
</div>
```

Or use the pre-built utility classes:

```tsx
<div className="clay clay-md p-8">
  Clay card
</div>
```

---

## Browser Support

- **Modern browsers**: Full support (Chrome 88+, Firefox 85+, Safari 14+, Edge 88+)
- **Backdrop filter**: Supported in all modern browsers
- **CSS Variables**: Supported in all modern browsers
- **Dark mode**: Media query support required

For older browsers, the system gracefully degrades to standard colors without effects.
