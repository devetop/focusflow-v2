import type { Task, Project, FocusSession, TimerState } from '../types';

export function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null;
}

export function isValidTask(task: unknown): task is Task {
  if (!isObject(task)) return false;
  const { id, title, completed, priority, dueDate, estimatedMinutes, createdAt } = task;
  if (typeof id !== 'string' || typeof title !== 'string' || typeof completed !== 'boolean') return false;
  if (priority !== 'low' && priority !== 'medium' && priority !== 'high') return false;
  if ((dueDate !== undefined && typeof dueDate !== 'string') || typeof estimatedMinutes !== 'number' || typeof createdAt !== 'string') return false;
  return true;
}

export function isValidProject(project: unknown): project is Project {
  if (!isObject(project)) return false;
  const { id, name, color, icon, createdAt } = project;
  if (
    typeof id !== 'string' ||
    typeof name !== 'string' ||
    typeof color !== 'string' ||
    typeof icon !== 'string' ||
    typeof createdAt !== 'string'
  )
    return false;
  return true;
}

export function isValidSession(session: unknown): session is FocusSession {
  if (!isObject(session)) return false;
  const { id, durationMinutes, completedAt, mode } = session;
  if (typeof id !== 'string' || typeof durationMinutes !== 'number' || typeof completedAt !== 'string') return false;
  if (mode !== 'focus' && mode !== 'shortBreak' && mode !== 'longBreak') return false;
  return true;
}

export function isValidTimerState(timer: unknown): timer is TimerState {
  if (!isObject(timer)) return false;
  const { mode, timeLeft, isRunning, totalSessionsCompletedToday } = timer;
  if (mode !== 'focus' && mode !== 'shortBreak' && mode !== 'longBreak') return false;
  if (
    typeof timeLeft !== 'number' ||
    typeof isRunning !== 'boolean' ||
    typeof totalSessionsCompletedToday !== 'number'
  )
    return false;
  return true;
}