import { useState } from 'react';
import { useApp } from '../state/AppContext.jsx';
import GlassCard from '../components/GlassCard.jsx';
import Toast from '../components/Toast.jsx';

export default function Settings() {
  const { apiKey, dispatch } = useApp();
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleSave = () => {
    const trimmedKey = inputKey.trim();
    
    if (!trimmedKey) {
      showToast('Please enter an API key', 'error');
      return;
    }

    // Basic validation - Gemini API keys typically start with specific patterns
    if (!trimmedKey.startsWith('AI') && !trimmedKey.includes('google')) {
      showToast('This doesn\'t look like a valid Gemini API key. Please check and try again.', 'warning');
    }

    dispatch({ type: 'SET_API_KEY', payload: trimmedKey });
    showToast('API key saved successfully', 'success');
  };

  const handleClear = () => {
    setInputKey('');
    dispatch({ type: 'SET_API_KEY', payload: null });
    showToast('API key cleared', 'info');
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-shadow">
        Settings
      </h1>

      <GlassCard>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
          Gemini API Configuration
        </h2>

        <div className="space-y-6">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gemini API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="input-field"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Your API key is stored locally in your browser and used to generate cover letters.
              <br />
              Get your API key from{' '}
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={!inputKey.trim()}
                className="btn-primary"
              >
                Save API Key
              </button>
              {apiKey && (
                <button
                  onClick={handleClear}
                  className="btn-secondary"
                >
                  Clear Key
                </button>
              )}
            </div>

            {apiKey && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  API Key Configured
                </span>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          About This App
        </h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            This app uses Google's Gemini AI models to analyze job descriptions and generate tailored cover letters.
          </p>
          <p>
            <strong>Models used:</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><code className="bg-white/20 px-1 rounded">gemini-2.0-flash-lite</code> - Fast job description analysis</li>
            <li><code className="bg-white/20 px-1 rounded">gemini-2.0-flash</code> - High-quality cover letter generation</li>
          </ul>
          <p>
            <strong>Security Note:</strong> Your API key is stored locally in your browser's localStorage. 
            It's not sent to any external servers except Google's Gemini API.
          </p>
        </div>
      </GlassCard>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
