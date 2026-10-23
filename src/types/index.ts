export type Priority = 'low' | 'medium' | 'high';

export type ViewMode = 'overview' | 'tasks' | 'projects' | 'timer' | 'completed' | 'settings';

export interface UserProfile {
  name: string;
}

export type TaskFilterTab = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  projectId?: string;
  estimatedMinutes: number;
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
  tags?: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string; // Hex color or CSS class identifier
  icon: string; // Lucide icon name or emoji/symbol key
  createdAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  completedAt: string; // ISO string
  mode: 'focus' | 'shortBreak' | 'longBreak';
}

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerState {
  mode: TimerMode;
  timeLeft: number; // in seconds
  isRunning: boolean;
  totalSessionsCompletedToday: number;
  activeTaskId?: string;
  lastTickTimestamp?: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}