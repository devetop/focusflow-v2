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
- Focus summary card (total focus minutes and session count for today) linking to the Focus Timer.
- Active projects preview (first 2) with completion progress bars. Clicking any project card or its "View All Tasks" button navigates to My Tasks pre-filtered to that project's tasks.
- Every card/stat is computed from the raw task and session arrays, independent of TaskList filter state.

### 2. My Tasks (`TaskList.tsx`, `TaskItem.tsx`, `TaskForm.tsx`)
- **Filter Tabs**:
  - **All Tasks**: Shows active incomplete tasks across all due dates.
  - **Today**: Shows active incomplete tasks due on the current date.
  - **Upcoming**: Shows active incomplete tasks due in the future.
  - **Overdue**: Shows active incomplete tasks past their due date.
  - **Completed**: Shows all completed tasks regardless of date.
- **Search & Filtering**: Real-time text search (title, description, tags), project filter dropdown, priority filter dropdown, and multi-field sorting (Due Date, Priority, Creation Date). Pre-filters by project when arriving from a selected project card; navigating directly from sidebar resets project filter to "All Projects".
- **Contextual Task Creation**: Clicking "Add Task" while in a project-filtered task view automatically pre-selects that project in the task creation form (`defaultProjectId`). Users can still manually change or clear the project dropdown. Opening "Add Task" from Overview, direct "My Tasks" (All Projects), Completed, Projects, or Timer views defaults to the fallback project or unassigned state without leaking the filter. Editing an existing task always preserves the task's assigned project.
- **Filter Controls**: Task list filters/sort use the shared accessible `Dropdown` listbox (`src/components/ui/Dropdown.tsx`, ARIA + full keyboard support); the `TaskForm` Project field uses the same `Dropdown` with `fullWidth`, and the timer task linker uses the styled native `Select`.
- **Task Actions**: Complete/Uncomplete toggle, inline timer trigger, edit modal, and delete confirmation.
- **Empty States**: Empty lists render a centered card with a lavender icon tile and a context-aware message (adjust filters when filtered/searching, completed tasks appear here on the Completed tab, otherwise prompt adding a task).

### 3. Focus Timer (`PomodoroTimer.tsx`)
- **Timer Modes**:
  - **Focus**: 25 minutes default work interval.
  - **Short Break**: 5 minutes break.
  - **Long Break**: 15 minutes break.
- **Task Integration**: Optionally attach the timer to a specific active task to log dedicated focus sessions.
- **Session Logging**: Completed focus sessions are appended to `localStorage` (`focusflow_sessions_v1`) with task link, duration, mode, and timestamp; the Overview summarises today's totals.
- **Persisted Timer State**: Mode, remaining seconds, running flag, session count, and linked task are saved under `focusflow_timer_v1` and restored on reload.

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
  dueDate: string;          // Format: YYYY-MM-DD
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
  color: string;            // Hex or badge color class
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