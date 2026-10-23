import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileNavigation } from './MobileNavigation';
import type { ViewMode } from '../../types';

interface AppShellProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onAddTask: () => void;
  todayTaskCount: number;
  onExportData?: () => void;
  onImportData?: (file: File) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentView,
  onNavigate,
  onAddTask,
  todayTaskCount,
  onExportData,
  onImportData,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#FCFAF8] flex flex-col md:flex-row text-[#2A2538]">
      {/* Desktop Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={onNavigate}
        onAddTask={onAddTask}
        todayCount={todayTaskCount}
        onExportData={onExportData}
        onImportData={onImportData}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 max-w-7xl mx-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8 transition-all">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNavigation
        currentView={currentView}
        onNavigate={onNavigate}
        onAddTask={onAddTask}
      />
    </div>
  );
};