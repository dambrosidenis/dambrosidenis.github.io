import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import * as Label from '@radix-ui/react-label';
import * as Separator from '@radix-ui/react-separator';
import { ArrowLeftIcon, CheckIcon, ReloadIcon, FileTextIcon } from '@radix-ui/react-icons';
import { useApp } from '../state/AppContext.jsx';
import Toast from '../components/Toast.jsx';

export default function EditLetter() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { letters, dispatch } = useApp();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isNewLetter, setIsNewLetter] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    // Check if this is a new letter with draft data
    if (id === 'new' && location.state?.draft) {
      setIsNewLetter(true);
      setTitle(location.state.draft.title || '');
      setBody(location.state.draft.body || '');
    } else if (id && id !== 'new') {
      // Load existing letter
      const letter = letters.find(l => l.id === id);
      if (letter) {
        setTitle(letter.title);
        setBody(letter.body);
        setIsNewLetter(false);
      } else {
        // Letter not found, redirect to letters list
        navigate('/letters');
        showToast('Letter not found', 'error');
      }
    } else if (id === 'new') {
      // New empty letter
      setIsNewLetter(true);
      setTitle('');
      setBody('');
    }
  }, [id, letters, location.state, navigate]);

  const handleSave = () => {
    if (!title.trim()) {
      showToast('Please enter a title', 'error');
      return;
    }

    if (!body.trim()) {
      showToast('Please enter letter content', 'error');
      return;
    }

    if (isNewLetter) {
      // Create new letter
      dispatch({
        type: 'ADD_LETTER',
        payload: { title: title.trim(), body: body.trim() }
      });
      showToast('Letter saved successfully', 'success');
      navigate('/letters');
    } else {
      // Update existing letter
      dispatch({
        type: 'UPDATE_LETTER',
        payload: {
          id,
          updates: { title: title.trim(), body: body.trim() }
        }
      });
      showToast('Letter updated successfully', 'success');
    }
  };

  const handleReset = () => {
    if (isNewLetter) {
      setBody('');
    } else {
      // For existing letters, reset only the body
      setBody('');
    }
    showToast('Letter content reset', 'info');
  };

  const handleBack = () => {
    navigate('/letters');
  };

  const isDirty = () => {
    if (isNewLetter) {
      return title.trim() || body.trim();
    } else {
      const originalLetter = letters.find(l => l.id === id);
      return originalLetter && (
        title.trim() !== originalLetter.title ||
        body.trim() !== originalLetter.body
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
            <FileTextIcon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isNewLetter ? 'New Cover Letter' : 'Edit Cover Letter'}
            </h1>
            <p className="text-muted-foreground">
              {isNewLetter ? 'Create a new cover letter' : 'Edit your existing cover letter'}
            </p>
          </div>
        </div>
        <button
          onClick={handleBack}
          className="btn-outline"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Letters
        </button>
      </div>

      <div className="card">
        <div className="card-content">
          <div className="space-y-8">
            {/* Title Input */}
            <div className="space-y-2">
              <Label.Root htmlFor="title" className="label">
                Title
              </Label.Root>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Software Engineer at TechCorp"
                className="input"
              />
            </div>

            {/* Body Textarea */}
            <div className="space-y-2">
              <Label.Root htmlFor="body" className="label">
                Cover Letter Content
              </Label.Root>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your cover letter here..."
                className="textarea min-h-[500px]"
              />
            </div>

            <Separator.Root className="my-6" />

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  disabled={!title.trim() || !body.trim()}
                  className="btn-primary"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {isNewLetter ? 'Save Letter' : 'Update Letter'}
                </button>
                <button
                  onClick={handleReset}
                  disabled={!body.trim()}
                  className="btn-outline"
                >
                  <ReloadIcon className="h-4 w-4 mr-2" />
                  Reset Content
                </button>
              </div>
              
              {isDirty() && (
                <div className="text-sm text-amber-600 dark:text-amber-400 flex items-center space-x-1">
                  <span>●</span>
                  <span>Unsaved changes</span>
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
