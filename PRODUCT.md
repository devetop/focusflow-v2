# PRODUCT.md - FocusFlow v2 Product Specification

## 1. Product Overview

**FocusFlow v2** is an offline-first, client-side productivity dashboard designed for individuals and knowledge workers. It combines task management, project organization, Pomodoro focus timing, and visual analytics into a clean, distraction-free interface.

---

## 2. Target Audience & Core Values

- **Target Users**: Developers, designers, students, and professionals seeking a lightweight productivity workspace.
- **Core Values**:
  - **Focus First**: Direct connection between tasks and focus session timing.
  - **Clutter-Free**: Active tasks stay separated from completed history.
  - **Privacy & Ownership**: All data stays in the user's browser local storage.
  - **Instant Feedback**: Real-time stats, toast notifications, and progress indicators.

---

## 3. Core Feature Modules

### 1. Overview Dashboard (`OverviewDashboard.tsx`)
- Today's completion progress with a greeting from the persisted profile name, a 7-day completed-task bar chart, and today's focus task list (up to 4 tasks).
- **7-Day Activity Chart** (`OverviewWeeklyChart.tsx`): one bar per local day (last 7 days), height proportional to that day's completed-task count against the week's max (minimum 4), floored at 12% so zero days stay visible. Today's bar is `#7657D9`; past days with completions `#9B7AE8` at 60%; zero days `#F0EDE8`. Each bar carries a `title` tooltip (`N tasks completed`) and the card footer totals the week.
- Focus summary card (total focus minutes and session count for today) linking to the Focus Timer.
- Active projects preview (first 2) with completion progress bars. Clicking any project card or its "View All Tasks" button navigates to My Tasks pre-filtered to that project's tasks.
- Every card/stat is computed from the raw task and session arrays, independent of TaskList filter state.

### 2. My Tasks (`TaskList.tsx`, `TaskItem.tsx`, `TaskForm.tsx`)
- **Filter Tabs**:
  - **All Tasks**: Shows active incomplete tasks across all due dates, including tasks created without a due date.
  - **Today**: Shows active incomplete tasks due on the current date (excludes tasks without a due date).
  - **Upcoming**: Shows active incomplete tasks due in the future (excludes tasks without a due date).
  - **Overdue**: Shows active incomplete tasks past their due date (excludes tasks without a due date).
  - **Completed**: Shows all completed tasks regardless of date (including tasks without a due date).
- **Search & Filtering**: Real-time text search (title, description, tags), project filter dropdown, priority filter dropdown, and multi-field sorting (Due Date, Priority, Creation Date). Pre-filters by project when arriving from a selected project card; navigating directly from sidebar resets project filter to "All Projects".
- **Contextual Task Creation**: Clicking "Add Task" while in a project-filtered task view automatically pre-selects that project in the task creation form (`defaultProjectId`). Users can still manually change or clear the project dropdown. Opening "Add Task" from Overview, direct "My Tasks" (All Projects), Completed, Projects, or Timer views defaults to the fallback project or unassigned state without leaking the filter. Editing an existing task always preserves the task's assigned project.
- **Filter Controls**: Task list filters/sort use the shared accessible `Dropdown` listbox (`src/components/ui/Dropdown.tsx`, ARIA + full keyboard support); the `TaskForm` Project field uses the same `Dropdown` with `fullWidth`, and the timer task linker uses the shared `Dropdown`.
- **Task Actions**: Complete/Uncomplete toggle, inline timer trigger, edit modal, and delete confirmation.
- **Empty States**: Empty lists render a centered card with a lavender icon tile and a context-aware message (adjust filters when filtered/searching, completed tasks appear here on the Completed tab, otherwise prompt adding a task).

### 3. Focus Timer (`PomodoroTimer.tsx`)
- **Layout**: "Focus & Flow State" eyebrow + `Pomodoro Timer` headline, with a live pill showing pulsing dot + `Flow Mode Active` / `Flow Paused` and the computed `N Streak`; two-pane 7/5 grid (task linker above the dial on the left; metrics, Sound & Space, and today's flow log on the right).
- **Timer Modes**:
  - **Focus**: 25 minutes default work interval.
  - **Short Break**: 5 minutes break.
  - **Long Break**: 15 minutes break.
- **Focus Console**: Mode tabs (`Focus (25m)` / `Short Break (5m)` / `Long Break (15m)`), a concentric SVG ring with the countdown and a `Session Running` / `Paused` badge, and Reset / Start-Pause / Skip controls.
- **Task Integration**: A task linker (`Dropdown`, shared listbox) plus a `Done` quick-complete button attach the timer to a specific active task and log dedicated focus sessions. With no task selected, the card reads "General Focus Session" and Done is disabled.
- **Right Rail Metrics**: Time (today's logged focus minutes plus elapsed minutes of the running focus session, live), Pomos (completed sessions with mode `focus` only), and Tasks in flow (distinct linked tasks), derived from the raw session array.
- **Streak & Day Rollover**: Streak counts consecutive local days with at least one logged session, counting back from today (or yesterday when today has none). Today's sessions, streak, and metrics roll over at midnight without a reload (30s `now` refresh plus visibility/focus refresh).
- **Sound & Space**: Ambient FX selector (Mute / Rain / Cafe / White Noise — selection only, no audio playback) and two toggles: Bell chime at session end (Web Audio tone) and Auto-start rest intervals.
- **Flow Log**: Reverse-chronological list of today's sessions with start–end clock times, duration, mode, and a focus/break icon (capped at 5 rows).
- **Session Logging**: Completed focus sessions are appended to `localStorage` (`focusflow_sessions_v1`) with task link, duration, mode, and timestamp; the Overview summarises today's totals.
- **Persisted Timer State**: Mode, remaining seconds, running flag, session count, and linked task are saved under `focusflow_timer_v1`. State calculation is wall-clock based and centralized in `src/hooks/useAppTimer.ts` (`reconcileAndTickState` in `src/utils/timerUtils.ts`), preserving running status and remaining time across view navigation, browser reloads, and tab throttling (`visibilitychange`). Expired timers process session logging exactly once upon load or reconciliation.
- **Day Keys**: Every "today"/history day key uses local time via `getLocalDateString()`; never UTC slicing.

### 4. Settings & Data Management (`SettingsView.tsx`)
- **Profile Details**: Edit the display name used in the Overview greeting. Trimmed, 1–40 characters, defaults to `'Alex'`. Saved immediately to `localStorage` (`focusflow_profile_v1`) with a toast confirmation.
- **Full Data Export**: Compiles all tasks, projects, focus sessions, and timer state into a formatted JSON backup payload (`focusflow-backup-YYYY-MM-DD.json`). Uses native Blob and Object URL download triggers. Profile data is intentionally excluded.
- **Strict Data Import**: Supports restoring workspace state from valid `.json` snapshot files. Performs all-or-nothing validation against version schema (`version: 1`) and domain type structures. Rejecting invalid or corrupt schemas leaves active local data untouched.
- **Safety Confirmation**: Displays a safety confirmation modal (`ConfirmDialog`) prior to overwriting active workspace state. Automatically refreshes application state live (including profile) without requiring manual browser page reload.
- **Entry Point**: Reached via the `settings` view in `Sidebar.tsx` and `MobileNavigation.tsx`; backup/restore actions live here, not in the sidebar footer.
- **Project Deletion**: Deleting a project prompts a `ConfirmDialog` and unassigns its tasks (tasks are preserved, `projectId` cleared) rather than deleting them.

---

## 4. Key Data Schemas

### UserProfile
```typescript
interface UserProfile {
  name: string;             // Trimmed, 1–40 characters. Default: 'Alex'
}
```

### Task
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;         // Optional, format: YYYY-MM-DD
  projectId?: string;
  estimatedMinutes: number;
  createdAt: string;        // ISO string
  completedAt?: string;      // ISO string
  tags?: string[];
}
```

### Project
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;            // Lowercase hex #rrggbb (preset swatch or custom picker)
  icon: string;             // Lucide icon name or key
  createdAt: string;        // ISO string
}
```

### FocusSession
```typescript
interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  completedAt: string;        // ISO string
  mode: 'focus' | 'shortBreak' | 'longBreak';
}
```

---

## 5. Invariants & Product Guarantees

1. **Separation of Active vs Completed Tasks**: Marking a task as completed immediately removes it from active views ("All", "Today", "Upcoming", "Overdue") and moves it exclusively into "Completed". Reopening (uncompleting) a task immediately restores it to active views.
2. **Offline Local Storage**: All state is initialized from and saved to browser `localStorage` using keys prefixed with `focusflow_`. Profile data uses `focusflow_profile_v1` and is not part of export/import payloads.
3. **Responsive SPA Layout**: Sidebar navigation for desktop and bottom/drawer navigation for mobile views.
4. **Single Greeting Source**: The Overview greeting always uses the persisted profile name; never hardcode a display name in components.
5. **Keyboard-Accessible Filters**: Every filter/sort control in the Tasks view must be operable without a mouse (open, navigate, select, escape) and expose correct ARIA listbox semantics via the shared `Dropdown`.
6. **Project Theme Color**: Projects support theme color selection via 7 preset swatches or a custom native color picker (`input[type="color"]`, `aria-label="Custom theme color"`). Values are always saved as lowercase hex strings (`#rrggbb`), and editing a project preserves its existing color until changed.
7. **Containerized Static Delivery**: The product ships as one static-SPA container (`docker compose up -d --build` → `http://localhost:8080`, image `focusflow:local`) built from `node:24-alpine` and served by `nginx:alpine`. There is no backend, no API, no runtime environment configuration, and no URL-based routing — every view comes from `ViewMode` state. Because data stays in browser `localStorage`, container restarts neither migrate nor wipe user data.