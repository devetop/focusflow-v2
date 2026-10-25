import type { Task, Project, FocusSession, TimerState, UserProfile } from '../types';
import { DEFAULT_PROJECTS, DEFAULT_SESSIONS } from './storageSeeds';
import { isValidTimerState } from './storageValidation';
import { exportWorkspaceData, importWorkspaceData } from './storageBackup';
import { getTasksFromStorage, addTaskToStorage, updateTaskInStorage, deleteTaskFromStorage } from './storageTaskActions';

const STORAGE_KEYS = {
  TASKS: 'focusflow_tasks_v1',
  PROJECTS: 'focusflow_projects_v1',
  SESSIONS: 'focusflow_sessions_v1',
  TIMER: 'focusflow_timer_v1',
  PROFILE: 'focusflow_profile_v1',
};

export const storageService = {
  // Tasks
  getTasks(): Task[] {
    return getTasksFromStorage(STORAGE_KEYS.TASKS, (t) => this.saveTasks(t));
  },

  saveTasks(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  addTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
    return addTaskToStorage(task, () => this.getTasks(), (t) => this.saveTasks(t));
  },

  updateTask(id: string, updates: Partial<Task>): Task | null {
    return updateTaskInStorage(id, updates, () => this.getTasks(), (t) => this.saveTasks(t));
  },

  deleteTask(id: string): Task | null {
    return deleteTaskFromStorage(id, () => this.getTasks(), (t) => this.saveTasks(t));
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
      const parsed = JSON.parse(data);
      if (isValidTimerState(parsed)) {
        return parsed;
      }
      return defaultState;
    } catch {
      return defaultState;
    }
  },

  saveTimerState(state: TimerState): void {
    localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(state));
  },

  exportData(): void {
    exportWorkspaceData(
      () => this.getTasks(),
      () => this.getProjects(),
      () => this.getSessions(),
      () => this.getTimerState()
    );
  },

  importData(raw: string): { ok: true } | { ok: false; error: string } {
    return importWorkspaceData(raw, STORAGE_KEYS);
  },

  // Profile
  getProfile(): UserProfile {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    const defaultProfile: UserProfile = { name: 'Alex' };
    if (!data) return defaultProfile;
    try {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed.name === 'string') {
        return parsed;
      }
      return defaultProfile;
    } catch {
      return defaultProfile;
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },
};