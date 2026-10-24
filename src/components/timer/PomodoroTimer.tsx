import React, { useState } from "react";
import type { Task, Project, TimerMode, TimerState, FocusSession } from "../../types";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Check,
  Flame,
  Clock,
  Brain,
  ListTodo,
  VolumeX,
  CloudRain,
  Coffee,
  Wind,
  BellRing,
  RotateCw,
  History,
  CheckCircle2,
  Volume2,
} from "lucide-react";
import { Dropdown, type DropdownOption } from "../ui/Dropdown";
import { getTodayDateString } from "../../utils/date";

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

const MODE_LABELS: Record<TimerMode, string> = {
  focus: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

const MODE_TABS: { id: TimerMode; label: string }[] = [
  { id: "focus", label: "Focus (25m)" },
  { id: "shortBreak", label: "Short Break (5m)" },
  { id: "longBreak", label: "Long Break (15m)" },
];

const AMBIENCE = [
  { id: "mute", label: "Mute", icon: VolumeX },
  { id: "rain", label: "Rain", icon: CloudRain },
  { id: "cafe", label: "Cafe", icon: Coffee },
  { id: "noise", label: "White Noise", icon: Wind },
] as const;

const RING_RADIUS = 112;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

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

  const [ambience, setAmbience] = useState<(typeof AMBIENCE)[number]["id"]>("mute");

  const updateState = (updates: Partial<TimerState>) => {
    if (!onSaveTimerState) return;
    const current: TimerState = savedTimerState || {
      mode: "focus",
      timeLeft: MODE_DURATIONS.focus,
      isRunning: false,
      totalSessionsCompletedToday: 0,
    };
    onSaveTimerState({
      ...current,
      ...updates,
      activeTaskId: activeTask?.id,
    });
  };

  const switchMode = (newMode: TimerMode) => {
    updateState({
      mode: newMode,
      timeLeft: MODE_DURATIONS[newMode],
      isRunning: false,
      lastTickTimestamp: undefined,
    });
  };

  const toggleTimer = () => {
    const nextRunning = !isRunning;
    updateState({
      isRunning: nextRunning,
      lastTickTimestamp: nextRunning ? Date.now() : undefined,
    });
  };

  const resetTimer = () => {
    updateState({
      timeLeft: MODE_DURATIONS[mode],
      isRunning: false,
      lastTickTimestamp: undefined,
    });
  };

  const skipTimer = () => {
    const nextMode = mode === "focus" ? "shortBreak" : "focus";
    switchMode(nextMode);
  };

  const handleToggleChime = (val: boolean) => {
    updateState({ chime: val });
  };

  const handleToggleAutoStartRest = (val: boolean) => {
    updateState({ autoStartRest: val });
  };

  const markTaskDone = () => {
    if (!activeTask) return;
    onToggleCompleteTask(activeTask.id);
    onSelectTask(undefined);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatClock = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  const totalDuration = MODE_DURATIONS[mode];
  const cycleIndex = (sessionCount % 4) + 1;
  const untilLongBreak = 4 - (sessionCount % 4);
  const availableTasks = tasks.filter((t) => !t.completed);
  const taskLinkOptions: DropdownOption<string>[] = [
    { value: "", label: "No task" },
    ...availableTasks.map((t) => ({ value: t.id, label: t.title })),
  ];
  const project = projects.find((p) => p.id === activeTask?.projectId);

  const todayStr = getTodayDateString();
  const todaySessions = sessions.filter((s) => s.completedAt && s.completedAt.startsWith(todayStr));
  const focusSessions = todaySessions.filter((s) => s.mode === "focus");
  const focusMinutes = focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const tasksInFlow = new Set(focusSessions.map((s) => s.taskId).filter(Boolean)).size;

  const activeTaskSessions = activeTask
    ? focusSessions.filter((s) => s.taskId === activeTask.id).length
    : 0;
  const estimatedPomos = activeTask ? Math.max(1, Math.round(activeTask.estimatedMinutes / 25)) : 0;

  const metrics = [
    { label: "Time", value: `${focusMinutes}m`, caption: "Focus today", icon: Clock, tone: "text-[#7657D9]" },
    { label: "Pomos", value: String(focusSessions.length), caption: "Completed", icon: Brain, tone: "text-[#976247]" },
    { label: "Tasks", value: String(tasksInFlow), caption: "In flow", icon: ListTodo, tone: "text-[#6B4AB4]" },
  ];

  const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <div className="flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[11px] font-bold uppercase tracking-wider">
            <span className="text-[#9E98AB]">Workspace</span>
            <span className="text-[#D9D3CC]">/</span>
            <span className="text-[#7657D9]">Focus Timer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2538] tracking-tight">Focus Flow</h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#6D677D]">
          <span className="px-3 py-1.5 rounded-full bg-white border border-[#F0EDE8] shadow-xs flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#7657D9]" />
            Session #{cycleIndex} of 4
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white border border-[#F0EDE8] shadow-xs">
            {untilLongBreak === 4 ? "Long break after this" : `${untilLongBreak} pomos to long break`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* LEFT: Timer circle & controls */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-[#F0EDE8] shadow-xs p-6 sm:p-8 flex flex-col items-center">
            {/* Mode selector tabs */}
            <div className="flex items-center p-1.5 bg-[#F5F2EE] rounded-2xl mb-8 w-full max-w-md justify-between gap-1">
              {MODE_TABS.map((tab) => {
                const active = mode === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => switchMode(tab.id)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                      active ? "bg-white text-[#2A2538] shadow-xs" : "text-[#6D677D] hover:text-[#2A2538]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Circle graphic */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 256 256">
                <circle
                  cx="128"
                  cy="128"
                  r={RING_RADIUS}
                  className="stroke-[#F5F2EE]"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="128"
                  cy="128"
                  r={RING_RADIUS}
                  className="stroke-[#7657D9] transition-all duration-500 ease-linear"
                  strokeWidth="12"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl sm:text-5xl font-black text-[#2A2538] tracking-tight font-mono">
                  {formatTime(timeLeft)}
                </span>
                <span className="mt-2 px-3 py-1 rounded-full bg-[#E9DDFF] text-[#441F8D] text-xs font-extrabold uppercase tracking-wider">
                  {MODE_LABELS[mode]}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={resetTimer}
                className="w-11 h-11 rounded-full bg-[#F5F2EE] hover:bg-[#EAE5E0] text-[#6D677D] hover:text-[#2A2538] flex items-center justify-center transition-colors"
                aria-label="Reset timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={toggleTimer}
                className="w-16 h-16 rounded-2xl bg-[#5D3CBF] hover:bg-[#7657D9] text-white flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95"
                aria-label={isRunning ? "Pause timer" : "Start timer"}
              >
                {isRunning ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-0.5" />}
              </button>

              <button
                onClick={skipTimer}
                className="w-11 h-11 rounded-full bg-[#F5F2EE] hover:bg-[#EAE5E0] text-[#6D677D] hover:text-[#2A2538] flex items-center justify-center transition-colors"
                aria-label="Skip to next session"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active task link card */}
          <div className="bg-white rounded-3xl border border-[#F0EDE8] shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <button
                onClick={markTaskDone}
                disabled={!activeTask}
                className="mt-0.5 w-6 h-6 rounded-lg bg-[#F5F2EE] hover:bg-[#E9DDFF] text-[#7657D9] flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Mark task complete"
              >
                <Check className="w-4 h-4" />
              </button>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-[#9E98AB]">
                    Working on
                  </span>
                  {project && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E9DDFF] text-[#441F8D] text-[11px] font-bold">
                      {project.name}
                    </span>
                  )}
                </div>
                <p className="text-base font-bold text-[#2A2538] truncate">
                  {activeTask ? activeTask.title : "General Focus Session"}
                </p>
                <span className="text-xs text-[#6D677D] flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  {activeTask
                    ? `Estimated: ${estimatedPomos} pomodoro${estimatedPomos === 1 ? "" : "s"} (${activeTaskSessions} completed)`
                    : "No task linked to this session"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-shrink-0">
              <div className="w-full md:w-52">
                <Dropdown
                  value={activeTask?.id || ""}
                  onChange={(id) => onSelectTask(tasks.find((t) => t.id === id))}
                  options={taskLinkOptions}
                  ariaLabel="Link Focus Session To Task"
                  fullWidth
                />
              </div>
              <button
                onClick={markTaskDone}
                disabled={!activeTask}
                className="px-4 py-2 rounded-full bg-[#5D3CBF] hover:bg-[#7657D9] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Metrics, sound, flow log */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-3">
            {metrics.map(({ label, value, caption, icon: Icon, tone }) => (
              <div
                key={label}
                className="bg-white rounded-2xl border border-[#F0EDE8] shadow-xs p-3.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#9E98AB] uppercase tracking-wide">{label}</span>
                  <Icon className={`w-4 h-4 ${tone}`} />
                </div>
                <div>
                  <span className="text-xl font-extrabold text-[#2A2538]">{value}</span>
                  <p className="text-[11px] text-[#6D677D] leading-tight">{caption}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Sound & Space */}
          <div className="bg-white rounded-3xl border border-[#F0EDE8] shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-[#7657D9]" />
                <h2 className="text-base font-bold text-[#2A2538]">Sound &amp; Space</h2>
              </div>
              <span className="text-[11px] font-bold text-[#9E98AB]">Ambient FX</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {AMBIENCE.map(({ id, label, icon: Icon }) => {
                const active = ambience === id;
                return (
                  <button
                    key={id}
                    onClick={() => setAmbience(id)}
                    aria-pressed={active}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-[11px] font-bold transition-colors ${
                      active
                        ? "bg-[#E9DDFF] text-[#441F8D]"
                        : "bg-[#F5F2EE] text-[#6D677D] hover:text-[#2A2538] hover:bg-[#EAE5E0]"
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BellRing className="w-4 h-4 text-[#6D677D]" />
                  <span className="text-sm text-[#2A2538]">Bell chime at session end</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={chime}
                    onChange={(e) => handleToggleChime(e.target.checked)}
                    aria-label="Bell chime at session end"
                  />
                  <span className="w-10 h-6 bg-[#EAE5E0] rounded-full transition-colors peer-checked:bg-[#7657D9] peer-focus-visible:ring-2 peer-focus-visible:ring-[#7657D9]/30 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <RotateCw className="w-4 h-4 text-[#6D677D]" />
                  <span className="text-sm text-[#2A2538]">Auto-start rest intervals</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={autoStartRest}
                    onChange={(e) => handleToggleAutoStartRest(e.target.checked)}
                    aria-label="Auto-start rest intervals"
                  />
                  <span className="w-10 h-6 bg-[#EAE5E0] rounded-full transition-colors peer-checked:bg-[#7657D9] peer-focus-visible:ring-2 peer-focus-visible:ring-[#7657D9]/30 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>
            </div>
          </div>

          {/* Flow log */}
          <div className="bg-white rounded-3xl border border-[#F0EDE8] shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#7657D9]" />
                <h2 className="text-base font-bold text-[#2A2538]">Today's Flow Log</h2>
              </div>
              <span className="text-[11px] font-bold text-[#9E98AB]">{todaySessions.length} logged</span>
            </div>

            {todaySessions.length === 0 ? (
              <p className="py-6 text-center text-xs font-medium text-[#9E98AB]">
                No sessions logged yet today. Start a focus block to fill your log.
              </p>
            ) : (
              <div className="relative space-y-3.5 before:absolute before:left-3 before:top-2 before:bottom-3 before:w-0.5 before:bg-[#F0EDE8]">
                {todaySessions.slice(0, 5).map((s) => {
                  const start = new Date(new Date(s.completedAt).getTime() - s.durationMinutes * 60000);
                  return (
                    <div key={s.id} className="relative flex items-start gap-3 pl-1">
                      <span
                        className={`w-4 h-4 rounded-full flex-shrink-0 mt-1 ring-4 ring-white ${
                          s.mode === "focus" ? "bg-[#7657D9]" : "bg-[#D1BCFF]"
                        }`}
                      />
                      <div className="bg-[#FCFAF8] rounded-xl p-2.5 flex-1 flex items-center justify-between gap-2 min-w-0">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#2A2538] truncate">
                            {s.taskTitle || "General Focus Session"}
                          </p>
                          <span className="text-[11px] text-[#9E98AB]">
                            {formatClock(start.toISOString())} - {formatClock(s.completedAt)} •{" "}
                            {s.durationMinutes}m {MODE_LABELS[s.mode]}
                          </span>
                        </div>
                        {s.mode === "focus" ? (
                          <CheckCircle2 className="w-4 h-4 text-[#7657D9] flex-shrink-0" />
                        ) : (
                          <Coffee className="w-4 h-4 text-[#6B4AB4] flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};