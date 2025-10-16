
import React from 'react';
import type { Video } from '../types';
import { VideoStatus } from '../types';
import { PlayIcon, DownloadIcon, PencilIcon, PlusIcon } from './icons';

interface VideoGalleryProps {
  videos: Video[];
  isLoading: boolean;
}

const StatusBadge: React.FC<{ status: VideoStatus }> = ({ status }) => {
  const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
  if (status === VideoStatus.COMPLETED) {
    return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>Completed</span>;
  }
  if (status === VideoStatus.FAILED) {
    return <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}>Failed</span>;
  }
  return <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`}>Processing</span>;
};

const VideoCard: React.FC<{ video: Video }> = ({ video }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
            <div className="relative">
                <img src={video.thumbnailUrl} alt={video.prompt} className="w-full h-40 object-cover" />
                {video.status === VideoStatus.COMPLETED && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <PlayIcon className="w-12 h-12 text-white" />
                    </div>
                )}
            </div>
            <div className="p-4">
                <p className="text-sm font-medium h-10 overflow-hidden text-ellipsis">{video.prompt}</p>
                <div className="flex justify-between items-center mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <StatusBadge status={video.status} />
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    {video.duration > 0 && <span>{video.duration}s</span>}
                </div>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 flex justify-around">
                <button title="Download" disabled={video.status !== VideoStatus.COMPLETED} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                    <DownloadIcon className="w-5 h-5"/>
                </button>
                 <button title="Edit & Regenerate" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50">
                    <PencilIcon className="w-5 h-5"/>
                </button>
                 <button title="Extend Video" disabled={video.status !== VideoStatus.COMPLETED} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                    <PlusIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};

const VideoGallery: React.FC<VideoGalleryProps> = ({ videos, isLoading }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Video Gallery</h2>
      {isLoading && <p>Loading videos...</p>}
      {!isLoading && videos.length === 0 && <p className="text-gray-500 dark:text-gray-400">No videos found for this project. Generate some!</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default VideoGallery;
