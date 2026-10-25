import React from "react";
import type { Task, Project, TimerMode, TimerState, FocusSession } from "../../types";
import { Clock, Brain, ListTodo, Flame } from "lucide-react";
import type { DropdownOption } from "../ui/Dropdown";
import { getLocalDateString } from "../../utils/date";
import { TimerDisplay } from "./TimerDisplay";
import { TimerTaskLinker } from "./TimerTaskLinker";
import { TimerSoundLog, type MetricCard } from "./TimerSoundLog";

interface PomodoroTimerProps {
  tasks: Task[];
  projects: Project[];
  sessions: FocusSession[];
  activeTask?: Task;
  onSelectTask: (task?: Task) => void;
  onToggleCompleteTask: (id: string) => void;
  onSessionComplete: (session: Omit<FocusSession, "id" | "completedAt">) => void;
  savedTimerState?: TimerState;
  onSaveTimerState?: (state: TimerState) => void;
}

const MODE_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

function computeStreak(sessions: FocusSession[], currentDate: Date = new Date()): number {
  const dayKeys = new Set(
    sessions
      .filter((s) => s.completedAt)
      .map((s) => getLocalDateString(new Date(s.completedAt)))
  );

  const todayKey = getLocalDateString(currentDate);
  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getLocalDateString(yesterday);

  let cursor: Date | null = null;
  if (dayKeys.has(todayKey)) {
    cursor = new Date(currentDate);
  } else if (dayKeys.has(yesterdayKey)) {
    cursor = yesterday;
  }

  let streak = 0;
  if (cursor) {
    while (dayKeys.has(getLocalDateString(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  }
  return streak;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  tasks,
  projects,
  sessions,
  activeTask,
  onSelectTask,
  onToggleCompleteTask,
  savedTimerState,
  onSaveTimerState,
}) => {
  const mode = savedTimerState?.mode || "focus";
  const timeLeft = savedTimerState?.timeLeft ?? MODE_DURATIONS.focus;
  const isRunning = savedTimerState?.isRunning ?? false;
  const chime = savedTimerState?.chime ?? true;
  const autoStartRest = savedTimerState?.autoStartRest ?? false;

  const updateState = (updates: Partial<TimerState>) => {
    if (!onSaveTimerState) return;
    const current: TimerState = savedTimerState || {
      mode: "focus",
      timeLeft: MODE_DURATIONS.focus,
      isRunning: false,
      totalSessionsCompletedToday: 0,
    };
    onSaveTimerState({ ...current, ...updates, activeTaskId: activeTask?.id });
  };

  const handleSwitchMode = (newMode: TimerMode) => {
    updateState({ mode: newMode, timeLeft: MODE_DURATIONS[newMode], isRunning: false, lastTickTimestamp: undefined });
  };

  const handleToggleTimer = () => {
    const nextRunning = !isRunning;
    updateState({ isRunning: nextRunning, lastTickTimestamp: nextRunning ? Date.now() : undefined });
  };

  const handleResetTimer = () => {
    updateState({ timeLeft: MODE_DURATIONS[mode], isRunning: false, lastTickTimestamp: undefined });
  };

  const handleSkipSession = () => {
    const nextMode: TimerMode = mode === "focus" ? "shortBreak" : "focus";
    updateState({ mode: nextMode, timeLeft: MODE_DURATIONS[nextMode], isRunning: false, lastTickTimestamp: undefined });
  };

  const handleToggleChime = (val: boolean) => updateState({ chime: val });
  const handleToggleAutoStartRest = (val: boolean) => updateState({ autoStartRest: val });

  const project = activeTask?.projectId ? projects.find((p) => p.id === activeTask.projectId) : undefined;
  const openTasks = tasks.filter((t) => !t.completed);

  const taskLinkOptions: DropdownOption<string>[] = [
    { value: "", label: "Unlinked Focus Block" },
    ...openTasks.map((t) => ({ value: t.id, label: t.title })),
  ];

  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    const handleReconcile = () => {
      if (document.visibilityState === "visible") {
        setNow(new Date());
      }
    };
    document.addEventListener("visibilitychange", handleReconcile);
    window.addEventListener("focus", handleReconcile);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleReconcile);
      window.removeEventListener("focus", handleReconcile);
    };
  }, []);

  const todayStr = getLocalDateString(now);
  const todaySessions = sessions.filter(
    (s) => s.completedAt && getLocalDateString(new Date(s.completedAt)) === todayStr
  );
  const focusSessions = todaySessions.filter((s) => s.mode === "focus");
  const focusMinutes = focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const elapsedMinutes =
    mode === "focus" && isRunning
      ? Math.max(0, Math.floor((MODE_DURATIONS.focus - timeLeft) / 60))
      : 0;
  const liveFocusMinutes = focusMinutes + elapsedMinutes;

  const tasksInFlow = new Set(focusSessions.map((s) => s.taskId).filter(Boolean)).size;

  const streak = computeStreak(sessions, now);

  const metrics: MetricCard[] = [
    { label: "Time", value: `${liveFocusMinutes}m`, caption: "Focus today", icon: Clock, tone: "text-[#7657D9]" },
    { label: "Pomos", value: String(focusSessions.length), caption: "Completed", icon: Brain, tone: "text-[#976247]" },
    { label: "Tasks", value: String(tasksInFlow), caption: "In flow", icon: ListTodo, tone: "text-[#6B4AB4]" },
  ];

  const markTaskDone = () => {
    if (activeTask) {
      onToggleCompleteTask(activeTask.id);
      onSelectTask(undefined);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#7657D9]">Focus &amp; Flow State</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2538] tracking-tight mt-0.5">Pomodoro Timer</h1>
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#F0EDE8] px-4 py-2.5 rounded-full shadow-xs self-start md:self-auto">
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span
              className={`absolute inline-flex h-full w-full rounded-full bg-[#9B7AE8] ${
                isRunning ? 'animate-ping opacity-75' : 'opacity-0'
              }`}
            />
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                isRunning ? 'bg-[#7657D9]' : 'bg-[#D9D3CC]'
              }`}
            />
          </span>
          <span className="text-xs font-bold text-[#2A2538]">
            {isRunning ? 'Flow Mode Active' : 'Flow Paused'}
          </span>
          <span className="text-[#D9D3CC] text-xs">|</span>
          <span className="flex items-center gap-1.5 text-[#7657D9] text-xs font-bold">
            <Flame className="w-3.5 h-3.5 fill-current" />
            {streak} Streak
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <TimerTaskLinker
            activeTask={activeTask}
            project={project}
            tasks={tasks}
            taskLinkOptions={taskLinkOptions}
            onSelectTask={onSelectTask}
            onMarkTaskDone={markTaskDone}
          />
          <TimerDisplay
            mode={mode}
            timeLeft={timeLeft}
            isRunning={isRunning}
            savedTimerState={savedTimerState}
            onSwitchMode={handleSwitchMode}
            onToggleTimer={handleToggleTimer}
            onResetTimer={handleResetTimer}
            onSkipSession={handleSkipSession}
          />
        </div>

        <TimerSoundLog
          metrics={metrics}
          chime={chime}
          autoStartRest={autoStartRest}
          todaySessions={todaySessions}
          onToggleChime={handleToggleChime}
          onToggleAutoStartRest={handleToggleAutoStartRest}
        />
      </div>
    </div>
  );
};