import React, { useState } from 'react';
import { useUpdateProject } from '../../../hooks/queries/useProjectsQueries';
import type { Project } from '../../../types/production/projects';

interface PhaseProgressEditorProps {
  project: Project;
  onUpdate?: (updatedProject: Project) => void;
}

const PhaseProgressEditor: React.FC<PhaseProgressEditorProps> = ({
  project,
  onUpdate
}) => {
  const updateProjectMutation = useUpdateProject();
  const [localProgress, setLocalProgress] = useState<number>(
    project.currentPhaseProgress ?? 0
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Determine if this is a company project (no phases)
  const isCompanyProject = !project.crackedLeadId;
  const currentPhase = project.currentPhase ?? 1;

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setLocalProgress(Math.max(0, Math.min(100, value)));
    }
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setLocalProgress(Math.max(0, Math.min(100, value)));
    } else if (e.target.value === '') {
      setLocalProgress(0);
    }
  };

  const handleSave = async () => {
    if (!project.id) return;

    setIsUpdating(true);
    try {
      // ⭐ IMPORTANT: Send current phase progress (0-100%), not overall progress
      // Backend will calculate overall progress automatically
      const response = await updateProjectMutation.mutateAsync({
        projectId: project.id,
        updateData: {
          liveProgress: localProgress  // This is current phase progress!
        }
      });

      const updatedProject = (response && typeof response === 'object' && 'data' in response)
        ? (response.data as Project)
        : (response as Project);

      if (onUpdate) {
        onUpdate(updatedProject);
      }
    } catch (error: any) {
      console.error('Error updating progress:', error);
      alert(error?.message || 'Failed to update progress');
    } finally {
      setIsUpdating(false);
    }
  };

  const hasChanges = localProgress !== (project.currentPhaseProgress ?? 0);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Update Progress
        </h4>
        <p className="text-xs text-blue-700">
          {isCompanyProject ? (
            'Update the overall project progress (0-100%).'
          ) : (
            `Update progress for Phase ${currentPhase} (0-100%). Overall progress will be calculated automatically.`
          )}
        </p>
      </div>

      {/* Overall Progress Display (Read-only) */}
      {/* <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Project Progress
        </label>
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-700 min-w-[3rem] text-right">
            {overallProgress.toFixed(0)}%
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          This is calculated automatically from phase progress
        </p>
      </div> */}

      {/* Current Phase Progress Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isCompanyProject ? (
            'Project Progress'
          ) : (
            `Phase ${currentPhase} Progress`
          )}
        </label>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            disabled={isUpdating || !hasChanges}
            className="w-10px px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? 'Updating...' : 'Save'}
          </button>
            <input
              type="range"
              min="0"
              max="100"
              value={localProgress}
              onChange={handleProgressChange}
              className="flex-1 h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
              style={{ width: `${localProgress}%` }}
            />
            <input
              type="number"
              min="0"
              max="100"
              value={localProgress}
              onChange={handleNumberInputChange}
              className="w-15 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-gray-700">%</span>
          </div>
          {/* <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${localProgress}%` }}
            />
          </div> */}
          {/* {!isCompanyProject && (
            <p className="text-xs text-gray-500">
              Update progress for Phase {currentPhase}. Overall progress will be calculated automatically.
            </p>
          )} */}
        </div>
      </div>

      {/* Save Button */}
      

      {updateProjectMutation.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            {updateProjectMutation.error?.message || 'Failed to update progress'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PhaseProgressEditor;

