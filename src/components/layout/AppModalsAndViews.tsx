import React from "react";
import type { Task, Project, FocusSession, TimerState, ViewMode, UserProfile } from "../../types";
import { PageHeader } from "./PageHeader";
import { ConfirmDialog } from "./ConfirmDialog";
import { OverviewDashboard } from "../overview/OverviewDashboard";
import { TaskList } from "../tasks/TaskList";
import { TaskForm } from "../tasks/TaskForm";
import { ProjectCard } from "../projects/ProjectCard";
import { ProjectForm } from "../projects/ProjectForm";
import { PomodoroTimer } from "../timer/PomodoroTimer";
import { SettingsView } from "../settings/SettingsView";
import { Plus } from "lucide-react";

interface AppModalsAndViewsProps {
  currentView: ViewMode;
  profile: UserProfile;
  tasks: Task[];
  projects: Project[];
  sessions: FocusSession[];
  timerState?: TimerState;
  activeTaskForTimer?: Task;
  taskProjectFilter: string;
  defaultProjectId?: string;
  isTaskFormOpen: boolean;
  editingTask: Task | null;
  isProjectFormOpen: boolean;
  editingProject: Project | null;
  importConfirmFile: File | null;
  importConfirmRaw: string | null;
  deleteConfirm: {
    isOpen: boolean;
    type: "task" | "project";
    id: string;
    title: string;
    projectTaskCount?: number;
  };
  onNavigate: (view: ViewMode) => void;
  onAddTask: () => void;
  onAddProject: () => void;
  onToggleComplete: (id: string) => void;
  onEditTask: (t: Task) => void;
  onDeleteTaskPrompt: (id: string) => void;
  onConfirmDeleteTask: () => void;
  onStartTimerForTask: (task: Task) => void;
  onEditProject: (p: Project) => void;
  onDeleteProjectPrompt: (project: Project) => void;
  onConfirmDeleteProject: (action: "unassign" | "delete") => void;
  onSelectProject: (projectId: string) => void;
  onSelectTaskForTimer: (task?: Task) => void;
  onSessionComplete: (session: Omit<FocusSession, "id" | "completedAt">) => void;
  onSaveTimerState: (newState: TimerState) => void;
  onSaveProfile: (profile: UserProfile) => void;
  onExportData: () => void;
  onSelectImportFile: (file: File) => void;
  onConfirmImport: () => void;
  onCancelImport: () => void;
  onCloseTaskForm: () => void;
  onSaveTask: (taskData: Omit<Task, "id" | "createdAt">, editingId?: string) => void;
  onCloseProjectForm: () => void;
  onSaveProject: (projectData: Omit<Project, "id" | "createdAt">, editingId?: string) => void;
  onCancelDeleteConfirm: () => void;
}

export const AppModalsAndViews: React.FC<AppModalsAndViewsProps> = ({
  currentView, profile, tasks, projects, sessions, timerState, activeTaskForTimer,
  taskProjectFilter, defaultProjectId, isTaskFormOpen, editingTask, isProjectFormOpen,
  editingProject, importConfirmFile, importConfirmRaw, deleteConfirm, onNavigate,
  onAddTask, onAddProject, onToggleComplete, onEditTask, onDeleteTaskPrompt,
  onConfirmDeleteTask, onStartTimerForTask, onEditProject, onDeleteProjectPrompt,
  onConfirmDeleteProject, onSelectProject, onSelectTaskForTimer, onSessionComplete,
  onSaveTimerState, onSaveProfile, onExportData, onSelectImportFile, onConfirmImport,
  onCancelImport, onCloseTaskForm, onSaveTask, onCloseProjectForm, onSaveProject,
  onCancelDeleteConfirm,
}) => {
  return (
    <>
      <ConfirmDialog
        isOpen={Boolean(importConfirmFile && importConfirmRaw)}
        title="Restore Workspace Data?"
        message={`Are you sure you want to restore workspace data from "${importConfirmFile?.name || "backup"}"? This will replace your current tasks, projects, sessions, and timer state.`}
        confirmLabel="Confirm & Restore"
        cancelLabel="Cancel"
        danger={true}
        onConfirm={onConfirmImport}
        onCancel={onCancelImport}
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
            onConfirmDeleteTask();
          } else {
            onConfirmDeleteProject("unassign");
          }
        }}
        onCancel={onCancelDeleteConfirm}
      />

      {currentView === "overview" && (
        <OverviewDashboard
          profileName={profile.name} tasks={tasks} projects={projects} sessions={sessions}
          onNavigate={onNavigate} onAddTask={onAddTask} onToggleComplete={onToggleComplete}
          onEditTask={onEditTask} onDeleteTask={onDeleteTaskPrompt} onStartTimer={onStartTimerForTask}
          onEditProject={onEditProject} onDeleteProject={onDeleteProjectPrompt} onSelectProject={onSelectProject}
        />
      )}

      {currentView === "tasks" && (
        <div>
          <PageHeader title="My Tasks" subtitle="Manage your to-do items, organize by priority, and track progress." onAddTask={onAddTask} />
          <TaskList
            key={taskProjectFilter} tasks={tasks} projects={projects} onToggleComplete={onToggleComplete}
            onEdit={onEditTask} onDelete={onDeleteTaskPrompt} onStartTimer={onStartTimerForTask} initialProjectId={taskProjectFilter}
          />
        </div>
      )}

      {currentView === "projects" && (
        <div>
          <PageHeader title="Projects" subtitle="Group tasks into focused projects to keep your goals organized." onAddTask={onAddProject} actionButtonLabel="Add Project" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <ProjectCard key={proj.id} project={proj} tasks={tasks} onEdit={onEditProject} onDelete={onDeleteProjectPrompt} onSelectProject={onSelectProject} />
            ))}
            <button
              onClick={onAddProject}
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
          tasks={tasks} projects={projects} sessions={sessions} activeTask={activeTaskForTimer}
          onSelectTask={onSelectTaskForTimer} onToggleCompleteTask={onToggleComplete}
          onSessionComplete={onSessionComplete} savedTimerState={timerState} onSaveTimerState={onSaveTimerState}
        />
      )}

      {currentView === "completed" && (
        <div>
          <PageHeader title="Completed Tasks" subtitle="A log of all your finished accomplishments." />
          <TaskList
            tasks={tasks} projects={projects} onToggleComplete={onToggleComplete} onEdit={onEditTask}
            onDelete={onDeleteTaskPrompt} onStartTimer={onStartTimerForTask} initialTab="completed"
          />
        </div>
      )}

      {currentView === "settings" && (
        <SettingsView profile={profile} onSaveProfile={onSaveProfile} onExportData={onExportData} onImportData={onSelectImportFile} />
      )}

      <TaskForm
        isOpen={isTaskFormOpen} onClose={onCloseTaskForm} onSubmit={onSaveTask} projects={projects}
        editingTask={editingTask} defaultProjectId={defaultProjectId}
      />

      <ProjectForm isOpen={isProjectFormOpen} onClose={onCloseProjectForm} onSubmit={onSaveProject} editingProject={editingProject} />
    </>
  );
};