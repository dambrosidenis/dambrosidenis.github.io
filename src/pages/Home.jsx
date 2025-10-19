import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Label from '@radix-ui/react-label';
import * as Separator from '@radix-ui/react-separator';
import { FileTextIcon, PlusIcon, StarIcon, LinkBreak2Icon, FileIcon } from '@radix-ui/react-icons';
import { useApp } from '../state/AppContext.jsx';
import { fetchJD, stripHTMLToText, validateURL } from '../lib/jd.js';
import { initClient, analyzeJobDescription, draftCoverLetter } from '../lib/llm.js';
import { selectTopExamples } from '../lib/keywords.js';
import Toast from '../components/Toast.jsx';

export default function Home() {
  const navigate = useNavigate();
  const { apiKey, letters, dispatch } = useApp();
  const [url, setUrl] = useState('');
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      showToast('Please add your Gemini API key in Settings first', 'error');
      return;
    }

    const textToAnalyze = showManualInput ? manualText.trim() : url.trim();
    
    if (!textToAnalyze) {
      showToast('Please enter a job description URL or paste the text manually', 'error');
      return;
    }

    if (!showManualInput && !validateURL(url)) {
      showToast('Please enter a valid URL', 'error');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let jobDescriptionText = '';
      
      if (showManualInput) {
        jobDescriptionText = manualText.trim();
      } else {
        // Try to fetch the URL
        try {
          jobDescriptionText = await fetchJD(url);
        } catch (fetchError) {
          if (fetchError.message === 'CORS_ERROR') {
            setShowManualInput(true);
            setError('Unable to fetch the URL due to CORS restrictions. Please paste the job description text manually below.');
            setIsLoading(false);
            return;
          }
          throw fetchError;
        }
      }

      if (!jobDescriptionText) {
        throw new Error('No text content found in the job description');
      }

      // Initialize Gemini client
      const client = initClient(apiKey);

      // Analyze job description
      dispatch({ type: 'SET_LOADING', payload: true });
      const jdAnalysis = await analyzeJobDescription({ text: jobDescriptionText, client });

      // Select relevant examples
      const allKeywords = [...jdAnalysis.mustHaveKeywords, ...jdAnalysis.niceToHaveKeywords];
      const examples = selectTopExamples(letters, allKeywords, 3);

      // Generate cover letter
      const coverLetterText = await draftCoverLetter({ 
        jd: jdAnalysis, 
        examples, 
        client 
      });

      // Create title from analysis
      const title = jdAnalysis.role && jdAnalysis.companySummary 
        ? `${jdAnalysis.role} at ${jdAnalysis.companySummary.split(' ')[0]}`
        : 'New Cover Letter';

      // Navigate to edit page with the generated content
      navigate('/letters/new', {
        state: {
          draft: {
            title,
            body: coverLetterText
          }
        }
      });

      showToast('Cover letter generated successfully!', 'success');

    } catch (error) {
      console.error('Generation failed:', error);
      setError(error.message || 'Failed to generate cover letter');
      showToast('Failed to generate cover letter', 'error');
    } finally {
      setIsLoading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleLetterClick = (letterId) => {
    navigate(`/letters/${letterId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <StarIcon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="card-title">Generate Cover Letter</h1>
                  <p className="card-description">
                    Create a personalized cover letter from a job description
                  </p>
                </div>
              </div>
            </div>
            <div className="card-content">
            
            {!showManualInput ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label.Root htmlFor="url" className="label flex items-center gap-2">
                    <LinkBreak2Icon className="h-4 w-4" />
                    Job Description URL
                  </Label.Root>
                  <input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/job-posting"
                    className="input"
                    disabled={isLoading}
                  />
                </div>
                
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !url.trim()}
                  className="btn-primary w-full btn-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <>
                      <StarIcon className="h-4 w-4" />
                      Generate Cover Letter
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-4 w-4" />
                    <h3 className="text-lg font-semibold">Paste Job Description</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowManualInput(false);
                      setError(null);
                      setManualText('');
                    }}
                    className="btn-ghost btn-sm"
                  >
                    Use URL instead
                  </button>
                </div>
                
                <div className="space-y-2">
                  <Label.Root htmlFor="manual-text" className="label">
                    Job Description Text
                  </Label.Root>
                  <textarea
                    id="manual-text"
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Paste the job description text here..."
                    className="textarea min-h-[160px]"
                    disabled={isLoading}
                  />
                </div>
                
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !manualText.trim()}
                  className="btn-primary w-full btn-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <>
                      <StarIcon className="h-4 w-4" />
                      Generate Cover Letter
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <FileTextIcon className="h-5 w-5 text-muted-foreground" />
                <h2 className="card-title text-lg">Recent Letters</h2>
              </div>
            </div>
            <div className="card-content">
              {letters.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileTextIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    No saved letters yet
                  </p>
                  <button
                    onClick={() => navigate('/letters')}
                    className="btn-outline"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create New Letter
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {letters.slice(0, 5).map((letter) => (
                    <div
                      key={letter.id}
                      onClick={() => handleLetterClick(letter.id)}
                      className="p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors border"
                    >
                      <h3 className="font-medium text-card-foreground truncate">
                        {letter.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(letter.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  
                  {letters.length > 5 && (
                    <Separator.Root className="my-4" />
                  )}
                  
                  {letters.length > 5 && (
                    <button
                      onClick={() => navigate('/letters')}
                      className="btn-ghost w-full"
                    >
                      View all {letters.length} letters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
