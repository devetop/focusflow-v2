import React from "react";

export interface WeeklyDataItem {
  dateStr: string;
  dayName: string;
  count: number;
}

interface OverviewWeeklyChartProps {
  weeklyData: WeeklyDataItem[];
  activeDaysCount: number;
  weeklyCompletedTotal: number;
  todayStr: string;
}

export const OverviewWeeklyChart: React.FC<OverviewWeeklyChartProps> = ({
  weeklyData,
  activeDaysCount,
  weeklyCompletedTotal,
  todayStr,
}) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-[#F0EDE8] shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#2A2538]">7-Day Activity</h3>
          <span className="text-xs font-bold text-[#7CD4B0] bg-[#EBF8F2] px-2.5 py-0.5 rounded-full">
            {activeDaysCount} Days Active
          </span>
        </div>

        <div className="flex items-end justify-between h-28 pt-4 pb-1 px-1">
          {weeklyData.map((d, i) => {
            const maxCount = Math.max(...weeklyData.map((item) => item.count), 4);
            const heightPercent = Math.min(Math.round((d.count / maxCount) * 100), 100);
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-full h-full flex items-end justify-center">
                  <div
                    className={`w-3.5 sm:w-4 rounded-t-lg transition-all ${
                      d.dateStr === todayStr
                        ? 'bg-[#7657D9]'
                        : d.count > 0
                        ? 'bg-[#9B7AE8]/60'
                        : 'bg-[#F0EDE8]'
                    }`}
                    style={{ height: `${Math.max(heightPercent, 12)}%` }}
                    title={`${d.count} tasks completed`}
                  />
                </div>
                <span className="text-[10px] font-bold text-[#9E98AB]">{d.dayName}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-[#F0EDE8] flex items-center justify-between text-xs text-[#6D677D]">
        <span>Total Completed This Week</span>
        <span className="font-extrabold text-[#2A2538]">{weeklyCompletedTotal} tasks</span>
      </div>
    </div>
  );
};