import { useState, useCallback } from 'react';
import { weatherAiApi } from '../services/weatherAiApi';

export function useForestAnalysis() {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const analyzeImage = useCallback(async (imageFile, metadata) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const data = await weatherAiApi.analyzeForestImage(imageFile, metadata);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to analyze image',
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, analyzeImage, reset };
}