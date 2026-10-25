import type { Task } from '../types';
import { DEFAULT_TASKS } from './storageSeeds';

export function getTasksFromStorage(storageKey: string, saveTasks: (tasks: Task[]) => void): Task[] {
  const data = localStorage.getItem(storageKey);
  if (!data) {
    saveTasks(DEFAULT_TASKS);
    return DEFAULT_TASKS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_TASKS;
  }
}

export function addTaskToStorage(
  task: Omit<Task, 'id' | 'createdAt'>,
  getTasks: () => Task[],
  saveTasks: (tasks: Task[]) => void
): Task {
  const tasks = getTasks();
  const newTask: Task = {
    ...task,
    id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    createdAt: new Date().toISOString(),
  };
  tasks.unshift(newTask);
  saveTasks(tasks);
  return newTask;
}

export function updateTaskInStorage(
  id: string,
  updates: Partial<Task>,
  getTasks: () => Task[],
  saveTasks: (tasks: Task[]) => void
): Task | null {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const currentTask = tasks[index];
  const updatedTask = { ...currentTask, ...updates };

  if (updates.completed !== undefined && updates.completed !== currentTask.completed) {
    updatedTask.completedAt = updates.completed ? new Date().toISOString() : undefined;
  }

  tasks[index] = updatedTask;
  saveTasks(tasks);
  return updatedTask;
}

export function deleteTaskFromStorage(
  id: string,
  getTasks: () => Task[],
  saveTasks: (tasks: Task[]) => void
): Task | null {
  const tasks = getTasks();
  const taskToDelete = tasks.find((t) => t.id === id);
  if (!taskToDelete) return null;

  const filtered = tasks.filter((t) => t.id !== id);
  saveTasks(filtered);
  return taskToDelete;
}