import React from 'react';
import type { Task, Project, FocusSession, ViewMode } from '../../types';
import { Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { TaskItem } from '../tasks/TaskItem';
import { ProjectCard } from '../projects/ProjectCard';
import { getTodayDateString, getFormattedDateString, getCurrentHour, getLast7DaysDateStrings, getLocalDateString } from '../../utils/date';
import { OverviewHeroProgress } from './OverviewHeroProgress';
import { OverviewWeeklyChart, type WeeklyDataItem } from './OverviewWeeklyChart';
import { OverviewFocusCard } from './OverviewFocusCard';

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
  profileName,
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
}) => {
  const formattedDate = getFormattedDateString();
  const currentHour = getCurrentHour();

  const getGreeting = () => {
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayStr = getTodayDateString();
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const todayCompleted = todayTasks.filter((t) => t.completed);
  const todayProgressPercent =
    todayTasks.length > 0 ? Math.round((todayCompleted.length / todayTasks.length) * 100) : 0;

  const last7Days = getLast7DaysDateStrings();
  const weeklyData: WeeklyDataItem[] = last7Days.map((dateStr) => {
    const count = tasks.filter((t) => t.completedAt && getLocalDateString(new Date(t.completedAt)) === dateStr).length;
    const dayName = new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { weekday: 'narrow' });
    return { dateStr, dayName, count };
  });

  const weeklyCompletedTotal = weeklyData.reduce((acc, curr) => acc + curr.count, 0);
  const activeDaysCount = weeklyData.filter((d) => d.count > 0).length;

  const todaySessions = sessions.filter((s) => s.completedAt && getLocalDateString(new Date(s.completedAt)) === todayStr);
  const totalFocusMinutesToday = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const getProject = (projId?: string) => projects.find((p) => p.id === projId);

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#7657D9]">{formattedDate}</span>
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

      {/* 2. Main Banner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OverviewHeroProgress
          todayTasksLength={todayTasks.length}
          todayCompletedLength={todayCompleted.length}
          todayProgressPercent={todayProgressPercent}
        />
        <OverviewWeeklyChart
          weeklyData={weeklyData}
          activeDaysCount={activeDaysCount}
          weeklyCompletedTotal={weeklyCompletedTotal}
          todayStr={todayStr}
        />
      </div>

      {/* 3. Today's Focus Tasks Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#7657D9]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#2A2538]">Today's Focus</h2>
          </div>

          <button onClick={() => onNavigate('tasks')} className="flex items-center gap-1 text-xs font-bold text-[#7657D9] hover:underline">
            <span>View All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-[#F0EDE8] text-center">
            <p className="text-xs font-medium text-[#9E98AB]">No tasks scheduled for today. Take time to relax or add a new goal!</p>
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
            <button onClick={() => onNavigate('projects')} className="flex items-center gap-1 text-xs font-bold text-[#7657D9] hover:underline">
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

        <OverviewFocusCard
          totalFocusMinutesToday={totalFocusMinutesToday}
          todaySessionsCount={todaySessions.length}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
};