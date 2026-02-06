/**
 * useEnums Hook
 *
 * A hook for loading and using enum values from the API.
 */

import { useState, useEffect, useMemo } from "react";
import { fetchEnums } from "../services/enumService";

function useEnums(requiredEnums = []) {
  const [allEnums, setAllEnums] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadEnums = async () => {
      try {
        setLoading(true);
        const data = await fetchEnums();

        if (isMounted) {
          setAllEnums(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load enums:", err);
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEnums();

    return () => {
      isMounted = false;
    };
  }, []);

  // Return only the requested enums, or all if none specified
  const enums = useMemo(() => {
    if (requiredEnums.length === 0) {
      return allEnums;
    }

    return requiredEnums.reduce((acc, enumName) => {
      acc[enumName] = allEnums[enumName] || [];
      return acc;
    }, {});
  }, [allEnums, requiredEnums]);

  // Helper to get options for a select/radio component
  const getOptions = (enumName) => {
    return allEnums[enumName] || [];
  };

  // Helper to get label for a value
  const getLabel = (enumName, value) => {
    const options = allEnums[enumName] || [];
    const option = options.find((opt) => opt.value === value);
    return option?.label || value;
  };

  // Helper to check if enums are loaded
  const isReady = !loading && !error;

  return {
    enums,
    loading,
    error,
    isReady,
    getOptions,
    getLabel,
  };
}

export default useEnums;
