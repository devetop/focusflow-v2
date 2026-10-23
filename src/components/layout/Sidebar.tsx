import React from 'react';
import type { ViewMode } from '../../types';
import { LayoutDashboard, CheckSquare, FolderKanban, Timer, CheckCircle, Settings, Plus } from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onAddTask: () => void;
  todayCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onAddTask,
  todayCount,
}) => {
  const navItems = [
    { id: 'overview' as ViewMode, label: 'Overview', icon: LayoutDashboard },
    { id: 'tasks' as ViewMode, label: 'My Tasks', icon: CheckSquare },
    { id: 'projects' as ViewMode, label: 'Projects', icon: FolderKanban },
    { id: 'timer' as ViewMode, label: 'Focus Timer', icon: Timer },
    { id: 'completed' as ViewMode, label: 'Completed', icon: CheckCircle },
    { id: 'settings' as ViewMode, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[260px] h-screen sticky top-0 bg-[#FCFAF8] border-r border-[#F0EDE8] p-6 justify-between flex-shrink-0 select-none">
      <div className="flex flex-col gap-8">
        {/* Logo / Brand Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7657D9] to-[#9B7AE8] flex items-center justify-center text-white font-bold text-xl shadow-md shadow-[#7657D9]/20">
            F
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#2A2538]">FocusFlow</h1>
            <p className="text-xs text-[#9E98AB]">Productivity Companion</p>
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onAddTask}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-full bg-[#7657D9] hover:bg-[#6645C8] text-white font-semibold text-sm transition-all shadow-md shadow-[#7657D9]/20 active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Task</span>
        </button>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center justify-between w-full py-3 px-4 rounded-2xl font-semibold text-sm transition-all ${
                  isActive
                    ? 'bg-[#EFEBFC] text-[#7657D9] shadow-xs'
                    : 'text-[#6D677D] hover:bg-[#F5F2EE] hover:text-[#2A2538]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#7657D9]' : 'text-[#9E98AB]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'tasks' && todayCount > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-[#7657D9] text-white' : 'bg-[#EAE5E0] text-[#6D677D]'}`}>
                    {todayCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>



      {/* Bottom Summary Pill */}
      <div className="p-4 bg-white border border-[#F0EDE8] rounded-2xl shadow-xs">
        <div className="flex items-center justify-between text-xs text-[#6D677D]">
          <span>Today's Focus</span>
          <span className="font-bold text-[#7657D9]">{todayCount} tasks due</span>
        </div>
        <div className="mt-2 text-xs text-[#9E98AB]">
          Keep taking small steps forward! 🌿
        </div>
      </div>
    </aside>
  );
};