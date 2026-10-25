import React from "react";
import type { Task, Project } from "../../types";
import { Check, Clock, CheckCircle2 } from "lucide-react";
import { Dropdown, type DropdownOption } from "../ui/Dropdown";

interface TimerTaskLinkerProps {
  activeTask?: Task;
  project?: Project;
  tasks: Task[];
  taskLinkOptions: DropdownOption<string>[];
  onSelectTask: (task?: Task) => void;
  onMarkTaskDone: () => void;
}

export const TimerTaskLinker: React.FC<TimerTaskLinkerProps> = ({
  activeTask,
  project,
  tasks,
  taskLinkOptions,
  onSelectTask,
  onMarkTaskDone,
}) => {
  const estimatedPomos = activeTask
    ? Math.max(1, Math.round((activeTask.estimatedMinutes || 25) / 25))
    : 1;

  return (
    <div className="bg-white rounded-3xl border border-[#F0EDE8] shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <button
          onClick={onMarkTaskDone}
          disabled={!activeTask}
          className="mt-0.5 w-6 h-6 rounded-lg bg-[#F5F2EE] hover:bg-[#E9DDFF] text-[#7657D9] flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Mark task complete"
        >
          <Check className="w-4 h-4" />
        </button>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#9E98AB]">Working on</span>
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
              ? `Estimated: ${estimatedPomos} pomodoro${estimatedPomos === 1 ? "" : "s"}`
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
          onClick={onMarkTaskDone}
          disabled={!activeTask}
          className="px-4 py-2 rounded-full bg-[#5D3CBF] hover:bg-[#7657D9] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Done</span>
        </button>
      </div>
    </div>
  );
};