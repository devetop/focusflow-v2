# DESIGN.md - FocusFlow v2 Design System Guidelines

## 1. Visual Theme Philosophy

FocusFlow v2 features a warm-neutral, approachable aesthetic with crisp typography, soft pastel accents, rounded containers, and high contrast for dark text elements. The goal is to provide a calm, welcoming workspace that minimizes eye strain and distraction.

---

## 2. Typography

- **Body & Controls (`--font-sans`)**: `Nunito`, system-ui, -apple-system, sans-serif
- **Headings (`--font-heading`)**: `Plus Jakarta Sans`, system-ui, -apple-system, sans-serif

```css
body {
  background-color: var(--color-canvas);
  color: var(--color-ink-primary);
  font-family: var(--font-sans);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}
```

---

## 3. Color Tokens

### A. Surface & Backgrounds
- **Canvas (`--color-canvas`)**: `#FCFAF8` (Off-white / cream background)
- **Card Surface (`--color-card`)**: `#FFFFFF` (Pure white for elevated cards)
- **Border Subtle (`--color-border-subtle`)**: `#F0EDE8` (Warm soft border line)

### B. Brand / Primary Purple
- **Primary Main (`--color-primary-main`)**: `#7657D9` (Main buttons, active tabs, primary actions)
- **Primary Hover (`--color-primary-hover`)**: `#6645C8`
- **Primary Light (`--color-primary-light`)**: `#9B7AE8`
- **Primary Subtle (`--color-primary-subtle`)**: `#EFEBFC` (Light purple tint for active states & highlights)

### C. Pastel Accent Palette
- **Peach**: `#F3B292` | Background: `#FDF1EB` (High priority / alert badges)
- **Mint**: `#7CD4B0` | Background: `#EBF8F2` (Success / completed / low priority)
- **Yellow**: `#F4D06F` | Background: `#FEF9E8` (Medium priority)
- **Pink**: `#F3A6C8` | Background: `#FDF0F6` (Special tags / focus)
- **Lavender**: `#D1BCFF` | Background: `#E9DDFF` (Project accents)

### D. Typography Ink
- **Ink Primary (`--color-ink-primary`)**: `#2A2538` (Dark purple-charcoal for headings & titles)
- **Ink Secondary (`--color-ink-secondary`)**: `#6D677D` (Subtitles & secondary labels)
- **Ink Muted (`--color-ink-muted`)**: `#9E98AB` (Placeholders & timestamps)

---

## 4. UI Components & Layout Patterns

### A. Navigation & Tabs
- **Filter Tabs**: Active tab background `#7657D9` with white text (`text-white`), `rounded-2xl` pill shape. Inactive tab hover state uses `#F5F2EE` with text `#2A2538`.
- **Sidebar**: Sticky left panel with smooth transitions, subtle icons (`lucide-react`), and active indicator highlight.

### B. Cards & Containers
- Standard cards use `bg-white`, `border border-[#F0EDE8]`, `rounded-2xl` or `rounded-3xl`, and micro shadows (`shadow-2xs`).
- Interactive items feature hover state border transitions (`hover:border-[#7657D9]/30` or similar).

### C. Buttons & Inputs
- **Primary Button**: `bg-[#7657D9] hover:bg-[#6645C8] text-white rounded-xl text-xs font-bold px-4 py-2.5 transition-all shadow-xs`
- **Search & Select Inputs**: `bg-[#FCFAF8] border border-[#F0EDE8] text-[#2A2538] focus:border-[#7657D9] rounded-xl text-xs`

### D. Badges & Priority Pillars
- **High Priority**: Peach badge (`bg-[#FDF1EB] text-[#D96B3D]`)
- **Medium Priority**: Yellow badge (`bg-[#FEF9E8] text-[#B88714]`)
- **Low Priority**: Mint badge (`bg-[#EBF8F2] text-[#2E9468]`)

---

## 5. Responsive Design Rules

- **Desktop (>= 1024px)**: Full sidebar layout with multi-column task / overview grid.
- **Mobile (< 768px)**: Bottom navigation bar or hamburger menu, full-width single-column task list with scrollable horizontal tab bar (`overflow-x-auto`).
