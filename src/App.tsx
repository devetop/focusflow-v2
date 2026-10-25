import { useState, useEffect, useCallback } from "react";
import type { Task, Project, FocusSession, ViewMode, UserProfile } from "./types";
import { storageService } from "./services/storage";
import { getTodayDateString } from "./utils/date";
import { AppShell } from "./components/layout/AppShell";
import { Toast } from "./components/layout/Toast";
import { AppModalsAndViews } from "./components/layout/AppModalsAndViews";
import { useAppTimer } from "./hooks/useAppTimer";
import { useAppHandlers } from "./hooks/useAppHandlers";

export function App() {
  const [currentView, setCurrentView] = useState<ViewMode>("overview");
  const [taskProjectFilter, setTaskProjectFilter] = useState<string>("all");
  const [profile, setProfile] = useState<UserProfile>({ name: "Alex" });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);

  const {
    editingTask, setEditingTask, isTaskFormOpen, setIsTaskFormOpen,
    editingProject, setEditingProject, isProjectFormOpen, setIsProjectFormOpen,
    importConfirmFile, setImportConfirmFile, importConfirmRaw, setImportConfirmRaw,
    deleteConfirm, setDeleteConfirm, toasts, setToasts, showToast,
  } = useAppHandlers();

  const handleToggleComplete = useCallback((id: string) => {
    const currentTasks = storageService.getTasks();
    const target = currentTasks.find((t) => t.id === id);
    if (!target) return;
    const newCompletedState = !target.completed;
    storageService.updateTask(id, { completed: newCompletedState });
    setTasks(storageService.getTasks());
    if (newCompletedState) showToast(`Completed "${target.title}"! 🎉`, "success");
  }, [showToast]);

  const handleSessionComplete = useCallback((session: Omit<FocusSession, "id" | "completedAt">) => {
    storageService.addSession(session);
    setSessions(storageService.getSessions());
    showToast(`Focus session recorded! Great job! ⏱️`);
    if (session.taskId) {
      const linkedTask = storageService.getTasks().find((t) => t.id === session.taskId);
      if (linkedTask && !linkedTask.completed) {
        showToast(`Mark "${linkedTask.title}" as done?`, "info", "Mark Complete", () => handleToggleComplete(linkedTask.id));
      }
    }
  }, [showToast, handleToggleComplete]);

  const { timerState, setTimerState, activeTaskForTimer, setActiveTaskForTimer } = useAppTimer({ tasks, onSessionComplete: handleSessionComplete });

  useEffect(() => {
    setTasks(storageService.getTasks());
    setProjects(storageService.getProjects());
    setSessions(storageService.getSessions());
    setProfile(storageService.getProfile());
  }, []);

  const handleSaveProfile = (newProfile: UserProfile) => {
    storageService.saveProfile(newProfile);
    setProfile(newProfile);
    showToast("Profile updated");
  };

  const handleSaveTask = (taskData: Omit<Task, "id" | "createdAt">, editingId?: string) => {
    if (editingId) {
      if (storageService.updateTask(editingId, taskData)) { setTasks(storageService.getTasks()); showToast("Task updated successfully"); }
    } else {
      storageService.addTask(taskData);
      setTasks(storageService.getTasks());
      showToast("New task added!");
    }
    setEditingTask(null);
  };

  const handleConfirmDeleteTask = () => {
    const deletedTask = storageService.deleteTask(deleteConfirm.id);
    if (deletedTask) {
      setTasks(storageService.getTasks());
      showToast("Task deleted", "info", "Undo", () => {
        const restored = { ...deletedTask };
        const current = storageService.getTasks();
        current.unshift(restored);
        storageService.saveTasks(current);
        setTasks(current);
        showToast("Task restored");
      });
    }
    setDeleteConfirm({ isOpen: false, type: "task", id: "", title: "" });
  };

  const handleSaveProject = (projectData: Omit<Project, "id" | "createdAt">, editingId?: string) => {
    if (editingId) {
      if (storageService.updateProject(editingId, projectData)) { setProjects(storageService.getProjects()); showToast("Project updated"); }
    } else {
      storageService.addProject(projectData);
      setProjects(storageService.getProjects());
      showToast("Project created!");
    }
    setEditingProject(null);
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
      const updated = { ...(prev || storageService.getTimerState()), activeTaskId: task?.id };
      storageService.saveTimerState(updated);
      return updated;
    });
  };

  const handleSelectImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) { setImportConfirmFile(file); setImportConfirmRaw(e.target.result as string); }
    };
    reader.onerror = () => showToast("Failed to read backup file", "error");
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
    } else showToast(`Import failed: ${result.error}`, "error");
    setImportConfirmFile(null);
    setImportConfirmRaw(null);
  };

  const handleNavigate = (view: ViewMode) => { setTaskProjectFilter("all"); setCurrentView(view); };

  const defaultProjectId = currentView === "tasks" && taskProjectFilter !== "all" ? taskProjectFilter : undefined;
  const todayTasks = tasks.filter((t) => t.dueDate === getTodayDateString() && !t.completed);

  return (
    <AppShell currentView={currentView} onNavigate={handleNavigate} onAddTask={() => { setEditingTask(null); setIsTaskFormOpen(true); }} todayTaskCount={todayTasks.length}>
      <Toast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      <AppModalsAndViews
        currentView={currentView} profile={profile} tasks={tasks} projects={projects} sessions={sessions}
        timerState={timerState} activeTaskForTimer={activeTaskForTimer} taskProjectFilter={taskProjectFilter}
        defaultProjectId={defaultProjectId} isTaskFormOpen={isTaskFormOpen} editingTask={editingTask}
        isProjectFormOpen={isProjectFormOpen} editingProject={editingProject} importConfirmFile={importConfirmFile}
        importConfirmRaw={importConfirmRaw} deleteConfirm={deleteConfirm} onNavigate={handleNavigate}
        onAddTask={() => { setEditingTask(null); setIsTaskFormOpen(true); }}
        onAddProject={() => { setEditingProject(null); setIsProjectFormOpen(true); }}
        onToggleComplete={handleToggleComplete}
        onEditTask={(t) => { setEditingTask(t); setIsTaskFormOpen(true); }}
        onDeleteTaskPrompt={(id) => { const target = tasks.find((t) => t.id === id); if (target) setDeleteConfirm({ isOpen: true, type: "task", id: target.id, title: target.title }); }}
        onConfirmDeleteTask={handleConfirmDeleteTask}
        onStartTimerForTask={(t) => { handleSelectTaskForTimer(t); setCurrentView("timer"); showToast(`Timer set for "${t.title}"`); }}
        onEditProject={(p) => { setEditingProject(p); setIsProjectFormOpen(true); }}
        onDeleteProjectPrompt={(p) => setDeleteConfirm({ isOpen: true, type: "project", id: p.id, title: p.name, projectTaskCount: tasks.filter((t) => t.projectId === p.id).length })}
        onConfirmDeleteProject={handleConfirmDeleteProject}
        onSelectProject={(id) => { setTaskProjectFilter(id); setCurrentView("tasks"); }}
        onSelectTaskForTimer={handleSelectTaskForTimer} onSessionComplete={handleSessionComplete}
        onSaveTimerState={(s) => { setTimerState(s); storageService.saveTimerState(s); }}
        onSaveProfile={handleSaveProfile} onExportData={() => { storageService.exportData(); showToast("Workspace data exported", "success"); }}
        onSelectImportFile={handleSelectImportFile} onConfirmImport={handleConfirmImport}
        onCancelImport={() => { setImportConfirmFile(null); setImportConfirmRaw(null); }}
        onCloseTaskForm={() => { setIsTaskFormOpen(false); setEditingTask(null); }} onSaveTask={handleSaveTask}
        onCloseProjectForm={() => { setIsProjectFormOpen(false); setEditingProject(null); }} onSaveProject={handleSaveProject}
        onCancelDeleteConfirm={() => setDeleteConfirm({ isOpen: false, type: "task", id: "", title: "" })}
      />
    </AppShell>
  );
}

export default App;