/**
 * useApi Hook
 *
 * A hook for handling API calls with loading and error states.
 */

import { useState, useCallback, useRef, useEffect } from "react";

function useApi(apiFn, options = {}) {
  const { immediate = false, onSuccess, onError, initialData = null } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  // Track mounted state to prevent updates after unmount
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFn(...args);

        if (isMounted.current) {
          setData(result);
          onSuccess?.(result);
        }

        return result;
      } catch (err) {
        if (isMounted.current) {
          setError(err);
          onError?.(err);
        }
        throw err;
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [apiFn, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  // Execute immediately if specified
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
  };
}

export default useApi;
