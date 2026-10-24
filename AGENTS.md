# AGENTS.md - FocusFlow AI Agent Guidelines

This repository contains **FocusFlow v2**, a modern productivity dashboard built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS (v4)**.

---

## 1. Environment & Commands

- **Node.js Package Manager**: `npm`
- **Build Command**: `npm run build` (Runs `tsc -b` and `vite build`)
- **Lint Command**: `npm run lint` (Runs `oxlint`)
- **Dev Server**: `npm run dev`

> **Crucial Rule**: Before submitting any pull request or finishing a task, always run `npm run build` to verify there are zero TypeScript compilation or bundle errors.

---

## 2. Codebase Structure

```
src/
├── types/
│   └── index.ts          # Central domain interfaces (Task, Project, FocusSession, TimerState, etc.)
├── services/
│   └── storage.ts        # LocalStorage persistence layer with initial seed data
├── utils/
│   └── date.ts           # Date formatting and comparison utilities (YYYY-MM-DD)
├── components/
│   ├── overview/         # Dashboard statistics, productivity metrics, & project summaries
│   ├── tasks/            # TaskList, TaskItem, and TaskForm components
│   ├── projects/         # ProjectCard and ProjectForm components
│   ├── timer/            # PomodoroTimer component
│   ├── settings/         # SettingsView (profile + data backup/restore)
│   ├── ui/               # Select: styled native <select> for form fields
│   └── layout/           # AppShell, Sidebar, PageHeader, MobileNavigation, Toast, ConfirmDialog
├── App.tsx               # Root component managing global state, active tab views, & modal state
├── index.css             # Tailwind v4 import & custom CSS variable theme definitions
└── main.tsx              # React entry point
```

---

## 3. Core Domain & Business Logic Rules

### A. Task Filtering (`TaskList.tsx`)
- **Active Tabs**: `all`, `today`, `upcoming`, `overdue`, `completed`.
- **Incompletion Guard**: Tabs `all`, `today`, `upcoming`, and `overdue` **MUST NEVER** display completed tasks (`task.completed === true`).
- **Completion View**: Tab `completed` **MUST** display all completed tasks regardless of due date.
- **Filters & Search**: Search query, project filter, priority filter, and sort options must operate on the tab-filtered subset and **MUST NOT** resurrect completed tasks in non-completed tabs.

### B. Overview & Project Statistics
- Do not alter task completed counts calculated in `OverviewDashboard.tsx` or `ProjectCard.tsx` when changing task filter views. Task completion status metrics must remain globally accurate based on raw task arrays.

### C. Storage & State Persistence (`storage.ts`)
- All user modifications (Tasks, Projects, Focus Sessions) persist in `localStorage` under keys `focusflow_tasks_v1`, `focusflow_projects_v1`, `focusflow_sessions_v1`, `focusflow_timer_v1`.
- Profile data (`UserProfile`) persists separately under `focusflow_profile_v1` and is **not** part of the export payload.
- Do not change local storage schema or key names without explicit user request.

### D. Project Selection & Task Filtering
- **Project Selection**: Clicking anywhere on a project card (`ProjectCard.tsx`) or its "View All Tasks" button (both in Overview and Projects views) sets `taskProjectFilter` state in `App.tsx` to that project's ID and switches view to `'tasks'`.
- **Pre-Filtered Task View**: `TaskList.tsx` accepts an optional `initialProjectId?: string` prop to seed `selectedProjectId`.
- **Filter Reset on Direct Nav**: Navigating to My Tasks directly via Sidebar, MobileNavigation, or the Overview section header resets `taskProjectFilter` back to `'all'` so project filters do not persist unexpectedly.
- **Card Action Propagation**: Action menus and buttons on `ProjectCard` must call `e.stopPropagation()` so opening menus or editing/deleting projects never triggers navigation.

### E. Navigation & Settings (`ViewMode`)
- `ViewMode` = `overview | tasks | projects | timer | completed | settings`.
- Every `ViewMode` must have a matching entry in **both** `Sidebar.tsx` and `MobileNavigation.tsx` nav lists; adding a view requires updating both plus the `App.tsx` view switch.
- Profile name (default `'Alex'`) is displayed in the Overview greeting (`OverviewDashboard.tsx`) via the `profileName` prop and edited in `SettingsView.tsx`. Name is trimmed and limited to 1–40 characters.

---

## 4. Coding & Refactoring Conventions

1. **React 19 & TypeScript**:
   - Use explicit typing for props and state.
   - Use functional components (`React.FC<Props>`).
   - Do not use `any` type.
2. **Dependencies**:
   - Do NOT add new third-party libraries or npm dependencies without prior approval.
   - Use existing icons from `lucide-react`.
3. **UI & Styling**:
   - Follow the design tokens defined in `src/index.css` (Tailwind `@theme` variables such as `--color-primary-main`, `--color-canvas`, `--color-ink-primary`).
   - Do not alter existing layout, color palettes, or component styling unless requested.
4. **Dropdowns & Selects** (two intentional patterns, do not merge them):
   - **Form fields** (`TaskForm.tsx`, `PomodoroTimer.tsx`): use `Select` from `src/components/ui/Select.tsx` (styled native `<select>`). Native semantics are required here.
   - **List filters** (`TaskList.tsx`): use the local `FilterDropdown` listbox. It must keep `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, `role="listbox"`/`role="option"`, `aria-selected`, outside-click close, and Arrow/Enter/Space/Escape keyboard handling. Never downgrade it back to a native select.
   - Keep `FilterDropdown` local to `TaskList.tsx` until a second consumer needs it; extract then, not before.
5. **Agent Guardrails**:
   - Always confirm file paths before editing.
   - Never delete existing components, files, or data schemas without user confirmation.
   - Always verify changes with `npm run build` before finalizing tasks.

- Data Backup & Portability (`storageService.exportData` and `storageService.importData`):
  - **Export Payload**: `{ version: 1, exportedAt: ISO string, data: { tasks, projects, sessions, timer } }`. File output: `focusflow-backup-YYYY-MM-DD.json`.
  - **Import Validation**: Strict schema checking for version (`version === 1`) and data domain array/object types. Write operations to `localStorage` are all-or-nothing (zero writes on validation error).
  - **UI Triggers**: Export/Import action buttons live in `src/components/settings/SettingsView.tsx` ("Data Backup & Restore" card), reached via the Settings view. Keep them out of the `Sidebar.tsx` footer.
  - **Import Flow**: `App.tsx` reads the file, asks for confirmation via `ConfirmDialog`, then calls `storageService.importData(raw)` and reloads all domain state from storage (including profile) on success.