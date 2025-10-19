import { createContext, useContext, useReducer, useEffect } from 'react';
import { loadFromStorage, saveToStorage, generateId, generateTimestamp } from '../lib/storage.js';

const AppContext = createContext();

const initialState = {
  apiKey: null,
  letters: [],
  isLoading: false,
  error: null
};

function appReducer(state, action) {
  switch (action.type) {
    case 'INIT_FROM_STORAGE':
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: null
      };
    
    case 'SET_API_KEY':
      return {
        ...state,
        apiKey: action.payload,
        error: null
      };
    
    case 'ADD_LETTER':
      const newLetter = {
        id: generateId(),
        title: action.payload.title,
        body: action.payload.body,
        updatedAt: generateTimestamp()
      };
      return {
        ...state,
        letters: [...state.letters, newLetter]
      };
    
    case 'UPDATE_LETTER':
      return {
        ...state,
        letters: state.letters.map(letter =>
          letter.id === action.payload.id
            ? { ...letter, ...action.payload.updates, updatedAt: generateTimestamp() }
            : letter
        )
      };
    
    case 'DELETE_LETTER':
      return {
        ...state,
        letters: state.letters.filter(letter => letter.id !== action.payload)
      };
    
    case 'DUPLICATE_LETTER':
      const originalLetter = state.letters.find(letter => letter.id === action.payload);
      if (!originalLetter) return state;
      
      const duplicatedLetter = {
        id: generateId(),
        title: `${originalLetter.title} (Copy)`,
        body: originalLetter.body,
        updatedAt: generateTimestamp()
      };
      return {
        ...state,
        letters: [...state.letters, duplicatedLetter]
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedState = loadFromStorage();
    dispatch({ type: 'INIT_FROM_STORAGE', payload: storedState });
  }, []);

  // Save to localStorage whenever state changes (debounced)
  useEffect(() => {
    if (state.isLoading) return; // Don't save during loading states
    
    const timeoutId = setTimeout(() => {
      saveToStorage({
        apiKey: state.apiKey,
        letters: state.letters
      });
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [state.apiKey, state.letters]);

  const value = {
    ...state,
    dispatch
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
