// src/pages/AnalyticsPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#94a3b8', font: { size: 11 } } },
    tooltip: { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#334155', borderWidth: 1 },
  },
  scales: {
    x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#1e293b' } },
    y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#1e293b' } },
  },
};

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#10b981','#f59e0b','#3b82f6','#ef4444','#14b8a6'];

const BreakdownCard = ({ title, data }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
    <h3 className="text-sm font-semibold text-slate-300 mb-4">{title}</h3>
    {!data?.length ? (
      <p className="text-slate-500 text-sm">No data yet.</p>
    ) : (
      <div className="space-y-2">
        {data.slice(0, 6).map((item, i) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-slate-300">{item.name}</span>
                <span className="text-slate-400">{item.count} ({item.percentage}%)</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${item.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default function AnalyticsPage() {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/api/analytics/${shortCode}`);
        setData(res.data.data);
      } catch (err) {
        addToast(err.response?.data?.error || 'Failed to load analytics.', 'error');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!data) return null;

  const { url, totalClicks, lastVisited, recentHistory, deviceBreakdown, browserBreakdown, countryBreakdown, dailyClicks, weeklyClicks, prediction } = data;

  const dailyChartData = {
    labels: dailyClicks?.map(d => d.date.slice(5)) || [],
    datasets: [{
      label: 'Clicks',
      data: dailyClicks?.map(d => d.clicks) || [],
      fill: true,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.1)',
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#6366f1',
    }],
  };

  const deviceDoughnut = {
    labels: deviceBreakdown?.map(d => d.name) || [],
    datasets: [{
      data: deviceBreakdown?.map(d => d.count) || [],
      backgroundColor: COLORS,
      borderWidth: 0,
    }],
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white transition mt-1 text-lg">←</button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{url.pageTitle || shortCode}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 font-mono text-sm transition">{url.shortUrl}</a>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 text-sm truncate max-w-xs">{url.originalUrl}</span>
              {/* Public stats share */}
              <button
                onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/stats/${shortCode}`); addToast('Public stats link copied!', 'success'); }}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg transition"
              >
                📤 Share Stats
              </button>
            </div>
          </div>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Clicks', value: totalClicks?.toLocaleString(), icon: '👆', color: 'text-indigo-400' },
            { label: 'Safety Score', value: `${url.safetyScore}/100`, icon: '🛡️', color: url.safetyScore >= 80 ? 'text-emerald-400' : url.safetyScore >= 50 ? 'text-amber-400' : 'text-red-400' },
            { label: 'Last Visited', value: lastVisited ? new Date(lastVisited).toLocaleDateString() : 'Never', icon: '🕐', color: 'text-purple-400' },
            { label: 'Created', value: new Date(url.createdAt).toLocaleDateString(), icon: '📅', color: 'text-slate-300' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <p className="text-slate-400 text-xs mb-1">{icon} {label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Daily chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">📈 Daily Clicks (Last 30 Days)</h3>
          <div className="h-56">
            <Line data={dailyChartData} options={chartOpts} />
          </div>
        </div>

        {/* Breakdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BreakdownCard title="📱 Device Breakdown" data={deviceBreakdown} />
          <BreakdownCard title="🌐 Browser Breakdown" data={browserBreakdown} />
          <BreakdownCard title="🌍 Country Breakdown" data={countryBreakdown} />
        </div>

        {/* AI Prediction + Recent Visits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prediction && (
            <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-600/20 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-indigo-400 mb-4">🤖 AI Click Prediction</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-slate-400 mb-1">This Week</p>
                  <p className="text-2xl font-bold text-white">{prediction.currentWeekClicks}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Next Week</p>
                  <p className="text-2xl font-bold text-indigo-400">{prediction.predictedNextWeek}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Growth</p>
                  <p className={`text-2xl font-bold ${prediction.growthRate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {prediction.growthRate >= 0 ? '+' : ''}{prediction.growthRate}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recent history */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">🕐 Recent Visits</h3>
            {!recentHistory?.length ? (
              <p className="text-slate-500 text-sm">No visits yet.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentHistory.slice(0, 10).map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800 last:border-0">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span>{h.device === 'Mobile' ? '📱' : '💻'}</span>
                      <span>{h.browser}</span>
                      <span className="text-slate-500">·</span>
                      <span>{h.country}</span>
                    </div>
                    <span className="text-slate-500">{new Date(h.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
