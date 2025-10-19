import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../state/AppContext.jsx';
import GlassCard from '../components/GlassCard.jsx';
import Toast from '../components/Toast.jsx';

export default function Letters() {
  const navigate = useNavigate();
  const { letters, dispatch } = useApp();
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleEdit = (letterId) => {
    navigate(`/letters/${letterId}`);
  };

  const handleDuplicate = (letterId) => {
    dispatch({ type: 'DUPLICATE_LETTER', payload: letterId });
    showToast('Letter duplicated successfully', 'success');
  };

  const handleDelete = (letterId) => {
    setDeleteConfirm(letterId);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      dispatch({ type: 'DELETE_LETTER', payload: deleteConfirm });
      showToast('Letter deleted successfully', 'success');
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleNewLetter = () => {
    navigate('/letters/new');
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-shadow">
          Cover Letters
        </h1>
        <button
          onClick={handleNewLetter}
          className="btn-primary"
        >
          New Letter
        </button>
      </div>

      {letters.length === 0 ? (
        <GlassCard className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">📝</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No cover letters yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first cover letter or generate one from a job description
            </p>
            <div className="space-x-4">
              <button
                onClick={handleNewLetter}
                className="btn-primary"
              >
                Create New Letter
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn-secondary"
              >
                Generate from Job Description
              </button>
            </div>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {letters.map((letter) => (
            <GlassCard key={letter.id} hover className="relative">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                    {letter.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Updated {new Date(letter.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {letter.body.substring(0, 150)}
                    {letter.body.length > 150 && '...'}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                  <button
                    onClick={() => handleEdit(letter.id)}
                    className="btn-secondary text-sm px-3 py-1"
                  >
                    Edit
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDuplicate(letter.id)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm px-2 py-1"
                      title="Duplicate"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => handleDelete(letter.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm px-2 py-1"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard className="max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Delete Cover Letter
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this cover letter? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="btn-primary bg-red-600 hover:bg-red-700 flex-1"
              >
                Delete
              </button>
              <button
                onClick={cancelDelete}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </GlassCard>
        </div>
      )}

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
