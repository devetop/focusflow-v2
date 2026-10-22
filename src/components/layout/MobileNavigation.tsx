import React from 'react';
import type { ViewMode } from '../../types';
import { LayoutDashboard, CheckSquare, FolderKanban, Timer, CheckCircle, Plus } from 'lucide-react';

interface MobileNavigationProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onAddTask: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentView,
  onNavigate,
  onAddTask,
}) => {
  const navItems = [
    { id: 'overview' as ViewMode, label: 'Overview', icon: LayoutDashboard },
    { id: 'tasks' as ViewMode, label: 'Tasks', icon: CheckSquare },
    { id: 'projects' as ViewMode, label: 'Projects', icon: FolderKanban },
    { id: 'timer' as ViewMode, label: 'Timer', icon: Timer },
    { id: 'completed' as ViewMode, label: 'Completed', icon: CheckCircle },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#F0EDE8] z-40 px-3 py-2 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              isActive ? 'text-[#7657D9]' : 'text-[#9E98AB] hover:text-[#2A2538]'
            }`}
            aria-label={item.label}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        );
      })}

      {/* Floating Action Button for Mobile Add */}
      <button
        onClick={onAddTask}
        className="fixed bottom-16 right-4 w-12 h-12 rounded-full bg-[#7657D9] text-white flex items-center justify-center shadow-lg shadow-[#7657D9]/30 active:scale-95 transition-all"
        aria-label="Add task"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
};
