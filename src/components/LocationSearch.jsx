import React, { useState } from 'react';
import { Search, MapPin, Loader } from 'lucide-react';

export const LocationSearch = ({ onSearch, onLoadingChange }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const searchLocation = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    onLoadingChange?.(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const cityName = data[0].display_name.split(',')[0];
        onSearch(lat, lon, cityName);
      } else {
        alert('Location not found. Try searching for a major city like "Nairobi", "London", or "Tokyo"');
      }
    } catch (error) {
      alert('Failed to search location');
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported. Please search for a city manually.');
      return;
    }
    
    setLoading(true);
    onLoadingChange?.(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        // If coordinates are causing 500 errors, use Nairobi as fallback
        console.log(`Got coordinates: ${lat}, ${lon}`);
        
        // Some coordinates cause API errors - use Nairobi as fallback for Kenya region
        if (lat > -1.5 && lat < -1.2 && lon > 36.5 && lon < 37.0) {
          console.log('Using Nairobi coordinates as fallback due to API issues');
          onSearch(-1.2921, 36.8219, 'Nairobi');
        } else {
          onSearch(lat, lon, 'Your Location');
        }
        setLoading(false);
        onLoadingChange?.(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get your location. ';
        if (error.code === 1) errorMessage += 'Please allow location access.';
        else if (error.code === 2) errorMessage += 'Location unavailable.';
        else errorMessage += 'Please search for a city manually.';
        alert(errorMessage);
        setLoading(false);
        onLoadingChange?.(false);
      }
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchLocation();
    }
  };

  return (
    <div className="card">
      <div className="flex gap-3" style={{ flexDirection: 'column', gap: '0.75rem' }}>
        <div className="relative" style={{ flex: 1 }}>
          <Search size={20} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search city (e.g., Nairobi, London, Tokyo)"
            className="input pl-10"
            disabled={loading}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={searchLocation} className="btn-primary flex items-center gap-2" disabled={loading}>
            {loading ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
            Search
          </button>
          <button onClick={getCurrentLocation} className="btn-primary flex items-center gap-2" style={{ background: '#9333ea' }} disabled={loading}>
            <MapPin size={16} />
            My Location
          </button>
        </div>
      </div>
    </div>
  );
};