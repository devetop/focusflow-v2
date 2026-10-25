import React from "react";
import { Sparkles } from "lucide-react";

interface OverviewHeroProgressProps {
  todayTasksLength: number;
  todayCompletedLength: number;
  todayProgressPercent: number;
}

export const OverviewHeroProgress: React.FC<OverviewHeroProgressProps> = ({
  todayTasksLength,
  todayCompletedLength,
  todayProgressPercent,
}) => {
  return (
    <div className="lg:col-span-2 bg-gradient-to-br from-white to-[#FCFAF8] p-6 sm:p-8 rounded-3xl border border-[#F0EDE8] shadow-xs relative overflow-hidden flex flex-col justify-between">
      <div className="absolute right-4 bottom-4 w-36 h-36 opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="#7657D9" />
          <path d="M60 100L90 130L140 70" stroke="white" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEBFC] text-[#7657D9] text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Small steps, big progress.</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-[#2A2538] tracking-tight max-w-md">
          {todayTasksLength === 0
            ? "Your schedule for today is completely clear!"
            : todayProgressPercent === 100
            ? "All tasks completed! Fantastic work today 🎉"
            : `You've completed ${todayCompletedLength} of ${todayTasksLength} tasks planned for today.`}
        </h2>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-xs font-bold text-[#6D677D] mb-2">
          <span>Today's Completion</span>
          <span className="text-[#7657D9]">{todayProgressPercent}%</span>
        </div>

        <div className="w-full h-3 bg-[#F0EDE8] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#7657D9] to-[#9B7AE8] rounded-full transition-all duration-500"
            style={{ width: `${todayProgressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};