import React, { useState } from "react";
import type { FocusSession, TimerMode } from "../../types";
import {
  VolumeX,
  CloudRain,
  Coffee,
  Wind,
  BellRing,
  RotateCw,
  History,
  CheckCircle2,
  Volume2,
  type LucideIcon,
} from "lucide-react";

export interface MetricCard {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  tone: string;
}

interface TimerSoundLogProps {
  metrics: MetricCard[];
  chime: boolean;
  autoStartRest: boolean;
  todaySessions: FocusSession[];
  onToggleChime: (val: boolean) => void;
  onToggleAutoStartRest: (val: boolean) => void;
}

const AMBIENCE = [
  { id: "mute", label: "Mute", icon: VolumeX },
  { id: "rain", label: "Rain", icon: CloudRain },
  { id: "cafe", label: "Cafe", icon: Coffee },
  { id: "noise", label: "White Noise", icon: Wind },
] as const;

const MODE_LABELS: Record<TimerMode, string> = {
  focus: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

const formatClock = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

export const TimerSoundLog: React.FC<TimerSoundLogProps> = ({
  metrics,
  chime,
  autoStartRest,
  todaySessions,
  onToggleChime,
  onToggleAutoStartRest,
}) => {
  const [ambience, setAmbience] = useState<(typeof AMBIENCE)[number]["id"]>("mute");

  return (
    <div className="lg:col-span-5 flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        {metrics.map(({ label, value, caption, icon: Icon, tone }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#F0EDE8] shadow-xs p-3.5 flex flex-col justify-between">
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
                  active ? "bg-[#E9DDFF] text-[#441F8D]" : "bg-[#F5F2EE] text-[#6D677D] hover:text-[#2A2538] hover:bg-[#EAE5E0]"
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
                onChange={(e) => onToggleChime(e.target.checked)}
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
                onChange={(e) => onToggleAutoStartRest(e.target.checked)}
                aria-label="Auto-start rest intervals"
              />
              <span className="w-10 h-6 bg-[#EAE5E0] rounded-full transition-colors peer-checked:bg-[#7657D9] peer-focus-visible:ring-2 peer-focus-visible:ring-[#7657D9]/30 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>
        </div>
      </div>

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
                      <p className="text-xs font-bold text-[#2A2538] truncate">{s.taskTitle || "General Focus Session"}</p>
                      <span className="text-[11px] text-[#9E98AB]">
                        {formatClock(start.toISOString())} - {formatClock(s.completedAt)} • {s.durationMinutes}m {MODE_LABELS[s.mode]}
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
  );
};