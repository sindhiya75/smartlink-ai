// src/components/dashboard/Charts.js
import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#94a3b8', font: { size: 12 } } },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      borderColor: '#334155',
      borderWidth: 1,
    },
  },
  scales: {
    x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
    y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
  },
};

export default function Charts({ urls }) {
  const [topUrls, setTopUrls] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState('');

  useEffect(() => {
    fetchTopUrls();
  }, []);

  useEffect(() => {
    if (selectedUrl) fetchAnalytics(selectedUrl);
  }, [selectedUrl]);

  useEffect(() => {
    if (urls?.length && !selectedUrl) {
      setSelectedUrl(urls[0]?.shortCode);
    }
  }, [urls]);

  const fetchTopUrls = async () => {
    try {
      const { data } = await api.get('/api/analytics/top-urls');
      setTopUrls(data.topUrls || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  const fetchAnalytics = async (code) => {
    try {
      const { data } = await api.get(`/api/analytics/${code}`);
      setAnalyticsData(data.data);
    } catch { /* silent */ }
  };

  // Daily click trend chart data
  const dailyData = {
    labels: analyticsData?.dailyClicks?.map(d => d.date.slice(5)) || [],
    datasets: [{
      label: 'Daily Clicks',
      data: analyticsData?.dailyClicks?.map(d => d.clicks) || [],
      fill: true,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.1)',
      tension: 0.4,
      pointBackgroundColor: '#6366f1',
      pointRadius: 4,
    }],
  };

  // Weekly chart
  const weeklyData = {
    labels: analyticsData?.weeklyClicks?.map(d => d.week) || [],
    datasets: [{
      label: 'Weekly Clicks',
      data: analyticsData?.weeklyClicks?.map(d => d.clicks) || [],
      backgroundColor: 'rgba(139,92,246,0.7)',
      borderColor: '#8b5cf6',
      borderRadius: 6,
    }],
  };

  // Top URLs bar
  const topUrlsData = {
    labels: topUrls.map(u => u.pageTitle || u.shortCode).slice(0, 8),
    datasets: [{
      label: 'Total Clicks',
      data: topUrls.map(u => u.clickCount).slice(0, 8),
      backgroundColor: [
        'rgba(99,102,241,0.7)', 'rgba(139,92,246,0.7)', 'rgba(236,72,153,0.7)',
        'rgba(16,185,129,0.7)', 'rgba(245,158,11,0.7)', 'rgba(59,130,246,0.7)',
        'rgba(239,68,68,0.7)', 'rgba(20,184,166,0.7)',
      ],
      borderRadius: 6,
    }],
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse h-64" />
        ))}
      </div>
    );
  }

  if (!urls?.length) {
    return (
      <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="text-5xl mb-4">📊</div>
        <p className="text-slate-300 font-medium mb-2">No data yet</p>
        <p className="text-slate-500 text-sm">Create links and share them to see charts here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Analytics Charts</h2>
        <p className="text-slate-400 text-sm">Visual breakdown of your link performance.</p>
      </div>

      {/* URL selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-400">Viewing:</label>
        <select
          value={selectedUrl}
          onChange={e => setSelectedUrl(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {urls.map(u => (
            <option key={u.shortCode} value={u.shortCode}>
              {u.pageTitle || u.shortCode}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">📈 Daily Click Trend (30 days)</h3>
          <div className="h-56">
            <Line data={dailyData} options={chartDefaults} />
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">📅 Weekly Click Trend</h3>
          <div className="h-56">
            <Bar data={weeklyData} options={chartDefaults} />
          </div>
        </div>

        {/* Top URLs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">🏆 Top Performing Links</h3>
          <div className="h-56">
            <Bar data={topUrlsData} options={{ ...chartDefaults, indexAxis: 'y' }} />
          </div>
        </div>
      </div>

      {/* AI Prediction card */}
      {analyticsData?.prediction && (
        <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-600/20 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-indigo-400 mb-4">🤖 AI Click Prediction</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">This Week</p>
              <p className="text-2xl font-bold text-white">{analyticsData.prediction.currentWeekClicks}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Predicted Next Week</p>
              <p className="text-2xl font-bold text-indigo-400">{analyticsData.prediction.predictedNextWeek}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Growth Rate</p>
              <p className={`text-2xl font-bold ${analyticsData.prediction.growthRate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {analyticsData.prediction.growthRate >= 0 ? '+' : ''}{analyticsData.prediction.growthRate}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
