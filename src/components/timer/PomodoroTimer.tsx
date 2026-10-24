import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Task, Project, TimerMode, TimerState, FocusSession } from '../../types';
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
} from 'lucide-react';
import { Select } from '../ui/Select';
import { getTodayDateString } from '../../utils/date';

interface PomodoroTimerProps {
  tasks: Task[];
  projects: Project[];
  sessions: FocusSession[];
  activeTask?: Task;
  onSelectTask: (task?: Task) => void;
  onToggleCompleteTask: (id: string) => void;
  onSessionComplete: (session: Omit<FocusSession, 'id' | 'completedAt'>) => void;
  savedTimerState?: TimerState;
  onSaveTimerState?: (state: TimerState) => void;
}

const MODE_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

const MODE_TABS: { id: TimerMode; label: string }[] = [
  { id: 'focus', label: 'Focus (25m)' },
  { id: 'shortBreak', label: 'Short Break (5m)' },
  { id: 'longBreak', label: 'Long Break (15m)' },
];

// ponytail: ambience is selection-only — real playback needs audio assets, add when sound files ship.
const AMBIENCE = [
  { id: 'mute', label: 'Mute', icon: VolumeX },
  { id: 'rain', label: 'Rain', icon: CloudRain },
  { id: 'cafe', label: 'Cafe', icon: Coffee },
  { id: 'noise', label: 'White Noise', icon: Wind },
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
  onSessionComplete,
  savedTimerState,
  onSaveTimerState,
}) => {
  const [mode, setMode] = useState<TimerMode>(savedTimerState?.mode || 'focus');
  const [timeLeft, setTimeLeft] = useState<number>(savedTimerState?.timeLeft || MODE_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionCount, setSessionCount] = useState<number>(savedTimerState?.totalSessionsCompletedToday || 0);
  const [ambience, setAmbience] = useState<(typeof AMBIENCE)[number]['id']>('mute');
  const [chime, setChime] = useState(true);
  const [autoStartRest, setAutoStartRest] = useState(false);

  const lastTickRef = useRef<number | null>(null);

  // Audio tone notification using Web Audio API
  const playCompletionSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }, []);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
    setIsRunning(false);
  }, []);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    if (chime) playCompletionSound();

    if (mode === 'focus') {
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);

      onSessionComplete({
        taskId: activeTask?.id,
        taskTitle: activeTask?.title || 'General Focus Session',
        durationMinutes: 25,
        mode: 'focus',
      });

      const nextMode: TimerMode = newSessionCount % 4 === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      setTimeLeft(MODE_DURATIONS[nextMode]);
      if (autoStartRest) setIsRunning(true);
    } else {
      switchMode('focus');
    }
  }, [mode, sessionCount, activeTask, onSessionComplete, playCompletionSound, switchMode, chime, autoStartRest]);

  // Timestamp-based delta timer for accuracy in inactive tabs
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning) {
      lastTickRef.current = Date.now();
      interval = setInterval(() => {
        const now = Date.now();
        const deltaSeconds = Math.round((now - (lastTickRef.current || now)) / 1000);
        lastTickRef.current = now;

        setTimeLeft((prev) => {
          const next = prev - (deltaSeconds > 0 ? deltaSeconds : 1);
          if (next <= 0) {
            handleTimerComplete();
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      lastTickRef.current = null;
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode, handleTimerComplete]);

  // Save state
  useEffect(() => {
    if (onSaveTimerState) {
      onSaveTimerState({
        mode,
        timeLeft,
        isRunning,
        totalSessionsCompletedToday: sessionCount,
        activeTaskId: activeTask?.id,
        lastTickTimestamp: isRunning ? Date.now() : undefined,
      });
    }
  }, [mode, timeLeft, isRunning, sessionCount, activeTask, onSaveTimerState]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const skipTimer = () => switchMode(mode === 'focus' ? 'shortBreak' : 'focus');

  const markTaskDone = () => {
    if (!activeTask) return;
    onToggleCompleteTask(activeTask.id);
    onSelectTask(undefined);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatClock = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const totalDuration = MODE_DURATIONS[mode];
  const cycleIndex = (sessionCount % 4) + 1;
  const untilLongBreak = 4 - (sessionCount % 4);
  const availableTasks = tasks.filter((t) => !t.completed);
  const project = projects.find((p) => p.id === activeTask?.projectId);

  const todayStr = getTodayDateString();
  const todaySessions = sessions.filter((s) => s.completedAt && s.completedAt.startsWith(todayStr));
  const focusSessions = todaySessions.filter((s) => s.mode === 'focus');
  const focusMinutes = focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const tasksInFlow = new Set(focusSessions.map((s) => s.taskId).filter(Boolean)).size;

  const activeTaskSessions = activeTask
    ? focusSessions.filter((s) => s.taskId === activeTask.id).length
    : 0;
  const estimatedPomos = activeTask ? Math.max(1, Math.round(activeTask.estimatedMinutes / 25)) : 0;

  // Consecutive days with at least one logged session, counting back from today.
  const dayKeys = new Set(sessions.map((s) => s.completedAt.slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  while (dayKeys.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const metrics = [
    { label: 'Time', value: `${focusMinutes}m`, caption: 'Focus today', icon: Clock, tone: 'text-[#7657D9]' },
    { label: 'Pomos', value: String(focusSessions.length), caption: 'Completed', icon: Brain, tone: 'text-[#976247]' },
    { label: 'Tasks', value: String(tasksInFlow), caption: 'In flow', icon: ListTodo, tone: 'text-[#6B4AB4]' },
  ];

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2538] tracking-tight">
            Deep Focus Room
          </h1>
          <p className="text-sm text-[#6D677D] mt-1 font-medium">
            Select a task, eliminate distractions, and immerse in single-tasking flow.
          </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT: Focus console + active task */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="relative bg-white rounded-3xl border border-[#F0EDE8] shadow-xs p-6 sm:p-8 overflow-hidden flex flex-col items-center text-center">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#EFEBFC]/70 rounded-full blur-3xl pointer-events-none" />

            {/* Mode tabs */}
            <div className="relative z-10 inline-flex flex-wrap justify-center p-1.5 bg-[#F5F2EE] rounded-full gap-1 mb-6">
              {MODE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => switchMode(tab.id)}
                  aria-pressed={mode === tab.id}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all ${
                    mode === tab.id
                      ? 'bg-[#7657D9] text-white shadow-xs'
                      : 'text-[#6D677D] hover:bg-white hover:text-[#2A2538]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dial */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260" aria-hidden="true">
                <circle cx="130" cy="130" r={RING_RADIUS} fill="transparent" stroke="#EFEBFC" strokeWidth="10" />
                <circle
                  cx="130"
                  cy="130"
                  r={RING_RADIUS}
                  fill="transparent"
                  stroke="#7657D9"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={RING_CIRCUMFERENCE * (1 - timeLeft / totalDuration)}
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F5F2EE] rounded-full mb-2">
                  <Flame className="w-3 h-3 text-[#976247] fill-current" />
                  <span className="text-[11px] font-bold text-[#6D677D]">Session {cycleIndex} of 4</span>
                </div>
                <span
                  className="text-5xl sm:text-[56px] font-extrabold text-[#2A2538] tracking-tighter tabular-nums"
                  aria-live="polite"
                  aria-label={`${formatTime(timeLeft)} remaining`}
                >
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs text-[#9E98AB] mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D1BCFF] animate-pulse" />
                  Single-task cadence
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="relative z-10 flex items-center justify-center gap-3 mt-6 w-full max-w-sm">
              <button
                onClick={resetTimer}
                className="flex-1 py-3 px-4 rounded-full bg-[#F5F2EE] hover:bg-[#EAE5E0] text-[#6D677D] hover:text-[#2A2538] text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={toggleTimer}
                className="flex-[1.6] py-3.5 px-6 rounded-full bg-[#7657D9] hover:bg-[#6645C8] text-white text-sm font-bold shadow-md shadow-[#7657D9]/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                <span>{isRunning ? 'Pause' : 'Start'}</span>
              </button>
              <button
                onClick={skipTimer}
                className="flex-1 py-3 px-4 rounded-full bg-[#F5F2EE] hover:bg-[#EAE5E0] text-[#6D677D] hover:text-[#2A2538] text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <SkipForward className="w-4 h-4" />
                <span>Skip</span>
              </button>
            </div>

            {/* Session segment meter */}
            <div className="mt-6 pt-4 border-t border-[#F0EDE8] w-full flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#9E98AB]">Target Cycle:</span>
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-2 w-8 rounded-full ${
                        i < cycleIndex - 1
                          ? 'bg-[#7657D9]'
                          : i === cycleIndex - 1
                          ? 'bg-[#D1BCFF] animate-pulse'
                          : 'bg-[#F0EDE8]'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#7657D9]">
                {untilLongBreak} session{untilLongBreak === 1 ? '' : 's'} until long break
              </span>
            </div>
          </div>

          {/* Active task card */}
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
                  {activeTask ? activeTask.title : 'General Focus Session'}
                </p>
                <span className="text-xs text-[#6D677D] flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  {activeTask
                    ? `Estimated: ${estimatedPomos} pomodoro${estimatedPomos === 1 ? '' : 's'} (${activeTaskSessions} completed)`
                    : 'No task linked to this session'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-shrink-0">
              <Select
                value={activeTask?.id || ''}
                onChange={(e) => onSelectTask(tasks.find((t) => t.id === e.target.value))}
                aria-label="Link Focus Session To Task"
                containerClassName="md:w-52"
              >
                <option value="">No task</option>
                {availableTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </Select>
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
                        ? 'bg-[#E9DDFF] text-[#441F8D]'
                        : 'bg-[#F5F2EE] text-[#6D677D] hover:text-[#2A2538] hover:bg-[#EAE5E0]'
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
                    onChange={(e) => setChime(e.target.checked)}
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
                    onChange={(e) => setAutoStartRest(e.target.checked)}
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
                          s.mode === 'focus' ? 'bg-[#7657D9]' : 'bg-[#D1BCFF]'
                        }`}
                      />
                      <div className="bg-[#FCFAF8] rounded-xl p-2.5 flex-1 flex items-center justify-between gap-2 min-w-0">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#2A2538] truncate">
                            {s.taskTitle || 'General Focus Session'}
                          </p>
                          <span className="text-[11px] text-[#9E98AB]">
                            {formatClock(start.toISOString())} - {formatClock(s.completedAt)} •{' '}
                            {s.durationMinutes}m {MODE_LABELS[s.mode]}
                          </span>
                        </div>
                        {s.mode === 'focus' ? (
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
