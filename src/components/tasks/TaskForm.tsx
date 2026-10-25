import React, { useState, useEffect } from 'react';
import type { Task, Project, Priority } from '../../types';
import { X } from 'lucide-react';
import type { DropdownOption } from '../ui/Dropdown';
import { TaskFormFields } from './TaskFormFields';

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

  const projectOptions: DropdownOption<string>[] = [
    { value: '', label: 'No Project (Unassigned)' },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

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

          <TaskFormFields
            priority={priority}
            setPriority={setPriority}
            dueDate={dueDate}
            setDueDate={setDueDate}
            estimatedMinutes={estimatedMinutes}
            setEstimatedMinutes={setEstimatedMinutes}
            projectId={projectId}
            setProjectId={setProjectId}
            projectOptions={projectOptions}
            tagsInput={tagsInput}
            setTagsInput={setTagsInput}
          />

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