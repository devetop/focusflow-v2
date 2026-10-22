import React from 'react';
import type { Task, Project } from '../../types';
import { isDateOverdue } from '../../utils/date';
import { Check, Clock, Calendar, Tag, MoreVertical, Edit2, Trash2, Play } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  project?: Project;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStartTimer?: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  project,
  onToggleComplete,
  onEdit,
  onDelete,
  onStartTimer,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const priorityColors = {
    low: 'bg-[#EBF8F2] text-[#237A56] border-[#7CD4B0]/30',
    medium: 'bg-[#FEF9E8] text-[#8C6C0F] border-[#F4D06F]/30',
    high: 'bg-[#FDF0F6] text-[#993766] border-[#F3A6C8]/30',
  };

  const overdue = isDateOverdue(task.dueDate, task.completed);

  return (
    <div
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border transition-all duration-200 hover:shadow-md ${
        task.completed
          ? 'border-[#F0EDE8] opacity-65 bg-[#FCFAF8]'
          : 'border-[#F0EDE8] hover:border-[#EAE5E0]'
      }`}
    >
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 sm:mt-0 ${
            task.completed
              ? 'bg-[#7657D9] border-[#7657D9] text-white'
              : 'border-[#D9D3CC] hover:border-[#7657D9] bg-white'
          }`}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`text-base font-semibold text-[#2A2538] transition-all truncate max-w-full ${
                task.completed ? 'line-through text-[#9E98AB]' : ''
              }`}
            >
              {task.title}
            </h3>

            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${
                priorityColors[task.priority]
              }`}
            >
              {task.priority}
            </span>

            {overdue && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a]">
                Overdue
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-xs text-[#6D677D] mt-1 line-clamp-1">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-[#9E98AB]">
            {project && (
              <span className="flex items-center gap-1 font-semibold text-[#2A2538]" style={{ color: project.color }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: project.color }} />
                {project.name}
              </span>
            )}

            <span className={`flex items-center gap-1 ${overdue ? 'text-[#ba1a1a] font-semibold' : ''}`}>
              <Calendar className="w-3.5 h-3.5" />
              {task.dueDate}
            </span>

            {task.estimatedMinutes > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {task.estimatedMinutes}m est.
              </span>
            )}

            {task.tags && task.tags.length > 0 && (
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {task.tags.join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 self-end sm:self-center">
        {onStartTimer && !task.completed && (
          <button
            onClick={() => onStartTimer(task)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#EFEBFC] text-[#7657D9] text-xs font-semibold hover:bg-[#7657D9] hover:text-white transition-all"
            title="Focus on this task with Timer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden md:inline">Focus</span>
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-xl text-[#9E98AB] hover:text-[#2A2538] hover:bg-[#F5F2EE] transition-colors"
            aria-label="Task actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 mt-1 w-36 bg-white border border-[#F0EDE8] rounded-2xl shadow-lg z-20 py-1"
              onMouseLeave={() => setShowMenu(false)}
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit(task);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#6D677D] hover:bg-[#F5F2EE] hover:text-[#2A2538]"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Task
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete(task.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
