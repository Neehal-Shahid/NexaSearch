import { useState, useEffect, useRef } from 'react';
import { search as searchApi } from '../api/searchClient';

/**
 * Custom hook for performing searches.
 * Manages loading, error, and data state.
 * Supports AbortController to cancel in-flight requests.
 */
export function useSearch(query, type = 'web', page = 1) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    // Don't search if no query
    if (!query || query.trim().length === 0) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Abort previous request if still in-flight
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    let cancelled = false;

    async function performSearch() {
      setLoading(true);
      setError(null);

      try {
        const result = await searchApi({
          query,
          type,
          page,
          signal: controller.signal,
        });

        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled && err.name !== 'AbortError') {
          setError(err.message || 'An unexpected error occurred');
          setLoading(false);
        }
      }
    }

    performSearch();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [query, type, page]);

  const retry = () => {
    // Force re-fetch by cycling error state
    setError(null);
    setData(null);

    if (query && query.trim().length > 0) {
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);

      searchApi({ query, type, page, signal: controller.signal })
        .then((result) => {
          setData(result);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setError(err.message || 'An unexpected error occurred');
            setLoading(false);
          }
        });
    }
  };

  return { data, loading, error, retry };
}
