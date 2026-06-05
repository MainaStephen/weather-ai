import React from 'react';
import { CloudSun, TreePine } from 'lucide-react';

export const Navigation = ({ activeTab, onTabChange }) => {
  return (
    <div className="nav-tabs">
      <button
        onClick={() => onTabChange('weather')}
        className={`nav-tab ${activeTab === 'weather' ? 'active' : ''}`}
      >
        <CloudSun size={18} />
        Weather Intelligence
      </button>
      <button
        onClick={() => onTabChange('forest')}
        className={`nav-tab ${activeTab === 'forest' ? 'active' : ''}`}
      >
        <TreePine size={18} />
        Forest Analyzer
      </button>
    </div>
  );
};