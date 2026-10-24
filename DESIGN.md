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
- **Sidebar**: Sticky left panel with smooth transitions, subtle icons (`lucide-react`), and active indicator highlight (`bg-[#EFEBFC] text-[#7657D9]`, `rounded-2xl`).
- **Nav Parity**: Sidebar and mobile navigation must expose the same view list (Overview, My Tasks, Projects, Focus Timer, Completed, Settings).

### B. Cards & Containers
- Cards use micro shadows (`shadow-xs` on panels; `shadow-2xs` on the task toolbar).
- **Empty States**: Centered white card with `rounded-3xl`, a `w-12 h-12 rounded-full bg-[#EFEBFC] text-[#7657D9]` icon tile, `text-base font-bold` title, and `text-xs text-[#9E98AB] max-w-xs` message.
- Interactive items feature hover state border transitions (`hover:border-[#7657D9]/30` or similar).
- **Project Cards**: `ProjectCard.tsx` container is whole-card clickable (`cursor-pointer`) to navigate to My Tasks pre-filtered to that project. Action menus and sub-buttons MUST invoke `e.stopPropagation()` so opening menus or editing/deleting projects never triggers card-level navigation.

### C. Buttons & Inputs
- **Primary Button**: `bg-[#7657D9] hover:bg-[#6645C8] text-white rounded-full text-xs font-bold px-4 py-2.5 transition-all shadow-md shadow-[#7657D9]/20 active:scale-95`
- **Secondary / Cancel Button**: `rounded-full text-[#6D677D] hover:bg-[#F5F2EE]`
- **Search & Select Inputs**: `bg-[#FCFAF8] border border-[#F0EDE8] text-[#2A2538] focus:border-[#7657D9] rounded-xl text-xs`. Settings profile input uses the same colors with `rounded-2xl` and `text-sm font-semibold`.
- **Form Select (native)**: `Select` in `src/components/ui/Select.tsx` — `appearance-none`, `py-2`, chevron at right, same input colors. Used only by the `PomodoroTimer.tsx` task linker.
- **Shared Dropdown (custom listbox)**: Generic `Dropdown<T extends string>` in `src/components/ui/Dropdown.tsx` (`value`, `onChange`, `options`, `ariaLabel`, optional `icon` / `fullWidth`). Used by all `TaskList.tsx` filters/sort and the `TaskForm.tsx` Project field (`fullWidth`). Trigger is a `h-9` button with the same input colors, `rounded-xl`, `justify-between`, chevron rotating 180° when open, focus ring `focus-visible:ring-2 focus-visible:ring-[#7657D9]/20`. Menu: `bg-white border border-[#F0EDE8] rounded-2xl shadow-lg z-30 py-1 max-h-60 overflow-y-auto`, right-aligned on desktop, full/min-width on mobile (`max-w-[calc(100vw-32px)]`); `fullWidth` menus stretch to the trigger. Option rows: `px-3 py-2 text-xs font-semibold`; selected `text-[#7657D9] bg-[#EFEBFC]/50` + `Check` icon; hovered `bg-[#F5F2EE] text-[#2A2538]`. Never style native `<option>` here.
- **Validation Feedback**: Inline error text below the field, `text-xs font-semibold text-red-500`.

### D. Dropdown Interaction Rules
- Keyboard: open with Enter/Space/Arrow, move with ArrowUp/ArrowDown (wrapping), select with Enter/Space, close with Escape (focus returns to trigger) or Tab.
- Accessibility: `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` on the trigger; `role="listbox"` + `role="option"`/`aria-selected` on options; label via `aria-label`.
- Click outside closes the menu. One menu open at a time per dropdown.

### E. Badges & Priority Pillars
- **High Priority**: Pink badge (`bg-[#FDF0F6] text-[#993766] border-[#F3A6C8]/30`)
- **Medium Priority**: Yellow badge (`bg-[#FEF9E8] text-[#8C6C0F] border-[#F4D06F]/30`)
- **Low Priority**: Mint badge (`bg-[#EBF8F2] text-[#237A56] border-[#7CD4B0]/30`)
- **Overdue / Destructive**: `bg-[#ffdad6] text-[#ba1a1a]` (e.g. overdue pill, delete actions).

### F. Settings View
- Two-column card grid on desktop (`grid-cols-1 md:grid-cols-2`), single column on mobile.
- Each card: white surface, `rounded-3xl`, header row with a `w-10 h-10 rounded-2xl bg-[#EFEBFC]` icon tile followed by title + muted subtitle, separated by a `border-b border-[#F0EDE8]`.
- Actions are right-aligned pill buttons; destructive/irreversible actions (import) require `ConfirmDialog` confirmation.

### G. Project Color Swatches
- Preset row: `flex items-center gap-3`, 7 swatches at `w-8 h-8 rounded-full transition-all`.
- Active swatch (preset or custom): `ring-2 ring-offset-2 ring-[#7657D9] scale-110`; inactive hover: `hover:scale-105`.
- Custom swatch: same size, `border border-[#F0EDE8]`, `Pipette` icon (`w-4 h-4 text-white drop-shadow-xs`) over an invisible native `<input type="color">` (`absolute inset-0 opacity-0`, `aria-label="Custom theme color"`, `focus-within:ring-2`). Background shows the picked color when custom, `#7657D9` when a preset is active.

---

## 5. Responsive Design Rules

- **Desktop (>= 1024px)**: Full sidebar layout with multi-column task / overview grid.
- **Mobile (< 768px)**: Bottom navigation bar or hamburger menu, full-width single-column task list with scrollable horizontal tab bar (`overflow-x-auto`).