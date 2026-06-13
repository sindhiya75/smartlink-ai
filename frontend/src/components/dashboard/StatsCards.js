// src/components/dashboard/StatsCards.js
import React from 'react';

export default function StatsCards({ stats, loading }) {
  const cards = [
    {
      label: 'Total Links',
      value: stats?.totalUrls ?? 0,
      icon: '🔗',
      color: 'from-indigo-600/20 to-indigo-600/5',
      border: 'border-indigo-600/20',
      textColor: 'text-indigo-400',
    },
    {
      label: 'Total Clicks',
      value: stats?.totalClicks?.toLocaleString() ?? 0,
      icon: '👆',
      color: 'from-purple-600/20 to-purple-600/5',
      border: 'border-purple-600/20',
      textColor: 'text-purple-400',
    },
    {
      label: "Today's Clicks",
      value: stats?.todayClicks?.toLocaleString() ?? 0,
      icon: '⚡',
      color: 'from-amber-600/20 to-amber-600/5',
      border: 'border-amber-600/20',
      textColor: 'text-amber-400',
    },
    {
      label: 'Top Link',
      value: stats?.mostClicked
        ? `${stats.mostClicked.clickCount} clicks`
        : 'No links yet',
      sub: stats?.mostClicked?.pageTitle || stats?.mostClicked?.shortCode,
      icon: '🏆',
      color: 'from-emerald-600/20 to-emerald-600/5',
      border: 'border-emerald-600/20',
      textColor: 'text-emerald-400',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
            <div className="h-4 bg-slate-700 rounded mb-3 w-24" />
            <div className="h-8 bg-slate-700 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, icon, color, border, textColor }) => (
        <div key={label} className={`bg-gradient-to-br ${color} border ${border} rounded-2xl p-5 animate-fade-in`}>
          <div className="flex items-start justify-between mb-3">
            <p className="text-slate-400 text-sm font-medium">{label}</p>
            <span className="text-2xl">{icon}</span>
          </div>
          <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
          {sub && <p className="text-slate-500 text-xs mt-1 truncate">{sub}</p>}
        </div>
      ))}
    </div>
  );
}
