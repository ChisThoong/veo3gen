
import React from 'react';
import type { Video } from '../types';

interface ProgressPanelProps {
  processingVideos: Video[];
}

const ProgressPanel: React.FC<ProgressPanelProps> = ({ processingVideos }) => {
  if (processingVideos.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Processing Videos</h2>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {processingVideos.map(video => (
          <div key={video.id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse">
            <p className="text-sm font-medium truncate">{video.prompt}</p>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
              <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
              <span>Processing...</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressPanel;
