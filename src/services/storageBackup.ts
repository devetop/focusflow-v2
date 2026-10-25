import { isObject, isValidTask, isValidProject, isValidSession, isValidTimerState } from './storageValidation';
import type { Task, Project, FocusSession, TimerState } from '../types';

export function exportWorkspaceData(
  getTasks: () => Task[],
  getProjects: () => Project[],
  getSessions: () => FocusSession[],
  getTimerState: () => TimerState
): void {
  const tasks = getTasks();
  const projects = getProjects();
  const sessions = getSessions();
  const timer = getTimerState();

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      tasks,
      projects,
      sessions,
      timer,
    },
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const todayDate = new Date().toISOString().split('T')[0];
  const filename = `focusflow-backup-${todayDate}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importWorkspaceData(
  raw: string,
  storageKeys: { TASKS: string; PROJECTS: string; SESSIONS: string; TIMER: string }
): { ok: true } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'Invalid JSON format.' };
  }

  if (!isObject(parsed)) {
    return { ok: false, error: 'Backup payload must be a JSON object.' };
  }

  if (parsed.version !== 1) {
    return { ok: false, error: 'Unsupported schema version. Expected version 1.' };
  }

  if (!isObject(parsed.data)) {
    return { ok: false, error: 'Missing or invalid "data" object in backup file.' };
  }

  const { tasks, projects, sessions, timer } = parsed.data;

  if (!Array.isArray(tasks) || !tasks.every(isValidTask)) {
    return { ok: false, error: 'Invalid task data structure in backup file.' };
  }

  if (!Array.isArray(projects) || !projects.every(isValidProject)) {
    return { ok: false, error: 'Invalid project data structure in backup file.' };
  }

  if (!Array.isArray(sessions) || !sessions.every(isValidSession)) {
    return { ok: false, error: 'Invalid focus session data structure in backup file.' };
  }

  if (!isValidTimerState(timer)) {
    return { ok: false, error: 'Invalid timer state structure in backup file.' };
  }

  localStorage.setItem(storageKeys.TASKS, JSON.stringify(tasks));
  localStorage.setItem(storageKeys.PROJECTS, JSON.stringify(projects));
  localStorage.setItem(storageKeys.SESSIONS, JSON.stringify(sessions));
  localStorage.setItem(storageKeys.TIMER, JSON.stringify(timer));

  return { ok: true };
}