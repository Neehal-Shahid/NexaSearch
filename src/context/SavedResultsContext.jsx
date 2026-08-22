import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getStoredData, setStoredData } from '../utils/localStorage';
import { SAVED_STORAGE_KEY } from '../constants';

const SavedResultsContext = createContext(null);

export function SavedResultsProvider({ children }) {
  const [savedResults, setSavedResults] = useState(() =>
    getStoredData(SAVED_STORAGE_KEY, [])
  );

  // Persist to localStorage whenever savedResults changes
  useEffect(() => {
    setStoredData(SAVED_STORAGE_KEY, savedResults);
  }, [savedResults]);

  const saveResult = useCallback((result) => {
    setSavedResults((prev) => {
      // Check for duplicate by link
      if (prev.some((item) => item.link === result.link && item.type === result.type)) {
        return prev;
      }
      return [
        {
          ...result,
          id: `${result.type}_${Date.now()}`,
          savedAt: Date.now(),
        },
        ...prev,
      ];
    });
  }, []);

  const removeResult = useCallback((id) => {
    setSavedResults((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const isResultSaved = useCallback(
    (link, type) => {
      return savedResults.some((item) => item.link === link && item.type === type);
    },
    [savedResults]
  );

  const clearAllSaved = useCallback(() => {
    setSavedResults([]);
  }, []);

  return (
    <SavedResultsContext.Provider
      value={{ savedResults, saveResult, removeResult, isResultSaved, clearAllSaved }}
    >
      {children}
    </SavedResultsContext.Provider>
  );
}

export function useSavedResults() {
  const context = useContext(SavedResultsContext);
  if (!context) {
    throw new Error('useSavedResults must be used within a SavedResultsProvider');
  }
  return context;
}
