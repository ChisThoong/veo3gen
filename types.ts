
export enum VideoStatus {
  PROCESSING = 'Processing',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
}

export interface Video {
  id: string;
  projectId: string;
  prompt: string;
  status: VideoStatus;
  createdAt: string;
  duration: number; // in seconds
  thumbnailUrl: string;
  videoUrl: string;
  model: string;
  aspectRatio: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}
