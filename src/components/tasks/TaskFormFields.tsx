import React from 'react';
import type { Priority } from '../../types';
import { Calendar, Clock, Tag, Folder } from 'lucide-react';
import { Dropdown, type DropdownOption } from '../ui/Dropdown';

interface TaskFormFieldsProps {
  priority: Priority;
  setPriority: (p: Priority) => void;
  dueDate: string;
  setDueDate: (d: string) => void;
  estimatedMinutes: number;
  setEstimatedMinutes: (m: number) => void;
  projectId: string;
  setProjectId: (p: string) => void;
  projectOptions: DropdownOption<string>[];
  tagsInput: string;
  setTagsInput: (t: string) => void;
}

export const TaskFormFields: React.FC<TaskFormFieldsProps> = ({
  priority,
  setPriority,
  dueDate,
  setDueDate,
  estimatedMinutes,
  setEstimatedMinutes,
  projectId,
  setProjectId,
  projectOptions,
  tagsInput,
  setTagsInput,
}) => {
  return (
    <>
      <div>
        <label className="block text-xs font-bold text-[#2A2538] uppercase tracking-wider mb-1">
          Priority
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['low', 'medium', 'high'] as Priority[]).map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setPriority(p)}
              className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                priority === p
                  ? p === 'high'
                    ? 'bg-[#FDF0F6] text-[#993766] border-[#F3A6C8]'
                    : p === 'medium'
                    ? 'bg-[#FEF9E8] text-[#8C6C0F] border-[#F4D06F]'
                    : 'bg-[#EBF8F2] text-[#237A56] border-[#7CD4B0]'
                  : 'border-[#F0EDE8] text-[#6D677D] hover:bg-[#F5F2EE]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-[#2A2538] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#7657D9]" />
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 rounded-2xl bg-[#FCFAF8] border border-[#F0EDE8] focus:border-[#7657D9] focus:outline-none text-xs font-semibold text-[#2A2538]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#2A2538] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#7657D9]" />
            Estimated (Minutes)
          </label>
          <input
            type="number"
            min="5"
            step="5"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-2xl bg-[#FCFAF8] border border-[#F0EDE8] focus:border-[#7657D9] focus:outline-none text-xs font-semibold text-[#2A2538]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-[#2A2538] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Folder className="w-3.5 h-3.5 text-[#7657D9]" />
            Project
          </label>
          <Dropdown
            fullWidth
            value={projectId}
            onChange={setProjectId}
            options={projectOptions}
            ariaLabel="Assign Project"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#2A2538] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-[#7657D9]" />
            Tags (Comma separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. Design, Frontend"
            className="w-full px-3 py-2 rounded-2xl bg-[#FCFAF8] border border-[#F0EDE8] focus:border-[#7657D9] focus:outline-none text-xs font-semibold text-[#2A2538]"
          />
        </div>
      </div>
    </>
  );
};