import { useState, useCallback, useRef } from 'react';
import { weatherAiApi } from '../services/weatherAiApi';

export function useWeather() {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
    unit: 'metric',
  });
  
  const currentFetchRef = useRef(null);

  const fetchWeather = useCallback(async (lat, lon, cityName) => {
    if (currentFetchRef.current) {
      currentFetchRef.current.abort();
    }
    
    const controller = new AbortController();
    currentFetchRef.current = controller;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log(`Calling API with lat=${lat}, lon=${lon}, unit=${state.unit}`);
      const data = await weatherAiApi.getWeather(lat, lon, 5, state.unit, true);
      
      if (!controller.signal.aborted) {
        if (!data) {
          throw new Error('No data received from API');
        }
        
        // Check if the response has an error property
        if (data.error) {
          throw new Error(data.error);
        }
        
        setState(prev => ({
          ...prev,
          data: data,
          loading: false,
          error: null,
        }));
      }
    } catch (error) {
      console.error('API Error Details:', error);
      if (!controller.signal.aborted && error.name !== 'AbortError') {
        let errorMessage = error.message || 'Failed to fetch weather data';
        
        // Handle specific HTTP status codes
        if (error.message.includes('500')) {
          errorMessage = 'Weather service is temporarily unavailable. Please try again later or use the search feature.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Invalid API key. Please check your WeatherAI API key.';
        } else if (error.message.includes('403')) {
          errorMessage = 'API key does not have permission for this feature.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Monthly API quota exceeded. Please try again next month.';
        }
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }
    } finally {
      if (currentFetchRef.current === controller) {
        currentFetchRef.current = null;
      }
    }
  }, [state.unit]);

  const toggleUnit = useCallback(() => {
    setState(prev => {
      const newUnit = prev.unit === 'metric' ? 'imperial' : 'metric';
      console.log(`Toggling unit to ${newUnit}`);
      if (prev.data) {
        // Use default Nairobi coordinates instead of trying to get current location
        const lat = -1.2921;
        const lon = 36.8219;
        weatherAiApi.getWeather(lat, lon, 5, newUnit, true)
          .then(data => {
            setState(current => ({ ...current, data, unit: newUnit, loading: false, error: null }));
          })
          .catch(error => {
            console.error('Error fetching weather after unit change:', error);
            setState(current => ({ ...current, unit: newUnit, error: error.message }));
          });
        return { ...prev, unit: newUnit, loading: true };
      }
      return { ...prev, unit: newUnit };
    });
  }, []);

  return {
    ...state,
    fetchWeather,
    toggleUnit,
    rateLimit: weatherAiApi.getRateLimitInfo(),
  };
}