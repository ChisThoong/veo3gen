
import React, { useState } from 'react';
import type { Project } from '../types';
import { PlusIcon, ChevronRightIcon } from './icons';

interface ProjectPanelProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onCreateProject: (name: string) => Promise<void>;
  isLoading: boolean;
}

const ProjectPanel: React.FC<ProjectPanelProps> = ({ projects, selectedProject, onSelectProject, onCreateProject, isLoading }) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newProjectName.trim()) return;
    setIsCreating(true);
    await onCreateProject(newProjectName.trim());
    setNewProjectName('');
    setIsCreating(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Projects</h2>
      {isLoading && <p>Loading projects...</p>}
      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
        {projects.map(project => (
          <button
            key={project.id}
            onClick={() => onSelectProject(project)}
            className={`w-full text-left p-3 rounded-md flex justify-between items-center transition-colors ${
              selectedProject?.id === project.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <span>{project.name}</span>
            {selectedProject?.id === project.id && <ChevronRightIcon className="w-5 h-5" />}
          </button>
        ))}
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="New project name"
          className="flex-grow px-3 py-2 text-gray-900 bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleCreate}
          disabled={isCreating || !newProjectName.trim()}
          className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center"
        >
            <PlusIcon className="w-5 h-5 mr-1"/>
            Create
        </button>
      </div>
    </div>
  );
};

export default ProjectPanel;
