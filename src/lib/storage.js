const STORAGE_KEY = 'coverletter.app.v1';

const INITIAL_STATE = {
  apiKey: null,
  letters: []
};

export function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return INITIAL_STATE;
    }
    
    const parsed = JSON.parse(stored);
    
    // Migration: ensure all required fields exist
    return {
      apiKey: parsed.apiKey ?? null,
      letters: Array.isArray(parsed.letters) ? parsed.letters : []
    };
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return INITIAL_STATE;
  }
}

export function saveToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function generateId() {
  return crypto.randomUUID();
}

export function generateTimestamp() {
  return new Date().toISOString();
}
