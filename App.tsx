import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AuthPanel from './components/AuthPanel';
import ProjectPanel from './components/ProjectPanel';
import GeneratorPanel from './components/GeneratorPanel';
import ProgressPanel from './components/ProgressPanel';
import VideoGallery from './components/VideoGallery';
import ThemeToggle from './components/ThemeToggle';
import * as FlowApi from './services/flowApi';
import type { Project, Video } from './types';
import { VideoStatus } from './types';

const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme') as 'light' | 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('bearerToken'));
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [processingVideoIds, setProcessingVideoIds] = useState<string[]>([]);

    const [isProjectsLoading, setIsProjectsLoading] = useState(false);
    const [isVideosLoading, setIsVideosLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleSetToken = (newToken: string) => {
        localStorage.setItem('bearerToken', newToken);
        setToken(newToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('bearerToken');
        localStorage.removeItem('lastSelectedProjectId');
        setToken(null);
        setProjects([]);
        setSelectedProject(null);
        setVideos([]);
    };

    const fetchProjects = useCallback(async () => {
        if (!token) return;
        setIsProjectsLoading(true);
        try {
            const fetchedProjects = await FlowApi.getProjects(token);
            setProjects(fetchedProjects);
            const lastProjectId = localStorage.getItem('lastSelectedProjectId');
            if (lastProjectId) {
                const lastProject = fetchedProjects.find(p => p.id === lastProjectId);
                if (lastProject) setSelectedProject(lastProject);
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error);
            alert(`Error fetching projects: ${error instanceof Error ? error.message : 'Unknown error'}. Your session may have expired. You will be logged out.`);
            handleLogout();
        } finally {
            setIsProjectsLoading(false);
        }
    }, [token]);

    const fetchVideos = useCallback(async () => {
        if (!token || !selectedProject) return;
        setIsVideosLoading(true);
        try {
            const fetchedVideos = await FlowApi.getVideos(token, selectedProject.id);
            setVideos(fetchedVideos);
            const processing = fetchedVideos.filter(v => v.status === VideoStatus.PROCESSING).map(v => v.id);
            setProcessingVideoIds(processing);
        } catch (error) {
            console.error("Failed to fetch videos:", error);
            alert(`Error fetching videos: ${error instanceof Error ? error.message : 'Unknown error'}.`);
        } finally {
            setIsVideosLoading(false);
        }
    }, [token, selectedProject]);

    useEffect(() => {
        if (token) {
            fetchProjects();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    useEffect(() => {
        if (selectedProject) {
            localStorage.setItem('lastSelectedProjectId', selectedProject.id);
            fetchVideos();
        }
    }, [selectedProject, fetchVideos]);
    
    const pollVideoStatus = useCallback(async () => {
        if (!token || processingVideoIds.length === 0) return;
        
        // In a real API, we get the full video object from getVideoStatus
        const updates = await Promise.all(
            processingVideoIds.map(id => FlowApi.getVideoStatus(token, id).catch(() => null))
        );

        let hasCompletedOrFailed = false;
        const stillProcessing: string[] = [];

        const newVideos = [...videos];
        let videoMapNeedsUpdate = false;

        updates.forEach(updatedVideo => {
            if (updatedVideo) {
                if (updatedVideo.status !== VideoStatus.PROCESSING) {
                    hasCompletedOrFailed = true;
                     // Update the video in our local state directly
                    const index = newVideos.findIndex(v => v.id === updatedVideo.id);
                    if (index !== -1) {
                        newVideos[index] = updatedVideo;
                        videoMapNeedsUpdate = true;
                    }
                } else {
                    stillProcessing.push(updatedVideo.id);
                }
            }
        });

        setProcessingVideoIds(stillProcessing);
        if (videoMapNeedsUpdate) {
            setVideos(newVideos);
        } else if (hasCompletedOrFailed && !videoMapNeedsUpdate) {
            // Fallback to refetch if a video finished but wasn't in the current list for some reason
            fetchVideos(); 
        }

    }, [token, processingVideoIds, fetchVideos, videos]);


    useEffect(() => {
        if (processingVideoIds.length > 0) {
            const interval = setInterval(pollVideoStatus, 5000); // Poll every 5 seconds
            return () => clearInterval(interval);
        }
    }, [processingVideoIds, pollVideoStatus]);

    const handleCreateProject = async (name: string) => {
        if (!token) return;
        try {
            const newProject = await FlowApi.createProject(token, name);
            setProjects(prev => [...prev, newProject]);
            setSelectedProject(newProject);
        } catch (error) {
             console.error("Failed to create project:", error);
             alert(`Error creating project: ${error instanceof Error ? error.message : 'Unknown error'}.`);
        }
    };

    const handleGenerate = async (prompts: string[], model: string, aspectRatio: string) => {
        if (!token || !selectedProject) return;
        setIsGenerating(true);
        
        const createdVideos: Video[] = [];
        for (const prompt of prompts) {
            try {
                const newVideo = await FlowApi.createVideo(token, selectedProject.id, prompt, model, aspectRatio);
                createdVideos.push(newVideo);
            } catch (error) {
                console.error(`Failed to create video for prompt "${prompt}":`, error);
                alert(`Failed to create video for prompt "${prompt}": ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        
        if (createdVideos.length > 0) {
            setVideos(prev => [...prev, ...createdVideos]);
            setProcessingVideoIds(prev => [...prev, ...createdVideos.map(v => v.id)]);
        }
        
        setIsGenerating(false);
    };

    const processingVideos = useMemo(() => videos.filter(v => processingVideoIds.includes(v.id)), [videos, processingVideoIds]);

    if (!token) {
        return <AuthPanel setToken={handleSetToken} />;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Veo3 Ultra Flow</h1>
                <div className="flex items-center space-x-4">
                    <ThemeToggle theme={theme} setTheme={setTheme} />
                    <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Logout</button>
                </div>
            </header>
            
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <ProjectPanel 
                        projects={projects}
                        selectedProject={selectedProject}
                        onSelectProject={setSelectedProject}
                        onCreateProject={handleCreateProject}
                        isLoading={isProjectsLoading}
                    />
                    <GeneratorPanel 
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                        disabled={!selectedProject}
                    />
                    <ProgressPanel processingVideos={processingVideos} />
                </div>

                <div className="lg:col-span-2">
                    {selectedProject ? (
                        <VideoGallery videos={videos.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())} isLoading={isVideosLoading} />
                    ) : (
                        <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            <p className="text-gray-500 dark:text-gray-400">Please select or create a project to begin.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;