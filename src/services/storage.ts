import type { Task, Project, FocusSession, TimerState } from '../types';

const STORAGE_KEYS = {
  TASKS: 'focusflow_tasks_v1',
  PROJECTS: 'focusflow_projects_v1',
  SESSIONS: 'focusflow_sessions_v1',
  TIMER: 'focusflow_timer_v1',
};

// Seed Data helper
function getTodayDateString(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'FocusFlow Design',
    description: 'Design system and UI implementation for FocusFlow productivity app.',
    color: '#7657D9', // Lavender
    icon: 'Palette',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    name: 'Work & Operations',
    description: 'Client proposals, emails, sprint planning and documentation.',
    color: '#F3B292', // Peach
    icon: 'Briefcase',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proj-3',
    name: 'Personal Growth',
    description: 'Habit tracking, reading list, and wellness activities.',
    color: '#7CD4B0', // Mint
    icon: 'Sparkles',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Review design system color tokens',
    description: 'Ensure warm off-white canvas and lavender accent hierarchy match reference specs.',
    completed: false,
    priority: 'high',
    dueDate: getTodayDateString(0),
    projectId: 'proj-1',
    estimatedMinutes: 25,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    tags: ['UI/UX', 'Design'],
  },
  {
    id: 'task-2',
    title: 'Implement Pomodoro countdown logic',
    description: 'Add timestamp delta calculation so timer stays accurate in background tabs.',
    completed: false,
    priority: 'high',
    dueDate: getTodayDateString(0),
    projectId: 'proj-1',
    estimatedMinutes: 45,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    tags: ['Frontend', 'Timer'],
  },
  {
    id: 'task-3',
    title: 'Prepare weekly project status update',
    description: 'Summarize completed tasks and roadmap goals for the upcoming sprint.',
    completed: true,
    priority: 'medium',
    dueDate: getTodayDateString(0),
    projectId: 'proj-2',
    estimatedMinutes: 30,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    tags: ['Management'],
  },
  {
    id: 'task-4',
    title: 'Read 20 pages of "Deep Work"',
    description: 'Focus session on deep work philosophy and distraction elimination.',
    completed: true,
    priority: 'low',
    dueDate: getTodayDateString(0),
    projectId: 'proj-3',
    estimatedMinutes: 20,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    tags: ['Reading', 'Habit'],
  },
  {
    id: 'task-5',
    title: 'Schedule quarterly tax review',
    description: 'Gather receipts and send docs to accounting team.',
    completed: false,
    priority: 'medium',
    dueDate: getTodayDateString(2),
    projectId: 'proj-2',
    estimatedMinutes: 30,
    createdAt: new Date().toISOString(),
    tags: ['Finance'],
  },
  {
    id: 'task-6',
    title: 'Update local environment packages',
    description: 'Verify typescript and tailwind compatibility.',
    completed: false,
    priority: 'low',
    dueDate: getTodayDateString(-1), // Overdue task sample
    projectId: 'proj-1',
    estimatedMinutes: 15,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    tags: ['DevOps'],
  },
];

const DEFAULT_SESSIONS: FocusSession[] = [
  {
    id: 'sess-1',
    taskId: 'task-3',
    taskTitle: 'Prepare weekly project status update',
    durationMinutes: 25,
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    mode: 'focus',
  },
  {
    id: 'sess-2',
    taskId: 'task-4',
    taskTitle: 'Read 20 pages of "Deep Work"',
    durationMinutes: 25,
    completedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    mode: 'focus',
  },
];


function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null;
}

function isValidTask(task: unknown): task is Task {
  if (!isObject(task)) return false;
  const { id, title, completed, priority, dueDate, estimatedMinutes, createdAt } = task;
  if (typeof id !== 'string' || typeof title !== 'string' || typeof completed !== 'boolean') return false;
  if (priority !== 'low' && priority !== 'medium' && priority !== 'high') return false;
  if (typeof dueDate !== 'string' || typeof estimatedMinutes !== 'number' || typeof createdAt !== 'string') return false;
  return true;
}

function isValidProject(project: unknown): project is Project {
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

function isValidSession(session: unknown): session is FocusSession {
  if (!isObject(session)) return false;
  const { id, durationMinutes, completedAt, mode } = session;
  if (typeof id !== 'string' || typeof durationMinutes !== 'number' || typeof completedAt !== 'string') return false;
  if (mode !== 'focus' && mode !== 'shortBreak' && mode !== 'longBreak') return false;
  return true;
}

function isValidTimerState(timer: unknown): timer is TimerState {
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

export const storageService = {
  // Tasks
  getTasks(): Task[] {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!data) {
      this.saveTasks(DEFAULT_TASKS);
      return DEFAULT_TASKS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_TASKS;
    }
  },

  saveTasks(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  addTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      ...task,
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    this.saveTasks(tasks);
    return newTask;
  },

  updateTask(id: string, updates: Partial<Task>): Task | null {
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const currentTask = tasks[index];
    const updatedTask = { ...currentTask, ...updates };

    if (updates.completed !== undefined && updates.completed !== currentTask.completed) {
      updatedTask.completedAt = updates.completed ? new Date().toISOString() : undefined;
    }

    tasks[index] = updatedTask;
    this.saveTasks(tasks);
    return updatedTask;
  },

  deleteTask(id: string): Task | null {
    const tasks = this.getTasks();
    const taskToDelete = tasks.find((t) => t.id === id);
    if (!taskToDelete) return null;

    const filtered = tasks.filter((t) => t.id !== id);
    this.saveTasks(filtered);
    return taskToDelete;
  },

  // Projects
  getProjects(): Project[] {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!data) {
      this.saveProjects(DEFAULT_PROJECTS);
      return DEFAULT_PROJECTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_PROJECTS;
    }
  },

  saveProjects(projects: Project[]): void {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  addProject(project: Omit<Project, 'id' | 'createdAt'>): Project {
    const projects = this.getProjects();
    const newProject: Project = {
      ...project,
      id: 'proj-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
    };
    projects.push(newProject);
    this.saveProjects(projects);
    return newProject;
  },

  updateProject(id: string, updates: Partial<Project>): Project | null {
    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) return null;

    projects[index] = { ...projects[index], ...updates };
    this.saveProjects(projects);
    return projects[index];
  },

  deleteProject(id: string, taskAction: 'unassign' | 'delete'): boolean {
    let projects = this.getProjects();
    projects = projects.filter((p) => p.id !== id);
    this.saveProjects(projects);

    let tasks = this.getTasks();
    if (taskAction === 'unassign') {
      tasks = tasks.map((t) => (t.projectId === id ? { ...t, projectId: undefined } : t));
    } else {
      tasks = tasks.filter((t) => t.projectId !== id);
    }
    this.saveTasks(tasks);
    return true;
  },

  // Sessions
  getSessions(): FocusSession[] {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!data) {
      this.saveSessions(DEFAULT_SESSIONS);
      return DEFAULT_SESSIONS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_SESSIONS;
    }
  },

  saveSessions(sessions: FocusSession[]): void {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  },

  addSession(session: Omit<FocusSession, 'id' | 'completedAt'>): FocusSession {
    const sessions = this.getSessions();
    const newSession: FocusSession = {
      ...session,
      id: 'sess-' + Date.now(),
      completedAt: new Date().toISOString(),
    };
    sessions.unshift(newSession);
    this.saveSessions(sessions);
    return newSession;
  },

  // Timer State
  getTimerState(): TimerState {
    const data = localStorage.getItem(STORAGE_KEYS.TIMER);
    const defaultState: TimerState = {
      mode: 'focus',
      timeLeft: 25 * 60,
      isRunning: false,
      totalSessionsCompletedToday: 0,
    };
    if (!data) return defaultState;
    try {
      return JSON.parse(data);
    } catch {
      return defaultState;
    }
  },

  saveTimerState(state: TimerState): void {
    localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(state));
  },
  exportData(): void {
    const tasks = this.getTasks();
    const projects = this.getProjects();
    const sessions = this.getSessions();
    const timer = this.getTimerState();

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
  },

  importData(raw: string): { ok: true } | { ok: false; error: string } {
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

    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(timer));

    return { ok: true };
  },
};