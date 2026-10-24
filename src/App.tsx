import { useState, useEffect, useCallback, useRef } from "react";
import type { Task, Project, FocusSession, TimerState, TimerMode, ViewMode, ToastMessage, UserProfile } from "./types";
import { storageService } from "./services/storage";
import { getTodayDateString } from "./utils/date";
import { AppShell } from "./components/layout/AppShell";
import { PageHeader } from "./components/layout/PageHeader";
import { Toast } from "./components/layout/Toast";
import { ConfirmDialog } from "./components/layout/ConfirmDialog";
import { OverviewDashboard } from "./components/overview/OverviewDashboard";
import { TaskList } from "./components/tasks/TaskList";
import { TaskForm } from "./components/tasks/TaskForm";
import { ProjectCard } from "./components/projects/ProjectCard";
import { ProjectForm } from "./components/projects/ProjectForm";
import { PomodoroTimer } from "./components/timer/PomodoroTimer";
import { SettingsView } from "./components/settings/SettingsView";
import { Plus } from "lucide-react";

const MODE_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const playChime = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.8);
  } catch {
    // Audio context may be restricted before user gesture
  }
};

export function App() {
  const [currentView, setCurrentView] = useState<ViewMode>("overview");
  const [taskProjectFilter, setTaskProjectFilter] = useState<string>("all");
  const [profile, setProfile] = useState<UserProfile>({ name: "Alex" });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [timerState, setTimerState] = useState<TimerState | undefined>();
  const [activeTaskForTimer, setActiveTaskForTimer] = useState<Task | undefined>();

  const activeTaskRef = useRef<Task | undefined>(activeTaskForTimer);
  useEffect(() => {
    activeTaskRef.current = activeTaskForTimer;
  }, [activeTaskForTimer]);

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [importConfirmFile, setImportConfirmFile] = useState<File | null>(null);
  const [importConfirmRaw, setImportConfirmRaw] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: "task" | "project";
    id: string;
    title: string;
    projectTaskCount?: number;
  }>({ isOpen: false, type: "task", id: "", title: "" });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastMessage["type"] = "success", actionLabel?: string, onAction?: () => void) => {
    const newToast: ToastMessage = {
      id: Date.now().toString(),
      type,
      message,
      actionLabel,
      onAction,
    };
    setToasts((prev) => [newToast, ...prev]);
  }, []);

  const handleToggleComplete = useCallback((id: string) => {
    const currentTasks = storageService.getTasks();
    const target = currentTasks.find((t) => t.id === id);
    if (!target) return;

    const newCompletedState = !target.completed;
    storageService.updateTask(id, { completed: newCompletedState });
    setTasks(storageService.getTasks());

    if (newCompletedState) {
      showToast(`Completed "${target.title}"! 🎉`, "success");
    }
  }, [showToast]);

  const handleSessionComplete = useCallback((session: Omit<FocusSession, "id" | "completedAt">) => {
    storageService.addSession(session);
    setSessions(storageService.getSessions());
    showToast(`Focus session recorded! Great job! ⏱️`);
    if (session.taskId) {
      const linkedTask = storageService.getTasks().find((t) => t.id === session.taskId);
      if (linkedTask && !linkedTask.completed) {
        showToast(`Mark "${linkedTask.title}" as done?`, "info", "Mark Complete", () => {
          handleToggleComplete(linkedTask.id);
        });
      }
    }
  }, [showToast, handleToggleComplete]);

  const reconcileAndTick = useCallback((currentState: TimerState): TimerState => {
    if (!currentState.isRunning || !currentState.lastTickTimestamp) {
      return currentState;
    }

    const now = Date.now();
    const elapsed = Math.floor((now - currentState.lastTickTimestamp) / 1000);

    if (elapsed <= 0) {
      return currentState;
    }

    if (elapsed < currentState.timeLeft) {
      return {
        ...currentState,
        timeLeft: currentState.timeLeft - elapsed,
        lastTickTimestamp: now,
      };
    }

    // Timer expired (elapsed >= currentState.timeLeft)
    if (currentState.chime !== false) {
      playChime();
    }

    if (currentState.mode === "focus") {
      const activeTask = activeTaskRef.current;
      handleSessionComplete({
        taskId: activeTask?.id,
        taskTitle: activeTask?.title || "General Focus Session",
        durationMinutes: 25,
        mode: "focus",
      });

      const newCount = currentState.totalSessionsCompletedToday + 1;
      const nextMode: TimerMode = newCount % 4 === 0 ? "longBreak" : "shortBreak";
      const nextDuration = MODE_DURATIONS[nextMode];
      const autoStart = Boolean(currentState.autoStartRest) && (elapsed - currentState.timeLeft < 5);

      return {
        ...currentState,
        mode: nextMode,
        timeLeft: nextDuration,
        isRunning: autoStart,
        totalSessionsCompletedToday: newCount,
        lastTickTimestamp: autoStart ? now : undefined,
      };
    } else {
      return {
        ...currentState,
        mode: "focus",
        timeLeft: MODE_DURATIONS.focus,
        isRunning: false,
        lastTickTimestamp: undefined,
      };
    }
  }, [handleSessionComplete]);

  // Initial load and wall-clock reconciliation
  useEffect(() => {
    const loadedTasks = storageService.getTasks();
    const loadedProjects = storageService.getProjects();
    const loadedSessions = storageService.getSessions();
    const loadedTimer = storageService.getTimerState();
    const loadedProfile = storageService.getProfile();

    setTasks(loadedTasks);
    setProjects(loadedProjects);
    setSessions(loadedSessions);
    setProfile(loadedProfile);

    if (loadedTimer.isRunning && loadedTimer.lastTickTimestamp) {
      const now = Date.now();
      const elapsed = Math.floor((now - loadedTimer.lastTickTimestamp) / 1000);
      if (elapsed > 0) {
        if (elapsed < loadedTimer.timeLeft) {
          const reconciled: TimerState = {
            ...loadedTimer,
            timeLeft: loadedTimer.timeLeft - elapsed,
            lastTickTimestamp: now,
          };
          setTimerState(reconciled);
          storageService.saveTimerState(reconciled);
        } else {
          if (loadedTimer.chime !== false) playChime();

          if (loadedTimer.mode === "focus") {
            const initialActiveTask = loadedTimer.activeTaskId
              ? loadedTasks.find((t) => t.id === loadedTimer.activeTaskId && !t.completed)
              : undefined;

            storageService.addSession({
              taskId: initialActiveTask?.id,
              taskTitle: initialActiveTask?.title || "General Focus Session",
              durationMinutes: 25,
              mode: "focus",
            });
            setSessions(storageService.getSessions());

            const newCount = loadedTimer.totalSessionsCompletedToday + 1;
            const nextMode: TimerMode = newCount % 4 === 0 ? "longBreak" : "shortBreak";
            const reconciled: TimerState = {
              ...loadedTimer,
              mode: nextMode,
              timeLeft: MODE_DURATIONS[nextMode],
              isRunning: false,
              totalSessionsCompletedToday: newCount,
              lastTickTimestamp: undefined,
            };
            setTimerState(reconciled);
            storageService.saveTimerState(reconciled);
          } else {
            const reconciled: TimerState = {
              ...loadedTimer,
              mode: "focus",
              timeLeft: MODE_DURATIONS.focus,
              isRunning: false,
              lastTickTimestamp: undefined,
            };
            setTimerState(reconciled);
            storageService.saveTimerState(reconciled);
          }
        }
      } else {
        setTimerState(loadedTimer);
      }
    } else {
      setTimerState(loadedTimer);
    }
  }, []);

  // Sync active task for timer with task existence / completed status
  useEffect(() => {
    if (timerState?.activeTaskId) {
      const foundTask = tasks.find((t) => t.id === timerState.activeTaskId && !t.completed);
      if (foundTask) {
        if (activeTaskForTimer?.id !== foundTask.id) {
          setActiveTaskForTimer(foundTask);
        }
      } else {
        if (activeTaskForTimer !== undefined) {
          setActiveTaskForTimer(undefined);
        }
        setTimerState((prev) => {
          if (!prev || !prev.activeTaskId) return prev;
          const next = { ...prev, activeTaskId: undefined };
          storageService.saveTimerState(next);
          return next;
        });
      }
    } else {
      if (activeTaskForTimer !== undefined) {
        setActiveTaskForTimer(undefined);
      }
    }
  }, [tasks, timerState?.activeTaskId, activeTaskForTimer]);

  // Central timer ticker loop
  useEffect(() => {
    if (!timerState?.isRunning) return;

    const interval = setInterval(() => {
      setTimerState((prev) => {
        if (!prev || !prev.isRunning) return prev;
        const next = reconcileAndTick(prev);
        if (next !== prev) {
          storageService.saveTimerState(next);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState?.isRunning, reconcileAndTick]);

  // Visibility change & window focus reconciliation
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        setTimerState((prev) => {
          if (!prev || !prev.isRunning) return prev;
          const next = reconcileAndTick(prev);
          if (next !== prev) {
            storageService.saveTimerState(next);
          }
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
    };
  }, [reconcileAndTick]);

  const handleSaveProfile = (newProfile: UserProfile) => {
    storageService.saveProfile(newProfile);
    setProfile(newProfile);
    showToast("Profile updated");
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveTask = (taskData: Omit<Task, "id" | "createdAt">, editingId?: string) => {
    if (editingId) {
      const updated = storageService.updateTask(editingId, taskData);
      if (updated) {
        setTasks(storageService.getTasks());
        showToast("Task updated successfully");
      }
    } else {
      storageService.addTask(taskData);
      setTasks(storageService.getTasks());
      showToast("New task added!");
    }
    setEditingTask(null);
  };

  const handleDeleteTaskPrompt = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    setDeleteConfirm({
      isOpen: true,
      type: "task",
      id: target.id,
      title: target.title,
    });
  };

  const handleConfirmDeleteTask = () => {
    const deletedTask = storageService.deleteTask(deleteConfirm.id);
    if (deletedTask) {
      setTasks(storageService.getTasks());
      showToast("Task deleted", "info", "Undo", () => {
        const restored: Task = { ...deletedTask };
        const currentTasks = storageService.getTasks();
        currentTasks.unshift(restored);
        storageService.saveTasks(currentTasks);
        setTasks(currentTasks);
        showToast("Task restored");
      });
    }
    setDeleteConfirm({ isOpen: false, type: "task", id: "", title: "" });
  };

  const handleSaveProject = (projectData: Omit<Project, "id" | "createdAt">, editingId?: string) => {
    if (editingId) {
      const updated = storageService.updateProject(editingId, projectData);
      if (updated) {
        setProjects(storageService.getProjects());
        showToast("Project updated");
      }
    } else {
      storageService.addProject(projectData);
      setProjects(storageService.getProjects());
      showToast("Project created!");
    }
    setEditingProject(null);
  };

  const handleDeleteProjectPrompt = (project: Project) => {
    const projectTasks = tasks.filter((t) => t.projectId === project.id);
    setDeleteConfirm({
      isOpen: true,
      type: "project",
      id: project.id,
      title: project.name,
      projectTaskCount: projectTasks.length,
    });
  };

  const handleConfirmDeleteProject = (action: "unassign" | "delete") => {
    storageService.deleteProject(deleteConfirm.id, action);
    setProjects(storageService.getProjects());
    setTasks(storageService.getTasks());
    showToast("Project deleted");
    setDeleteConfirm({ isOpen: false, type: "task", id: "", title: "" });
  };

  const handleSelectTaskForTimer = (task?: Task) => {
    setActiveTaskForTimer(task);
    setTimerState((prev) => {
      const base = prev || storageService.getTimerState();
      const updated = { ...base, activeTaskId: task?.id };
      storageService.saveTimerState(updated);
      return updated;
    });
  };

  const handleStartTimerForTask = (task: Task) => {
    handleSelectTaskForTimer(task);
    setCurrentView("timer");
    showToast(`Timer set for "${task.title}"`);
  };

  const handleSaveTimerState = (newState: TimerState) => {
    setTimerState(newState);
    storageService.saveTimerState(newState);
  };

  const handleExportData = () => {
    storageService.exportData();
    showToast("Workspace data exported", "success");
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
      showToast("Failed to read backup file", "error");
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
      setProfile(storageService.getProfile());
      showToast("Workspace restored successfully!", "success");
    } else {
      showToast(`Import failed: ${result.error}`, "error");
    }
    setImportConfirmFile(null);
    setImportConfirmRaw(null);
  };

  const handleNavigate = (view: ViewMode) => {
    setTaskProjectFilter("all");
    setCurrentView(view);
  };

  const defaultProjectId = currentView === "tasks" && taskProjectFilter !== "all" ? taskProjectFilter : undefined;

  const todayStr = getTodayDateString();
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr && !t.completed);

  return (
    <AppShell
      currentView={currentView}
      onNavigate={handleNavigate}
      onAddTask={() => {
        setEditingTask(null);
        setIsTaskFormOpen(true);
      }}
      todayTaskCount={todayTasks.length}
    >
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      <ConfirmDialog
        isOpen={Boolean(importConfirmFile && importConfirmRaw)}
        title="Restore Workspace Data?"
        message={`Are you sure you want to restore workspace data from "${importConfirmFile?.name || "backup"}"? This will replace your current tasks, projects, sessions, and timer state.`}
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
        title={deleteConfirm.type === "task" ? "Delete Task?" : "Delete Project?"}
        message={
          deleteConfirm.type === "task"
            ? `Are you sure you want to delete "${deleteConfirm.title}"? This can be undone.`
            : `Project "${deleteConfirm.title}" has ${deleteConfirm.projectTaskCount || 0} tasks attached. Choose what to do with these tasks.`
        }
        confirmLabel={deleteConfirm.type === "task" ? "Delete" : "Unassign Tasks & Delete"}
        danger
        onConfirm={() => {
          if (deleteConfirm.type === "task") {
            handleConfirmDeleteTask();
          } else {
            handleConfirmDeleteProject("unassign");
          }
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: "task", id: "", title: "" })}
      />

      {currentView === "overview" && (
        <OverviewDashboard
          profileName={profile.name}
          tasks={tasks}
          projects={projects}
          sessions={sessions}
          onNavigate={handleNavigate}
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
          onSelectProject={(projectId) => {
            setTaskProjectFilter(projectId);
            setCurrentView("tasks");
          }}
        />
      )}

      {currentView === "tasks" && (
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
            key={taskProjectFilter}
            tasks={tasks}
            projects={projects}
            onToggleComplete={handleToggleComplete}
            onEdit={(t) => {
              setEditingTask(t);
              setIsTaskFormOpen(true);
            }}
            onDelete={handleDeleteTaskPrompt}
            onStartTimer={handleStartTimerForTask}
            initialProjectId={taskProjectFilter}
          />
        </div>
      )}

      {currentView === "projects" && (
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
                onSelectProject={(projectId) => {
                  setTaskProjectFilter(projectId);
                  setCurrentView("tasks");
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

      {currentView === "timer" && (
        <PomodoroTimer
          tasks={tasks}
          projects={projects}
          sessions={sessions}
          activeTask={activeTaskForTimer}
          onSelectTask={handleSelectTaskForTimer}
          onToggleCompleteTask={handleToggleComplete}
          onSessionComplete={handleSessionComplete}
          savedTimerState={timerState}
          onSaveTimerState={handleSaveTimerState}
        />
      )}

      {currentView === "completed" && (
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

      {currentView === "settings" && (
        <SettingsView
          profile={profile}
          onSaveProfile={handleSaveProfile}
          onExportData={handleExportData}
          onImportData={handleSelectImportFile}
        />
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
        defaultProjectId={defaultProjectId}
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