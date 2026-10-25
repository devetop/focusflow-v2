import { useState, useCallback } from "react";
import type { Task, Project, ToastMessage } from "../types";

export function useAppHandlers() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
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

  const showToast = useCallback(
    (message: string, type: ToastMessage["type"] = "success", actionLabel?: string, onAction?: () => void) => {
      const newToast: ToastMessage = {
        id: Date.now().toString(),
        type,
        message,
        actionLabel,
        onAction,
      };
      setToasts((prev) => [newToast, ...prev]);
    },
    []
  );

  return {
    editingTask,
    setEditingTask,
    isTaskFormOpen,
    setIsTaskFormOpen,
    editingProject,
    setEditingProject,
    isProjectFormOpen,
    setIsProjectFormOpen,
    importConfirmFile,
    setImportConfirmFile,
    importConfirmRaw,
    setImportConfirmRaw,
    deleteConfirm,
    setDeleteConfirm,
    toasts,
    setToasts,
    showToast,
  };
}