import React, { useState } from 'react';
import type { Task, Project, TaskFilterTab, Priority } from '../../types';
import { getTodayDateString } from '../../utils/date';
import { TaskItem } from './TaskItem';
import { Search, Filter, ArrowUpDown, CheckCircle2 } from 'lucide-react';
import { Dropdown, type DropdownOption } from '../ui/Dropdown';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStartTimer?: (task: Task) => void;
  initialTab?: TaskFilterTab;
  initialProjectId?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  projects,
  onToggleComplete,
  onEdit,
  onDelete,
  onStartTimer,
  initialTab = 'all',
  initialProjectId = 'all',
}) => {
  const [activeTab, setActiveTab] = useState<TaskFilterTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');

  const todayStr = getTodayDateString();

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'completed') {
      if (!task.completed) return false;
    } else {
      if (task.completed) return false;

      if (activeTab === 'today') {
        if (task.dueDate !== todayStr) return false;
      } else if (activeTab === 'upcoming') {
        if (task.dueDate <= todayStr) return false;
      } else if (activeTab === 'overdue') {
        if (task.dueDate >= todayStr) return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchTag = task.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    if (selectedProjectId !== 'all') {
      if (task.projectId !== selectedProjectId) return false;
    }

    if (selectedPriority !== 'all') {
      if (task.priority !== selectedPriority) return false;
    }

    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const pMap: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
      return pMap[b.priority] - pMap[a.priority];
    } else if (sortBy === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
  });

  const getProject = (projId?: string) => projects.find((p) => p.id === projId);

  const projectOptions: DropdownOption<string>[] = [
    { value: 'all', label: 'All Projects' },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  const priorityOptions: DropdownOption<string>[] = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const sortOptions: DropdownOption<'dueDate' | 'priority' | 'createdAt'>[] = [
    { value: 'dueDate', label: 'Sort: Due Date' },
    { value: 'priority', label: 'Sort: Priority' },
    { value: 'createdAt', label: 'Sort: Created Date' },
  ];

  return (
    <div className="flex flex-col gap-5 max-w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#F0EDE8] shadow-2xs max-w-full">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#9E98AB] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks or tags..."
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-[#FCFAF8] border border-[#F0EDE8] focus:border-[#7657D9] focus-visible:ring-2 focus-visible:ring-[#7657D9]/20 focus:outline-none text-xs font-semibold text-[#2A2538]"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <Dropdown
            icon={<Filter className="w-3.5 h-3.5" />}
            value={selectedProjectId}
            onChange={setSelectedProjectId}
            options={projectOptions}
            ariaLabel="Filter by project"
          />

          <Dropdown
            value={selectedPriority}
            onChange={setSelectedPriority}
            options={priorityOptions}
            ariaLabel="Filter by priority"
          />

          <Dropdown
            icon={<ArrowUpDown className="w-3.5 h-3.5" />}
            value={sortBy}
            onChange={setSortBy}
            options={sortOptions}
            ariaLabel="Sort tasks"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-[#F0EDE8] pb-1 overflow-x-auto">
        {(
          [
            { id: 'all', label: 'All Tasks' },
            { id: 'today', label: 'Today' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'completed', label: 'Completed' },
          ] as { id: TaskFilterTab; label: string }[]
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#7657D9] text-white shadow-xs'
                  : 'text-[#6D677D] hover:bg-[#F5F2EE] hover:text-[#2A2538]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {sortedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-[#F0EDE8] p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#EFEBFC] flex items-center justify-center text-[#7657D9] mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#2A2538]">No tasks found</h3>
          <p className="text-xs text-[#9E98AB] mt-1 max-w-xs">
            {searchQuery || selectedProjectId !== 'all' || selectedPriority !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : activeTab === 'completed'
              ? 'Completed tasks will appear here.'
              : 'Add a new task to get started on your focused work session.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              project={getProject(task.projectId)}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              onStartTimer={onStartTimer}
            />
          ))}
        </div>
      )}
    </div>
  );
};