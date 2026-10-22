import React from 'react';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onAddTask?: () => void;
  actionButtonLabel?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onAddTask,
  actionButtonLabel = 'Add Task',
}) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2538] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[#6D677D] mt-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {onAddTask && (
        <button
          onClick={onAddTask}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#7657D9] hover:bg-[#6645C8] text-white font-semibold text-sm transition-all shadow-md shadow-[#7657D9]/20 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{actionButtonLabel}</span>
        </button>
      )}
    </header>
  );
};
