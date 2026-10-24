import React, { useState, useEffect } from 'react';
import type { Project } from '../../types';
import { X, Palette, Pipette } from 'lucide-react';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: Omit<Project, 'id' | 'createdAt'>, editingId?: string) => void;
  editingProject?: Project | null;
}

const PASTEL_COLORS = [
  '#7657D9', // Lavender
  '#F3B292', // Soft Peach
  '#7CD4B0', // Soft Mint
  '#F4D06F', // Soft Yellow
  '#F3A6C8', // Soft Pink
  '#6B4AB4', // Deep Violet
  '#4A90E2', // Soft Blue
];

export const ProjectForm: React.FC<ProjectFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingProject,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PASTEL_COLORS[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setDescription(editingProject.description || '');
      setColor(editingProject.color || PASTEL_COLORS[0]);
    } else {
      setName('');
      setDescription('');
      setColor(PASTEL_COLORS[0]);
    }
    setError('');
  }, [editingProject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    onSubmit(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        color: color.toLowerCase(),
        icon: 'Folder',
      },
      editingProject?.id
    );

    onClose();
  };

  const isPreset = PASTEL_COLORS.some((c) => c.toLowerCase() === color.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A2538]/30 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#F0EDE8] transition-all animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0EDE8]">
          <h2 className="text-xl font-extrabold text-[#2A2538]">
            {editingProject ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-[#9E98AB] hover:text-[#2A2538] hover:bg-[#F5F2EE]"
            aria-label="Close project modal"
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
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Website Redesign"
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
              placeholder="What is this project about?"
              rows={2}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FCFAF8] border border-[#F0EDE8] focus:border-[#7657D9] focus:outline-none text-sm font-medium text-[#2A2538] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2A2538] uppercase tracking-wider mb-2 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-[#7657D9]" />
              Project Theme Color
            </label>
            <div className="flex items-center gap-3">
              {PASTEL_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ${
                    color.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-offset-2 ring-[#7657D9] scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
              <label
                className={`relative w-8 h-8 rounded-full transition-all flex items-center justify-center cursor-pointer border border-[#F0EDE8] ${
                  !isPreset ? 'ring-2 ring-offset-2 ring-[#7657D9] scale-110' : 'hover:scale-105'
                } focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#7657D9]`}
                style={{ backgroundColor: isPreset ? '#7657D9' : color }}
              >
                <Pipette className="w-4 h-4 text-white drop-shadow-xs pointer-events-none z-10" />
                <input
                  type="color"
                  value={color.toLowerCase()}
                  onChange={(e) => setColor(e.target.value.toLowerCase())}
                  aria-label="Custom theme color"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                />
              </label>
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
              {editingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};