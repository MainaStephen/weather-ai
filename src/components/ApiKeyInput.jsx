import React, { useState, useEffect } from 'react';
import {  Save, Shield, CheckCircle } from 'lucide-react';
import { weatherAiApi } from '../services/weatherAiApi';

export const ApiKeyInput = ({ onKeySet }) => {
  const [key, setKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedKey = weatherAiApi.getApiKey();
    if (savedKey) {
      setKey(savedKey);
      setIsSaved(true);
    }
  }, []);

  const handleSave = () => {
    if (key.trim()) {
      weatherAiApi.setApiKey(key.trim());
      setIsSaved(true);
      onKeySet();
    }
  };

  const handleClear = () => {
    weatherAiApi.clearApiKey();
    setKey('');
    setIsSaved(false);
  };

  return (
    <div className="card">
      <div className="flex-between">
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-emerald-400" />
            <label className="text-sm font-semibold text-slate-300">API Authentication</label>
          </div>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="wai_your_api_key_here"
            className="input"
            disabled={isSaved}
          />
          <p className="text-xs text-slate-500 mt-2">Your key is stored locally and never shared</p>
        </div>
        <div className="flex gap-2">
          {!isSaved ? (
            <button onClick={handleSave} className="btn-primary">
              <Save size={16} className="inline mr-1" />
              Connect
            </button>
          ) : (
            <button onClick={handleClear} className="btn-danger">
              Change Key
            </button>
          )}
        </div>
      </div>
      {isSaved && (
        <div className="mt-3 text-sm text-emerald-400 flex items-center gap-2">
          <CheckCircle size={14} />
          API key verified — ready to fetch weather data
        </div>
      )}
    </div>
  );
};