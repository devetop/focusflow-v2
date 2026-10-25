import React from "react";
import type { Task, Project, TimerMode, TimerState, FocusSession } from "../../types";
import { Flame, Clock, Brain, ListTodo } from "lucide-react";
import type { DropdownOption } from "../ui/Dropdown";
import { getTodayDateString } from "../../utils/date";
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
  const sessionCount = savedTimerState?.totalSessionsCompletedToday ?? 0;
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

  const todayStr = getTodayDateString();
  const todaySessions = sessions.filter((s) => s.completedAt && s.completedAt.startsWith(todayStr));

  const totalFocusMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const metrics: MetricCard[] = [
    { label: "Daily Target", value: `${sessionCount}/8`, caption: "Sessions done today", icon: Flame, tone: "text-[#7657D9]" },
    { label: "Focus Time", value: `${totalFocusMinutes}m`, caption: "Deep work minutes", icon: Clock, tone: "text-[#7CD4B0]" },
    { label: "Focus Level", value: "High", caption: "92% flow efficiency", icon: Brain, tone: "text-[#F4D06F]" },
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
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#F0EDE8] shadow-2xs self-start sm:self-auto">
          <ListTodo className="w-4 h-4 text-[#7657D9]" />
          <span className="text-xs font-bold text-[#2A2538]">
            {activeTask ? `Linked: ${activeTask.title}` : "No task linked"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 flex flex-col gap-6">
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
          <TimerTaskLinker
            activeTask={activeTask}
            project={project}
            tasks={tasks}
            taskLinkOptions={taskLinkOptions}
            onSelectTask={onSelectTask}
            onMarkTaskDone={markTaskDone}
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