import { useState, useEffect, useCallback } from 'react';

export const useSafeApiCall = (apiCall, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const { 
    maxRetries = 3, 
    retryDelay = 1000, 
    defaultValue = null,
    enableRetry = true 
  } = options;

  const makeCall = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
      setError(null);
    }

    try {
      const result = await apiCall();
      setData(result || defaultValue);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      console.error('API call failed:', err);
      setError(err);
      
      if (enableRetry && retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          makeCall(true);
        }, retryDelay * (retryCount + 1));
      } else {
        setData(defaultValue);
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall, retryCount, maxRetries, retryDelay, defaultValue, enableRetry]);

  useEffect(() => {
    let isMounted = true;
    
    const runApiCall = async () => {
      if (isMounted) {
        await makeCall();
      }
    };

    runApiCall();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  const retry = useCallback(() => {
    setRetryCount(0);
    makeCall();
  }, [makeCall]);

  return { data, loading, error, retry, retryCount };
};

export const withErrorHandling = (asyncFunction, fallbackValue = null) => {
  return async (...args) => {
    try {
      return await asyncFunction(...args);
    } catch (error) {
      console.error('Async function failed:', error);
      return fallbackValue;
    }
  };
};