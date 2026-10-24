import React from 'react';
import type { Project, Task } from '../../types';
import { Folder, MoreVertical, Edit2, Trash2, ArrowRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  tasks: Task[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onSelectProject: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  tasks,
  onEdit,
  onDelete,
  onSelectProject,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const completedTasks = projectTasks.filter((t) => t.completed);
  const totalCount = projectTasks.length;
  const completedCount = completedTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div
      onClick={() => onSelectProject(project.id)}
      className="group relative bg-white rounded-3xl p-6 border border-[#F0EDE8] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[200px] cursor-pointer"
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-xs font-bold"
              style={{ backgroundColor: project.color }}
            >
              <Folder className="w-5 h-5 fill-current/20 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2A2538] group-hover:text-[#7657D9] transition-colors line-clamp-1">
                {project.name}
              </h3>
              <p className="text-xs text-[#9E98AB]">
                {totalCount} {totalCount === 1 ? 'task' : 'tasks'}
              </p>
            </div>
          </div>

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-xl text-[#9E98AB] hover:text-[#2A2538] hover:bg-[#F5F2EE] transition-colors"
              aria-label="Project actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 mt-1 w-36 bg-white border border-[#F0EDE8] rounded-2xl shadow-lg z-20 py-1"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onEdit(project);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#6D677D] hover:bg-[#F5F2EE] hover:text-[#2A2538]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Project
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDelete(project);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Project
                </button>
              </div>
            )}
          </div>
        </div>

        {project.description && (
          <p className="text-xs text-[#6D677D] mt-3 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="text-[#6D677D]">Progress</span>
          <span className="text-[#2A2538]">{progressPercent}%</span>
        </div>

        <div className="w-full h-2.5 bg-[#F5F2EE] rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: project.color,
            }}
          />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectProject(project.id);
          }}
          className="flex items-center justify-between w-full pt-3 border-t border-[#F0EDE8] text-xs font-bold text-[#7657D9] hover:text-[#6645C8] transition-colors"
        >
          <span>View All Tasks</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
