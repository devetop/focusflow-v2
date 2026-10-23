import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Task, TimerMode, TimerState, FocusSession } from '../../types';
import { Play, Pause, RotateCcw, SkipForward, CheckCircle, Volume2, Flame } from 'lucide-react';
import { Select } from '../ui/Select';

interface PomodoroTimerProps {
  tasks: Task[];
  activeTask?: Task;
  onSelectTask: (task?: Task) => void;
  onSessionComplete: (session: Omit<FocusSession, 'id' | 'completedAt'>) => void;
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
  activeTask,
  onSelectTask,
  onSessionComplete,
  savedTimerState,
  onSaveTimerState,
}) => {
  const [mode, setMode] = useState<TimerMode>(savedTimerState?.mode || 'focus');
  const [timeLeft, setTimeLeft] = useState<number>(savedTimerState?.timeLeft || MODE_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionCount, setSessionCount] = useState<number>(savedTimerState?.totalSessionsCompletedToday || 0);

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
    playCompletionSound();

    if (mode === 'focus') {
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);

      // Record focus session
      onSessionComplete({
        taskId: activeTask?.id,
        taskTitle: activeTask?.title || 'General Focus Session',
        durationMinutes: 25,
        mode: 'focus',
      });

      // Switch to break after focus
      if (newSessionCount % 4 === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
    } else {
      switchMode('focus');
    }
  }, [mode, sessionCount, activeTask, onSessionComplete, playCompletionSound, switchMode]);

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

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const skipTimer = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      switchMode('shortBreak');
    } else {
      switchMode('focus');
    }
  };

  // Format time display MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = MODE_DURATIONS[mode];
  const progressPercent = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);

  const availableTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto gap-8">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-[#F0EDE8] rounded-full shadow-xs">
        {(
          [
            { id: 'focus', label: 'Focus (25m)' },
            { id: 'shortBreak', label: 'Short Break (5m)' },
            { id: 'longBreak', label: 'Long Break (15m)' },
          ] as { id: TimerMode; label: string }[]
        ).map((m) => (
          <button
            key={m.id}
            onClick={() => switchMode(m.id)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              mode === m.id
                ? 'bg-[#7657D9] text-white shadow-xs'
                : 'text-[#6D677D] hover:bg-[#F5F2EE]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Main Dial Container */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 bg-white rounded-full border-4 border-[#F0EDE8] shadow-xl flex flex-col items-center justify-center p-6 text-center select-none">
        {/* Ring Progress Visualization */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 p-2" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            className="stroke-[#EFEBFC]"
            strokeWidth="4"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            className="stroke-[#7657D9] transition-all duration-500 ease-linear"
            strokeWidth="4"
            strokeDasharray={276.46}
            strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Mode & Time Readout */}
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9E98AB] mb-1">
            {mode === 'focus' ? 'Deep Work' : mode === 'shortBreak' ? 'Short Rest' : 'Long Rest'}
          </span>

          <h2 className="text-5xl sm:text-6xl font-black text-[#2A2538] tracking-tight font-mono my-1">
            {formatTime(timeLeft)}
          </h2>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7657D9] mt-2 bg-[#EFEBFC] px-3 py-1 rounded-full">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{sessionCount} Sessions Done Today</span>
          </div>
        </div>
      </div>

      {/* Primary Timer Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={resetTimer}
          className="p-3 rounded-full bg-white border border-[#F0EDE8] text-[#6D677D] hover:bg-[#F5F2EE] hover:text-[#2A2538] transition-all shadow-2xs active:scale-95"
          title="Reset timer"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTimer}
          className={`flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white font-extrabold text-lg transition-all shadow-lg active:scale-95 ${
            isRunning
              ? 'bg-[#ba1a1a] hover:bg-[#93000a] shadow-[#ba1a1a]/20'
              : 'bg-[#7657D9] hover:bg-[#6645C8] shadow-[#7657D9]/30'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-6 h-6 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6 fill-current ml-1" />
              <span>Start Flow</span>
            </>
          )}
        </button>

        <button
          onClick={skipTimer}
          className="p-3 rounded-full bg-white border border-[#F0EDE8] text-[#6D677D] hover:bg-[#F5F2EE] hover:text-[#2A2538] transition-all shadow-2xs active:scale-95"
          title="Skip session"
          aria-label="Skip session"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Task Linker Selector */}
      <div className="w-full bg-white p-5 rounded-3xl border border-[#F0EDE8] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-[#2A2538] uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-[#7657D9]" />
            Link Focus Session To Task
          </label>
          <button
            onClick={playCompletionSound}
            className="text-xs text-[#9E98AB] hover:text-[#7657D9] flex items-center gap-1"
            title="Test notification chime"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test Sound</span>
          </button>
        </div>

        <Select
          value={activeTask?.id || ''}
          onChange={(e) => {
            const selected = tasks.find((t) => t.id === e.target.value);
            onSelectTask(selected);
          }}
          aria-label="Link Focus Session To Task"
        >
          <option value="">-- General Focus Session (No specific task) --</option>
          {availableTasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title} ({t.estimatedMinutes}m est)
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};