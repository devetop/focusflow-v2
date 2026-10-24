import React, { useState, useRef, useEffect, useId } from 'react';
import type { Task, Project, TaskFilterTab, Priority } from '../../types';
import { getTodayDateString } from '../../utils/date';
import { TaskItem } from './TaskItem';
import { Search, Filter, ArrowUpDown, CheckCircle2, ChevronDown, Check } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStartTimer?: (task: Task) => void;
  initialTab?: TaskFilterTab;
}

interface FilterDropdownOption<T extends string> {
  value: T;
  label: string;
}

interface FilterDropdownProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: FilterDropdownOption<T>[];
  icon?: React.ReactNode;
  ariaLabel: string;
}

function FilterDropdown<T extends string>({
  value,
  onChange,
  options,
  icon,
  ariaLabel,
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        const idx = options.findIndex((opt) => opt.value === value);
        setFocusedIndex(idx >= 0 ? idx : 0);
      }
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown();
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + options.length) % options.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < options.length) {
        onChange(options[focusedIndex].value);
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block flex-1 sm:flex-none min-w-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        className="w-full sm:w-auto h-9 px-3 rounded-xl bg-[#FCFAF8] border border-[#F0EDE8] hover:border-[#7657D9]/40 focus:border-[#7657D9] focus-visible:ring-2 focus-visible:ring-[#7657D9]/20 focus:outline-none transition-all cursor-pointer flex items-center justify-between gap-1.5 text-xs font-semibold text-[#2A2538]"
      >
        <span className="flex items-center gap-1.5 truncate min-w-0">
          {icon && <span className="text-[#9E98AB] flex-shrink-0">{icon}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : ''}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#9E98AB] flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1 min-w-full w-max max-w-[calc(100vw-32px)] bg-white border border-[#F0EDE8] rounded-2xl shadow-lg z-30 py-1 max-h-60 overflow-y-auto"
        >
          {options.map((option, idx) => {
            const isSelected = option.value === value;
            const isFocused = idx === focusedIndex;

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  buttonRef.current?.focus();
                }}
                onMouseEnter={() => setFocusedIndex(idx)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold cursor-pointer transition-colors ${
                  isSelected ? 'text-[#7657D9] bg-[#EFEBFC]/50' : 'text-[#6D677D]'
                } ${isFocused && !isSelected ? 'bg-[#F5F2EE] text-[#2A2538]' : ''}`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#7657D9] flex-shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  projects,
  onToggleComplete,
  onEdit,
  onDelete,
  onStartTimer,
  initialTab = 'all',
}) => {
  const [activeTab, setActiveTab] = useState<TaskFilterTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');

  const todayStr = getTodayDateString();

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'completed') {
      if (!task.completed) return false;
    } else {
      if (task.completed) return false;
      if (activeTab === 'today' && task.dueDate !== todayStr) return false;
      if (activeTab === 'upcoming' && task.dueDate <= todayStr) return false;
      if (activeTab === 'overdue' && task.dueDate >= todayStr) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
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

  const projectOptions: FilterDropdownOption<string>[] = [
    { value: 'all', label: 'All Projects' },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  const priorityOptions: FilterDropdownOption<string>[] = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const sortOptions: FilterDropdownOption<'dueDate' | 'priority' | 'createdAt'>[] = [
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
          <FilterDropdown
            icon={<Filter className="w-3.5 h-3.5" />}
            value={selectedProjectId}
            onChange={setSelectedProjectId}
            options={projectOptions}
            ariaLabel="Filter by project"
          />

          <FilterDropdown
            value={selectedPriority}
            onChange={setSelectedPriority}
            options={priorityOptions}
            ariaLabel="Filter by priority"
          />

          <FilterDropdown
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
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-[#F0EDE8] text-center my-4">
          <div className="w-14 h-14 rounded-full bg-[#EFEBFC] flex items-center justify-center text-[#7657D9] mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#2A2538]">No tasks found</h3>
          <p className="text-xs text-[#9E98AB] max-w-sm mt-1">
            {searchQuery
              ? 'Try adjusting your search keywords or filters.'
              : 'You are all caught up! Take a break or add a new task to stay productive.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
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
