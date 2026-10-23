import { useState, useEffect } from 'react';
import type { Task, Project, FocusSession, TimerState, ViewMode, ToastMessage } from './types';
import { storageService } from './services/storage';
import { getTodayDateString } from './utils/date';
import { AppShell } from './components/layout/AppShell';
import { PageHeader } from './components/layout/PageHeader';
import { Toast } from './components/layout/Toast';
import { ConfirmDialog } from './components/layout/ConfirmDialog';
import { OverviewDashboard } from './components/overview/OverviewDashboard';
import { TaskList } from './components/tasks/TaskList';
import { TaskForm } from './components/tasks/TaskForm';
import { ProjectCard } from './components/projects/ProjectCard';
import { ProjectForm } from './components/projects/ProjectForm';
import { PomodoroTimer } from './components/timer/PomodoroTimer';
import { Plus } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('overview');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [timerState, setTimerState] = useState<TimerState | undefined>();
  const [activeTaskForTimer, setActiveTaskForTimer] = useState<Task | undefined>();

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

    const [importConfirmFile, setImportConfirmFile] = useState<File | null>(null);
  const [importConfirmRaw, setImportConfirmRaw] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'task' | 'project';
    id: string;
    title: string;
    projectTaskCount?: number;
  }>({ isOpen: false, type: 'task', id: '', title: '' });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    setTasks(storageService.getTasks());
    setProjects(storageService.getProjects());
    setSessions(storageService.getSessions());
    setTimerState(storageService.getTimerState());
  }, []);

  const showToast = (message: string, type: ToastMessage['type'] = 'success', actionLabel?: string, onAction?: () => void) => {
    const newToast: ToastMessage = {
      id: Date.now().toString(),
      type,
      message,
      actionLabel,
      onAction,
    };
    setToasts((prev) => [newToast, ...prev]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'>, editingId?: string) => {
    if (editingId) {
      const updated = storageService.updateTask(editingId, taskData);
      if (updated) {
        setTasks(storageService.getTasks());
        showToast('Task updated successfully');
      }
    } else {
      storageService.addTask(taskData);
      setTasks(storageService.getTasks());
      showToast('New task added!');
    }
    setEditingTask(null);
  };

  const handleToggleComplete = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const newCompletedState = !target.completed;
    storageService.updateTask(id, { completed: newCompletedState });
    setTasks(storageService.getTasks());

    if (newCompletedState) {
      showToast(`Completed "${target.title}"! 🎉`, 'success');
    }
  };

  const handleDeleteTaskPrompt = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    setDeleteConfirm({
      isOpen: true,
      type: 'task',
      id: target.id,
      title: target.title,
    });
  };

  const handleConfirmDeleteTask = () => {
    const deletedTask = storageService.deleteTask(deleteConfirm.id);
    if (deletedTask) {
      setTasks(storageService.getTasks());
      showToast(`Task deleted`, 'info', 'Undo', () => {
        const restored: Task = { ...deletedTask };
        const currentTasks = storageService.getTasks();
        currentTasks.unshift(restored);
        storageService.saveTasks(currentTasks);
        setTasks(currentTasks);
        showToast('Task restored');
      });
    }
    setDeleteConfirm({ isOpen: false, type: 'task', id: '', title: '' });
  };

  const handleSaveProject = (projectData: Omit<Project, 'id' | 'createdAt'>, editingId?: string) => {
    if (editingId) {
      const updated = storageService.updateProject(editingId, projectData);
      if (updated) {
        setProjects(storageService.getProjects());
        showToast('Project updated');
      }
    } else {
      storageService.addProject(projectData);
      setProjects(storageService.getProjects());
      showToast('Project created!');
    }
    setEditingProject(null);
  };

  const handleDeleteProjectPrompt = (project: Project) => {
    const projectTasks = tasks.filter((t) => t.projectId === project.id);
    setDeleteConfirm({
      isOpen: true,
      type: 'project',
      id: project.id,
      title: project.name,
      projectTaskCount: projectTasks.length,
    });
  };

  const handleConfirmDeleteProject = (action: 'unassign' | 'delete') => {
    storageService.deleteProject(deleteConfirm.id, action);
    setProjects(storageService.getProjects());
    setTasks(storageService.getTasks());
    showToast(`Project deleted`);
    setDeleteConfirm({ isOpen: false, type: 'project', id: '', title: '' });
  };

  const handleSessionComplete = (session: Omit<FocusSession, 'id' | 'completedAt'>) => {
    storageService.addSession(session);
    setSessions(storageService.getSessions());
    showToast(`Focus session recorded! Great job! ⏱️`);
    if (session.taskId) {
      const linkedTask = tasks.find((t) => t.id === session.taskId);
      if (linkedTask && !linkedTask.completed) {
        showToast(`Mark "${linkedTask.title}" as done?`, 'info', 'Mark Complete', () => {
          handleToggleComplete(linkedTask.id);
        });
      }
    }
  };

  const handleStartTimerForTask = (task: Task) => {
    setActiveTaskForTimer(task);
    setCurrentView('timer');
    showToast(`Timer set for "${task.title}"`);
  };

    const handleExportData = () => {
    storageService.exportData();
    showToast('Workspace data exported', 'success');
  };

  const handleSelectImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const raw = e.target?.result as string;
      if (raw) {
        setImportConfirmFile(file);
        setImportConfirmRaw(raw);
      }
    };
    reader.onerror = () => {
      showToast('Failed to read backup file', 'error');
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!importConfirmRaw) return;
    const result = storageService.importData(importConfirmRaw);
    if (result.ok) {
      setTasks(storageService.getTasks());
      setProjects(storageService.getProjects());
      setSessions(storageService.getSessions());
      setTimerState(storageService.getTimerState());
      showToast('Workspace restored successfully!', 'success');
    } else {
      showToast(`Import failed: ${result.error}`, 'error');
    }
    setImportConfirmFile(null);
    setImportConfirmRaw(null);
  };

  const todayStr = getTodayDateString();
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr && !t.completed);

  return (
    <AppShell
      currentView={currentView}
      onNavigate={setCurrentView}
      onAddTask={() => {
        setEditingTask(null);
        setIsTaskFormOpen(true);
      }}
      todayTaskCount={todayTasks.length}
      onExportData={handleExportData}
      onImportData={handleSelectImportFile}
    >
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      <ConfirmDialog
        isOpen={Boolean(importConfirmFile && importConfirmRaw)}
        title="Restore Workspace Data?"
        message={`Are you sure you want to restore workspace data from "${importConfirmFile?.name || 'backup'}"? This will replace your current tasks, projects, sessions, and timer state.`}
        confirmLabel="Confirm & Restore"
        cancelLabel="Cancel"
        danger={true}
        onConfirm={handleConfirmImport}
        onCancel={() => {
          setImportConfirmFile(null);
          setImportConfirmRaw(null);
        }}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.type === 'task' ? 'Delete Task?' : 'Delete Project?'}
        message={
          deleteConfirm.type === 'task'
            ? `Are you sure you want to delete "${deleteConfirm.title}"? This can be undone.`
            : `Project "${deleteConfirm.title}" has ${deleteConfirm.projectTaskCount || 0} tasks attached. Choose what to do with these tasks.`
        }
        confirmLabel={deleteConfirm.type === 'task' ? 'Delete' : 'Unassign Tasks & Delete'}
        danger
        onConfirm={() => {
          if (deleteConfirm.type === 'task') {
            handleConfirmDeleteTask();
          } else {
            handleConfirmDeleteProject('unassign');
          }
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: 'task', id: '', title: '' })}
      />

      {currentView === 'overview' && (
        <OverviewDashboard
          tasks={tasks}
          projects={projects}
          sessions={sessions}
          onNavigate={setCurrentView}
          onAddTask={() => {
            setEditingTask(null);
            setIsTaskFormOpen(true);
          }}
          onToggleComplete={handleToggleComplete}
          onEditTask={(t) => {
            setEditingTask(t);
            setIsTaskFormOpen(true);
          }}
          onDeleteTask={handleDeleteTaskPrompt}
          onStartTimer={handleStartTimerForTask}
          onEditProject={(p) => {
            setEditingProject(p);
            setIsProjectFormOpen(true);
          }}
          onDeleteProject={handleDeleteProjectPrompt}
          onSelectProject={() => {
            setCurrentView('tasks');
          }}
        />
      )}

      {currentView === 'tasks' && (
        <div>
          <PageHeader
            title="My Tasks"
            subtitle="Manage your to-do items, organize by priority, and track progress."
            onAddTask={() => {
              setEditingTask(null);
              setIsTaskFormOpen(true);
            }}
          />
          <TaskList
            tasks={tasks}
            projects={projects}
            onToggleComplete={handleToggleComplete}
            onEdit={(t) => {
              setEditingTask(t);
              setIsTaskFormOpen(true);
            }}
            onDelete={handleDeleteTaskPrompt}
            onStartTimer={handleStartTimerForTask}
          />
        </div>
      )}

      {currentView === 'projects' && (
        <div>
          <PageHeader
            title="Projects"
            subtitle="Group tasks into focused projects to keep your goals organized."
            onAddTask={() => {
              setEditingProject(null);
              setIsProjectFormOpen(true);
            }}
            actionButtonLabel="Add Project"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <ProjectCard
                key={proj.id}
                project={proj}
                tasks={tasks}
                onEdit={(p) => {
                  setEditingProject(p);
                  setIsProjectFormOpen(true);
                }}
                onDelete={handleDeleteProjectPrompt}
                onSelectProject={() => {
                  setCurrentView('tasks');
                }}
              />
            ))}

            <button
              onClick={() => {
                setEditingProject(null);
                setIsProjectFormOpen(true);
              }}
              className="flex flex-col items-center justify-center min-h-[200px] p-6 rounded-3xl border-2 border-dashed border-[#F0EDE8] hover:border-[#7657D9] text-[#9E98AB] hover:text-[#7657D9] transition-all bg-white/50 group"
            >
              <div className="w-12 h-12 rounded-full bg-[#EFEBFC] flex items-center justify-center text-[#7657D9] mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-sm font-bold">Create New Project</span>
            </button>
          </div>
        </div>
      )}

      {currentView === 'timer' && (
        <div>
          <PageHeader
            title="Focus Timer"
            subtitle="Use the Pomodoro technique to boost concentration and prevent burnout."
          />
          <PomodoroTimer
            tasks={tasks}
            activeTask={activeTaskForTimer}
            onSelectTask={setActiveTaskForTimer}
            onSessionComplete={handleSessionComplete}
            savedTimerState={timerState}
            onSaveTimerState={storageService.saveTimerState}
          />
        </div>
      )}

      {currentView === 'completed' && (
        <div>
          <PageHeader
            title="Completed Tasks"
            subtitle="A log of all your finished accomplishments."
          />
          <TaskList
            tasks={tasks}
            projects={projects}
            onToggleComplete={handleToggleComplete}
            onEdit={(t) => {
              setEditingTask(t);
              setIsTaskFormOpen(true);
            }}
            onDelete={handleDeleteTaskPrompt}
            onStartTimer={handleStartTimerForTask}
            initialTab="completed"
          />
        </div>
      )}

      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        projects={projects}
        editingTask={editingTask}
      />

      <ProjectForm
        isOpen={isProjectFormOpen}
        onClose={() => {
          setIsProjectFormOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleSaveProject}
        editingProject={editingProject}
      />
    </AppShell>
  );
}
export default App;
