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
- High-level productivity metrics: Total tasks, completed today, pending count, and focus minutes logged.
- Quick summary of active projects with completion progress bars.
- Quick-access list for high-priority tasks.

### 2. My Tasks (`TaskList.tsx`, `TaskItem.tsx`, `TaskForm.tsx`)
- **Filter Tabs**:
  - **All Tasks**: Shows active incomplete tasks across all due dates.
  - **Today**: Shows active incomplete tasks due on the current date.
  - **Upcoming**: Shows active incomplete tasks due in the future.
  - **Overdue**: Shows active incomplete tasks past their due date.
  - **Completed**: Shows all completed tasks regardless of date.
- **Search & Filtering**: Real-time text search (title, description, tags), project filter dropdown, priority filter dropdown, and multi-field sorting (Due Date, Priority, Creation Date).
- **Task Actions**: Complete/Uncomplete toggle, inline timer trigger, edit modal, and delete confirmation.

### 3. Focus Timer (`PomodoroTimer.tsx`)
- **Timer Modes**:
  - **Focus**: 25 minutes default work interval.
  - **Short Break**: 5 minutes break.
  - **Long Break**: 15 minutes break.
- **Task Integration**: Optionally attach the timer to a specific active task to log dedicated focus sessions.
- **Session History**: Records completed focus sessions with timestamps and durations.

### 4. Settings & Data Management
- Export data to JSON file.
- Import data from JSON backup with validation.
- Reset/clear sample data.

---

## 4. Key Data Schemas

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
2. **Offline Local Storage**: All state is initialized from and saved to browser `localStorage` using keys prefixed with `focusflow_`.
3. **Responsive SPA Layout**: Sidebar navigation for desktop and bottom/drawer navigation for mobile views.