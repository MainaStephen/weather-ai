import React from 'react';
import {
  Droplets,
  Wind,
  Gauge,
  Eye,
  Thermometer,
  MapPin,
  Sun,
  Cloud,
  CloudRain,
} from 'lucide-react';

export const WeatherCard = ({ data, unit, onToggleUnit }) => {
  if (!data || !data.current) {
    return (
      <div className="card">
        <p className="text-slate-400 text-center">Weather data not available</p>
      </div>
    );
  }

  const temp = Math.round(data.current.temperature);
  const windSpeed =
    unit === 'metric'
      ? data.current.wind_speed_kmh
      : data.current.wind_speed_mph;
  const windUnit = unit === 'metric' ? 'km/h' : 'mph';
  const visibilityKm = (data.current.visibility_m / 1000).toFixed(1);

  const getWeatherIcon = () => {
    const condition = data.current.condition.toLowerCase();
    if (condition.includes('rain') || condition.includes('drizzle'))
      return <CloudRain size={48} className="text-blue-400" />;
    if (condition.includes('cloud'))
      return <Cloud size={48} className="text-slate-400" />;
    return <Sun size={48} className="text-yellow-400" />;
  };

  return (
    <div className="card">
      <div className="flex-between">
        <div>
          <div className="flex gap-2 items-center">
            <MapPin size={20} className="text-blue-400" />
            <h2 className="text-3xl font-bold text-white">{data.city}</h2>
          </div>
          <p className="text-slate-400 ml-7">{data.country}</p>
        </div>
        <div className="text-right">
          <div className="temp-display">
            <Thermometer size={32} className="text-orange-400" />
            <span className="temp-value">{temp}</span>
            <span className="temp-unit">°{unit === 'metric' ? 'C' : 'F'}</span>
            <button
              onClick={onToggleUnit}
              className="ml-2 text-xs bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition"
            >
              Switch to {unit === 'metric' ? '°F' : '°C'}
            </button>
          </div>
          <div className="flex items-center justify-end gap-2 mt-2">
            {getWeatherIcon()}
            <p className="text-slate-300 text-lg">{data.current.condition}</p>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Droplets className="stat-icon text-blue-400" />
          <p className="stat-label">Humidity</p>
          <p className="stat-value">{data.current.humidity}%</p>
        </div>
        <div className="stat-card">
          <Wind className="stat-icon text-cyan-400" />
          <p className="stat-label">Wind Speed</p>
          <p className="stat-value">
            {windSpeed.toFixed(1)} <span className="text-sm">{windUnit}</span>
          </p>
        </div>
        <div className="stat-card">
          <Gauge className="stat-icon text-indigo-400" />
          <p className="stat-label">Pressure</p>
          <p className="stat-value">
            {data.current.pressure_hpa} <span className="text-sm">hPa</span>
          </p>
        </div>
        <div className="stat-card">
          <Eye className="stat-icon text-green-400" />
          <p className="stat-label">Visibility</p>
          <p className="stat-value">
            {visibilityKm} <span className="text-sm">km</span>
          </p>
        </div>
      </div>
    </div>
  );
};
