import type { Task, Project, FocusSession } from '../types';

function getTodayDateString(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'FocusFlow Design',
    description: 'Design system and UI implementation for FocusFlow productivity app.',
    color: '#7657D9',
    icon: 'Palette',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    name: 'Work & Operations',
    description: 'Client proposals, emails, sprint planning and documentation.',
    color: '#F3B292',
    icon: 'Briefcase',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proj-3',
    name: 'Personal Growth',
    description: 'Habit tracking, reading list, and wellness activities.',
    color: '#7CD4B0',
    icon: 'Sparkles',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_TASKS: Task[] = [
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
    dueDate: getTodayDateString(1),
    projectId: 'proj-2',
    estimatedMinutes: 15,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    tags: ['Finance'],
  },
  {
    id: 'task-6',
    title: 'Setup automated deployment pipeline',
    description: 'Configure CI/CD workflow for preview builds.',
    completed: false,
    priority: 'low',
    dueDate: getTodayDateString(3),
    projectId: 'proj-1',
    estimatedMinutes: 60,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    tags: ['DevOps'],
  },
];

export const DEFAULT_SESSIONS: FocusSession[] = [
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