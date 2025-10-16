import React, { useState } from 'react';
import * as FlowApi from '../services/flowApi';

interface AuthPanelProps {
  setToken: (token: string) => void;
}

const AuthPanel: React.FC<AuthPanelProps> = ({ setToken }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  const handleConnect = async () => {
    if (!inputValue) {
      setError('Bearer token cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // validateToken will now throw a detailed error on failure instead of returning false.
      await FlowApi.validateToken(inputValue);
      // If the above line does not throw, the token is considered valid.
      setToken(inputValue);
    } catch (e) {
      // The detailed error from flowApi (e.g., CORS, 401 Unauthorized) is caught here.
      setError(`${e instanceof Error ? e.message : 'An unknown error occurred. Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Veo3 Ultra Flow Client</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Enter your Flow Bearer Token to connect.</p>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="token-input" className="sr-only">Bearer Token</label>
            <input
              id="token-input"
              type="password"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Paste your Bearer Token here"
              className="w-full px-4 py-3 text-gray-900 bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </button>
        </div>
        
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
                onClick={() => setShowInstructions(!showInstructions)} 
                className="flex justify-between items-center w-full text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                aria-expanded={showInstructions}
            >
                <span>How to get your Bearer Token</span>
                <svg className={`w-4 h-4 transition-transform ${showInstructions ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
            {showInstructions && (
                <div className="mt-3 px-2 text-xs text-gray-600 dark:text-gray-400 space-y-2 border-l-2 border-indigo-200 dark:border-indigo-800">
                  <p>1. Log in to your Veo3 account in Flow.</p>
                  <p>2. Open your browser's Developer Tools (usually by pressing F12).</p>
                  <p>3. Go to the "Network" tab.</p>
                  <p>4. Look for requests made to <strong>aisandbox-pa.googleapis.com</strong>.</p>
                  <p>5. Click on one of these requests and look at the "Request Headers" section.</p>
                  {/* FIX: Corrected a typo in the `code` tag which caused a JSX parsing error. */}
                  <p>6. Find the <strong>Authorization</strong> header. It will look like: <code>Bearer ya29.a0A...</code></p>
                  <p>7. Copy the long string of characters that comes <strong>after "Bearer "</strong>. That is your token.</p>
                </div>
            )}
        </div>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400">Your token is stored locally in your browser and is never sent to any server except the Flow API.</p>
      </div>
    </div>
  );
};

export default AuthPanel;