import React, { useState, useEffect } from 'react';
import type { Task, Project, Priority } from '../../types';
import { X, Calendar, Clock, Tag, Folder } from 'lucide-react';
import { Select } from '../ui/Select';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Omit<Task, 'id' | 'createdAt'>, editingId?: string) => void;
  projects: Project[];
  editingTask?: Task | null;
  defaultProjectId?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projects,
  editingTask,
  defaultProjectId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(25);
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate);
      setProjectId(editingTask.projectId || '');
      setEstimatedMinutes(editingTask.estimatedMinutes || 25);
      setTagsInput(editingTask.tags ? editingTask.tags.join(', ') : '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate(new Date().toISOString().split('T')[0]);
      setProjectId(defaultProjectId || (projects.length > 0 ? projects[0].id : ''));
      setEstimatedMinutes(25);
      setTagsInput('');
    }
    setError('');
  }, [editingTask, isOpen, defaultProjectId, projects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    const tags = tagsInput
      ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    onSubmit(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        completed: editingTask ? editingTask.completed : false,
        priority,
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        projectId: projectId || undefined,
        estimatedMinutes: Number(estimatedMinutes) || 15,
        tags,
      },
      editingTask?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A2538]/30 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#F0EDE8] transition-all animate-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0EDE8]">
          <h2 className="text-xl font-extrabold text-[#2A2538]">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-[#9E98AB] hover:text-[#2A2538] hover:bg-[#F5F2EE]"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {error && (
            <div className="p-3 text-xs font-semibold bg-[#ffdad6] text-[#ba1a1a] rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#2A2538] uppercase tracking-wider mb-1">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="What needs to be done?"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FCFAF8] border border-[#F0EDE8] focus:border-[#7657D9] focus:outline-none text-sm font-medium text-[#2A2538]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2A2538] uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, links, or notes..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FCFAF8] border border-[#F0EDE8] focus:border-[#7657D9] focus:outline-none text-sm font-medium text-[#2A2538] resize-none"
            />
          </div>

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
              <Select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                aria-label="Assign Project"
              >
                <option value="">No Project (Unassigned)</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </Select>
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

          <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-[#F0EDE8]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-[#6D677D] hover:bg-[#F5F2EE]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#7657D9] text-white hover:bg-[#6645C8] shadow-md shadow-[#7657D9]/20 transition-all active:scale-95"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};