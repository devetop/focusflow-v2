import { useState, useEffect, useCallback, useRef } from "react";
import type { Task, FocusSession, TimerState, TimerMode } from "../types";
import { storageService } from "../services/storage";
import { playChime } from "../utils/audio";
import { MODE_DURATIONS, reconcileAndTickState } from "../utils/timerUtils";

interface UseAppTimerProps {
  tasks: Task[];
  onSessionComplete: (session: Omit<FocusSession, "id" | "completedAt">) => void;
}

export function useAppTimer({ tasks, onSessionComplete }: UseAppTimerProps) {
  const [timerState, setTimerState] = useState<TimerState | undefined>();
  const [activeTaskForTimer, setActiveTaskForTimer] = useState<Task | undefined>();

  const activeTaskRef = useRef<Task | undefined>(activeTaskForTimer);
  useEffect(() => {
    activeTaskRef.current = activeTaskForTimer;
  }, [activeTaskForTimer]);

  const reconcileAndTick = useCallback(
    (currentState: TimerState): TimerState =>
      reconcileAndTickState(currentState, activeTaskRef.current, onSessionComplete),
    [onSessionComplete]
  );

  // Initial load and wall-clock reconciliation
  useEffect(() => {
    const loadedTasks = storageService.getTasks();
    const loadedTimer = storageService.getTimerState();

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

            onSessionComplete({
              taskId: initialActiveTask?.id,
              taskTitle: initialActiveTask?.title || "General Focus Session",
              durationMinutes: 25,
              mode: "focus",
            });

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
  }, [onSessionComplete]);

  // Sync active task for timer
  useEffect(() => {
    if (timerState?.activeTaskId) {
      const foundTask = tasks.find((t) => t.id === timerState.activeTaskId && !t.completed);
      if (foundTask) {
        if (activeTaskForTimer?.id !== foundTask.id) setActiveTaskForTimer(foundTask);
      } else {
        if (activeTaskForTimer !== undefined) setActiveTaskForTimer(undefined);
        setTimerState((prev) => {
          if (!prev || !prev.activeTaskId) return prev;
          const next = { ...prev, activeTaskId: undefined };
          storageService.saveTimerState(next);
          return next;
        });
      }
    } else if (activeTaskForTimer !== undefined) {
      setActiveTaskForTimer(undefined);
    }
  }, [tasks, timerState?.activeTaskId, activeTaskForTimer]);

  // Central timer ticker loop
  useEffect(() => {
    if (!timerState?.isRunning) return;
    const interval = setInterval(() => {
      setTimerState((prev) => {
        if (!prev || !prev.isRunning) return prev;
        const next = reconcileAndTick(prev);
        if (next !== prev) storageService.saveTimerState(next);
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
          if (next !== prev) storageService.saveTimerState(next);
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

  return { timerState, setTimerState, activeTaskForTimer, setActiveTaskForTimer };
}