import React from 'react';
import type { Task, Project, FocusSession, ViewMode } from '../../types';
import {
  getTodayDateString,
  getFormattedDateString,
  getCurrentHour,
  getLast7DaysDateStrings,
} from '../../utils/date';
import { TaskItem } from '../tasks/TaskItem';
import { ProjectCard } from '../projects/ProjectCard';
import { CheckCircle2, Flame, ArrowRight, Sparkles, Plus, Play } from 'lucide-react';

interface OverviewDashboardProps {
  profileName: string;
  tasks: Task[];
  projects: Project[];
  sessions: FocusSession[];
  onNavigate: (view: ViewMode) => void;
  onAddTask: () => void;
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStartTimer: (task: Task) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onSelectProject: (projectId: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  tasks,
  projects,
  sessions,
  onNavigate,
  onAddTask,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onStartTimer,
  onEditProject,
  onDeleteProject,
  onSelectProject,
  profileName,
}) => {
  const todayStr = getTodayDateString();

  const getGreeting = () => {
    const hour = getCurrentHour();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = getFormattedDateString();

  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const todayCompleted = todayTasks.filter((t) => t.completed);
  const todayProgressPercent =
    todayTasks.length > 0 ? Math.round((todayCompleted.length / todayTasks.length) * 100) : 0;

  const last7Days = getLast7DaysDateStrings();

  const weeklyData = last7Days.map((dateStr) => {
    const count = tasks.filter(
      (t) => t.completedAt && t.completedAt.startsWith(dateStr)
    ).length;
    const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'narrow' });
    return { dateStr, dayName, count };
  });

  const weeklyCompletedTotal = weeklyData.reduce((acc, curr) => acc + curr.count, 0);
  const activeDaysCount = weeklyData.filter((d) => d.count > 0).length;

  const todaySessions = sessions.filter(
    (s) => s.completedAt && s.completedAt.startsWith(todayStr)
  );
  const totalFocusMinutesToday = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const getProject = (projId?: string) => projects.find((p) => p.id === projId);

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#7657D9]">
            {formattedDate}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2538] tracking-tight mt-0.5">
            {getGreeting()}, {profileName} 👋
          </h1>
        </div>

        <button
          onClick={onAddTask}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#7657D9] hover:bg-[#6645C8] text-white font-semibold text-sm transition-all shadow-md shadow-[#7657D9]/20 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Task</span>
        </button>
      </div>

      {/* 2. Main Banner Grid: Hero Progress & Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero Progress Card (2 Cols) */}
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
              {todayTasks.length === 0
                ? "Your schedule for today is completely clear!"
                : todayProgressPercent === 100
                ? "All tasks completed! Fantastic work today 🎉"
                : `You've completed ${todayCompleted.length} of ${todayTasks.length} tasks planned for today.`}
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

        {/* Weekly Progress Card (1 Col) */}
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
      </div>

      {/* 3. Today's Focus Tasks Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#7657D9]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#2A2538]">Today's Focus</h2>
          </div>

          <button
            onClick={() => onNavigate('tasks')}
            className="flex items-center gap-1 text-xs font-bold text-[#7657D9] hover:underline"
          >
            <span>View All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-[#F0EDE8] text-center">
            <p className="text-xs font-medium text-[#9E98AB]">
              No tasks scheduled for today. Take time to relax or add a new goal!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {todayTasks.slice(0, 4).map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                project={getProject(task.projectId)}
                onToggleComplete={onToggleComplete}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onStartTimer={onStartTimer}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. Active Projects Overview & Focus Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-[#2A2538]">Active Projects</h2>
            <button
              onClick={() => onNavigate('projects')}
              className="flex items-center gap-1 text-xs font-bold text-[#7657D9] hover:underline"
            >
              <span>Manage Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.slice(0, 2).map((proj) => (
              <ProjectCard
                key={proj.id}
                project={proj}
                tasks={tasks}
                onEdit={onEditProject}
                onDelete={onDeleteProject}
                onSelectProject={onSelectProject}
              />
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#7657D9] to-[#6645C8] text-white p-6 rounded-3xl shadow-lg shadow-[#7657D9]/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-wider uppercase opacity-80">
                Focus Summary
              </span>
              <Flame className="w-5 h-5 fill-current opacity-90" />
            </div>

            <div className="my-2">
              <div className="text-4xl font-black">{totalFocusMinutesToday} mins</div>
              <p className="text-xs opacity-90 mt-1">Focused deep work today</p>
            </div>

            <div className="mt-4 pt-4 border-t border-white/20 text-xs opacity-90 flex items-center justify-between">
              <span>Completed Sessions</span>
              <span className="font-extrabold">{todaySessions.length} sessions</span>
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
      </div>
    </div>
  );
};