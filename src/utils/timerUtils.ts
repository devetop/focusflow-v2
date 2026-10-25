import type { Task, FocusSession, TimerState, TimerMode } from "../types";
import { playChime } from "./audio";

export const MODE_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export function reconcileAndTickState(
  currentState: TimerState,
  activeTask: Task | undefined,
  onSessionComplete: (session: Omit<FocusSession, "id" | "completedAt">) => void
): TimerState {
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

  if (currentState.chime !== false) {
    playChime();
  }

  if (currentState.mode === "focus") {
    onSessionComplete({
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
  }

  return {
    ...currentState,
    mode: "focus",
    timeLeft: MODE_DURATIONS.focus,
    isRunning: false,
    lastTickTimestamp: undefined,
  };
}