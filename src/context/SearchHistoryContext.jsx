import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getStoredData, setStoredData } from '../utils/localStorage';
import { HISTORY_STORAGE_KEY, HISTORY_MAX_ITEMS } from '../constants';

const SearchHistoryContext = createContext(null);

export function SearchHistoryProvider({ children }) {
  const [history, setHistory] = useState(() =>
    getStoredData(HISTORY_STORAGE_KEY, [])
  );

  useEffect(() => {
    setStoredData(HISTORY_STORAGE_KEY, history);
  }, [history]);

  const addToHistory = useCallback((query, type = 'web') => {
    setHistory((prev) => {
      // Remove existing entry with same query + type (will re-add at top)
      const filtered = prev.filter(
        (item) => !(item.query.toLowerCase() === query.toLowerCase() && item.type === type)
      );

      const newEntry = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        query,
        type,
        timestamp: Date.now(),
      };

      // Prepend and cap at max
      return [newEntry, ...filtered].slice(0, HISTORY_MAX_ITEMS);
    });
  }, []);

  const removeFromHistory = useCallback((id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Get recent searches (last N items, for homepage display)
  const getRecentSearches = useCallback(
    (count = 5) => {
      return history.slice(0, count);
    },
    [history]
  );

  return (
    <SearchHistoryContext.Provider
      value={{ history, addToHistory, removeFromHistory, clearHistory, getRecentSearches }}
    >
      {children}
    </SearchHistoryContext.Provider>
  );
}

export function useSearchHistory() {
  const context = useContext(SearchHistoryContext);
  if (!context) {
    throw new Error('useSearchHistory must be used within a SearchHistoryProvider');
  }
  return context;
}
