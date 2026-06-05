import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export const ForecastChart = ({ forecast, unit }) => {
  // The API returns daily array directly in the forecast object
  const dailyData = forecast?.daily || [];
  
  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">5-Day Forecast</h3>
        <p className="text-slate-400 text-center">Forecast data not available</p>
      </div>
    );
  }

  const labels = dailyData.slice(0, 5).map(day => {
    const date = new Date(day.date || day.time);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  });

  const highTemps = dailyData.slice(0, 5).map(day => day.temp_max || day.high || day.max_temp || 0);
  const lowTemps = dailyData.slice(0, 5).map(day => day.temp_min || day.low || day.min_temp || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: `High (${unit === 'metric' ? '°C' : '°F'})`,
        data: highTemps,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: `Low (${unit === 'metric' ? '°C' : '°F'})`,
        data: lowTemps,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: { color: '#cbd5e1' },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        grid: { color: '#334155' },
        ticks: { color: '#cbd5e1' },
      },
      x: {
        ticks: { color: '#cbd5e1' },
      },
    },
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-4">5-Day Forecast</h3>
      <Line data={chartData} options={options} />
    </div>
  );
};