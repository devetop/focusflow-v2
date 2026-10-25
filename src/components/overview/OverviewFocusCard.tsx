import React from "react";
import type { ViewMode } from "../../types";
import { Flame, Play } from "lucide-react";

interface OverviewFocusCardProps {
  totalFocusMinutesToday: number;
  todaySessionsCount: number;
  onNavigate: (view: ViewMode) => void;
}

export const OverviewFocusCard: React.FC<OverviewFocusCardProps> = ({
  totalFocusMinutesToday,
  todaySessionsCount,
  onNavigate,
}) => {
  return (
    <div className="bg-gradient-to-br from-[#7657D9] to-[#6645C8] text-white p-6 rounded-3xl shadow-lg shadow-[#7657D9]/20 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold tracking-wider uppercase opacity-80">Focus Summary</span>
          <Flame className="w-5 h-5 fill-current opacity-90" />
        </div>

        <div className="my-2">
          <div className="text-4xl font-black">{totalFocusMinutesToday} mins</div>
          <p className="text-xs opacity-90 mt-1">Focused deep work today</p>
        </div>

        <div className="mt-4 pt-4 border-t border-white/20 text-xs opacity-90 flex items-center justify-between">
          <span>Completed Sessions</span>
          <span className="font-extrabold">{todaySessionsCount} sessions</span>
        </div>
      </div>

      <button
        onClick={() => onNavigate('timer')}
        className="mt-6 flex items-center justify-center gap-2 w-full py-3 px-4 rounded-full bg-white text-[#7657D9] font-bold text-xs hover:bg-[#EFEBFC] transition-all shadow-md active:scale-95"
      >
        <Play className="w-4 h-4 fill-current" />
        <span>Open Pomodoro Timer</span>
      </button>
    </div>
  );
};