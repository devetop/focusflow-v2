import React from "react";
import type { TimerMode, TimerState } from "../../types";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";

interface TimerDisplayProps {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  savedTimerState?: TimerState;
  onSwitchMode: (mode: TimerMode) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSkipSession: () => void;
}

const MODE_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const MODE_TABS: { id: TimerMode; label: string }[] = [
  { id: "focus", label: "Focus (25m)" },
  { id: "shortBreak", label: "Short Break (5m)" },
  { id: "longBreak", label: "Long Break (15m)" },
];

const RING_RADIUS = 112;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  mode,
  timeLeft,
  isRunning,
  onSwitchMode,
  onToggleTimer,
  onResetTimer,
  onSkipSession,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const totalDuration = MODE_DURATIONS[mode];
  const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - Math.min(Math.max(progress, 0), 1));

  return (
    <div className="bg-white rounded-3xl border border-[#F0EDE8] shadow-xs p-6 sm:p-8 flex flex-col items-center justify-center">
      <div className="inline-flex p-1 rounded-2xl bg-[#FCFAF8] border border-[#F0EDE8] mb-8 gap-1 flex-wrap justify-center">
        {MODE_TABS.map((tab) => {
          const active = mode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSwitchMode(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                active
                  ? "bg-[#7657D9] text-white shadow-xs"
                  : "text-[#6D677D] hover:text-[#2A2538] hover:bg-[#F5F2EE]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="relative flex items-center justify-center my-2">
        <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r={RING_RADIUS}
            stroke="#F0EDE8"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx="50%"
            cy="50%"
            r={RING_RADIUS}
            stroke="#7657D9"
            strokeWidth="12"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-500 ease-linear"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="mt-8 text-5xl sm:text-6xl font-black text-[#2A2538] tracking-tight font-mono">
            {formatTime(timeLeft)}
          </span>
          <span className="mt-2 text-xs font-bold uppercase tracking-widest text-[#7657D9] bg-[#EFEBFC] px-3 py-1 rounded-full">
            {isRunning ? "Session Running" : "Paused"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={onResetTimer}
          className="p-3 rounded-2xl bg-[#FCFAF8] hover:bg-[#F5F2EE] border border-[#F0EDE8] text-[#6D677D] hover:text-[#2A2538] transition-all"
          title="Reset timer"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={onToggleTimer}
          className="px-8 py-3.5 rounded-full bg-[#7657D9] hover:bg-[#6645C8] text-white font-extrabold text-sm transition-all shadow-md shadow-[#7657D9]/25 flex items-center gap-2 active:scale-95"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause Focus</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current ml-0.5" />
              <span>Start Focus</span>
            </>
          )}
        </button>

        <button
          onClick={onSkipSession}
          className="p-3 rounded-2xl bg-[#FCFAF8] hover:bg-[#F5F2EE] border border-[#F0EDE8] text-[#6D677D] hover:text-[#2A2538] transition-all"
          title="Skip to next session"
          aria-label="Skip to next session"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};