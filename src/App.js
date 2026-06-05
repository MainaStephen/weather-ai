import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { ApiKeyInput } from './components/ApiKeyInput';
import { LocationSearch } from './components/LocationSearch';
import { WeatherCard } from './components/WeatherCard';
import { AISummary } from './components/AISummary';
import { ForecastChart } from './components/ForecastChart';
import { ForestAnalyzer } from './components/ForestAnalyzer';
import { useWeather } from './hooks/useWeather';
import { weatherAiApi } from './services/weatherAiApi';
import { Activity, TrendingUp, CloudSun, Sparkles } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('weather');
  const [hasApiKey, setHasApiKey] = useState(!!weatherAiApi.getApiKey());
  const { data, loading, error, unit, fetchWeather, toggleUnit, rateLimit } =
    useWeather();

  useEffect(() => {
    if (hasApiKey && !data && !loading) {
      fetchWeather(-1.2921, 36.8219, 'Nairobi');
    }
  }, [hasApiKey, fetchWeather, data, loading]);

  const transformWeatherData = (rawData) => {
    if (!rawData) return null;

    let cityName = 'Nairobi';
    if (rawData.location) {
      cityName =
        rawData.location.requested_city ||
        rawData.location.city ||
        rawData.location.name ||
        'Nairobi';
    }

    let country = '';
    if (rawData.location) {
      country = rawData.location.country || '';
    }

    let condition = 'Sunny';
    if (rawData.current) {
      const conditionCode = rawData.current.condition_code;
      const conditionMap = {
        0: 'Clear Sky',
        1: 'Partly Cloudy',
        2: 'Cloudy',
        3: 'Overcast',
        4: 'Rain',
        5: 'Thunderstorm',
        6: 'Snow',
        7: 'Fog',
        8: 'Sunny',
      };
      condition =
        rawData.current.condition || conditionMap[conditionCode] || 'Sunny';
    }

    return {
      city: cityName,
      country: country,
      current: {
        temperature: rawData.current?.temperature || 0,
        humidity: rawData.current?.humidity || 55,
        wind_speed_kmh: rawData.current?.wind_speed || 0,
        wind_speed_mph: rawData.current?.wind_speed
          ? rawData.current.wind_speed * 0.621371
          : 0,
        pressure_hpa: rawData.current?.pressure || 1015,
        visibility_m: rawData.current?.visibility || 10000,
        condition: condition,
      },
      forecast: {
        daily: rawData.daily || [],
      },
      ai_summary: rawData.ai_summary || null,
    };
  };

  const transformedData = transformWeatherData(data);
  const rateLimitPercent = rateLimit
    ? (rateLimit.remaining / rateLimit.limit) * 100
    : 100;
  const rateLimitColor =
    rateLimitPercent > 20
      ? 'rate-good'
      : rateLimitPercent > 5
        ? 'rate-warning'
        : 'rate-critical';

  return (
    <div className="container">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-4"></div>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-3">
          <span className="gradient-text">WeatherAI</span> Dashboard
        </h1>

        {rateLimit && (
          <div className="rate-badge mt-4">
            <TrendingUp size={14} className={rateLimitColor} />
            <span className="text-slate-300">
              {rateLimit.remaining.toLocaleString()} /{' '}
              {rateLimit.limit.toLocaleString()} requests remaining
            </span>
          </div>
        )}
      </div>

      <ApiKeyInput onKeySet={() => setHasApiKey(true)} />

      {hasApiKey ? (
        <>
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === 'weather' ? (
            <>
              <LocationSearch onSearch={fetchWeather} />

              {loading && (
                <div className="text-center py-12">
                  <div className="loading-spinner"></div>
                  <p className="text-slate-300 mt-3">
                    Fetching weather intelligence...
                  </p>
                  <p className="text-slate-500 text-sm">
                    Loading Gemini AI insights
                  </p>
                </div>
              )}

              {error && (
                <div className="card text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 mb-3">
                    <Activity size={24} className="text-red-400" />
                  </div>
                  <p className="text-red-200">{error}</p>
                </div>
              )}

              {transformedData && !loading && (
                <div
                  className="flex-col"
                  style={{ gap: '1.5rem', display: 'flex' }}
                >
                  <WeatherCard
                    data={transformedData}
                    unit={unit}
                    onToggleUnit={toggleUnit}
                  />
                  <AISummary summary={transformedData.ai_summary} />
                  <ForecastChart
                    forecast={transformedData.forecast}
                    unit={unit}
                  />
                </div>
              )}
            </>
          ) : (
            <ForestAnalyzer />
          )}
        </>
      ) : (
        <div className="card text-center py-12">
          <CloudSun size={48} className="text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300">
            Enter your WeatherAI API key to begin
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Get your key at dashboard.weather-ai.co
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
