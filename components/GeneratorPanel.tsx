
import React, { useState } from 'react';
import { MODELS, ASPECT_RATIOS } from '../constants';

interface GeneratorPanelProps {
    onGenerate: (prompts: string[], model: string, aspectRatio: string) => void;
    isGenerating: boolean;
    disabled: boolean;
}

const GeneratorPanel: React.FC<GeneratorPanelProps> = ({ onGenerate, isGenerating, disabled }) => {
    const [model, setModel] = useState(MODELS[0]);
    const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
    const [prompts, setPrompts] = useState('');

    const handleGenerateClick = () => {
        const promptList = prompts.split('\n').map(p => p.trim()).filter(p => p.length > 0);
        if (promptList.length > 0) {
            onGenerate(promptList, model, aspectRatio);
            setPrompts('');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
            <h2 className="text-xl font-bold">Video Generator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
                    <select
                        id="model-select"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full px-3 py-2 text-gray-900 bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aspect Ratio</label>
                    <div className="flex space-x-2">
                        {ASPECT_RATIOS.map(ar => (
                            <button
                                key={ar}
                                onClick={() => setAspectRatio(ar)}
                                className={`w-full py-2 rounded-md transition-colors ${aspectRatio === ar ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}
                            >
                                {ar}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div>
                <label htmlFor="prompts-textarea" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prompts (one per line)</label>
                <textarea
                    id="prompts-textarea"
                    rows={5}
                    value={prompts}
                    onChange={(e) => setPrompts(e.target.value)}
                    placeholder="e.g., A cinematic shot of a futuristic city at night..."
                    className="w-full px-3 py-2 text-gray-900 bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <button
                onClick={handleGenerateClick}
                disabled={isGenerating || disabled || !prompts.trim()}
                className="w-full py-3 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
            >
                {isGenerating ? 'Generating...' : `Generate ${prompts.split('\n').filter(p => p.trim()).length || 0} Videos`}
            </button>
        </div>
    );
};

export default GeneratorPanel;
