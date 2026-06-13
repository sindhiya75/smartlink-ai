// src/pages/PublicStatsPage.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function PublicStatsPage() {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/api/analytics/public/${shortCode}`)
      .then(res => setData(res.data.data))
      .catch(() => setError('This link does not have public stats enabled or does not exist.'))
      .finally(() => setLoading(false));
  }, [shortCode]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-white font-semibold mb-2">Stats Not Found</p>
        <p className="text-slate-400 text-sm">{error}</p>
        <Link to="/" className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 text-sm transition">← Go home</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-base">⚡</div>
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SmartLink AI</span>
          </div>
          <h1 className="text-xl font-bold text-white">{data.url.pageTitle || shortCode}</h1>
          <p className="text-slate-400 text-sm mt-1">Public link statistics</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Clicks', value: data.totalClicks },
            { label: 'Safety Score', value: `${data.url.safetyScore}/100` },
            { label: 'Category', value: data.url.category || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
              <p className="text-slate-400 text-xs mb-1">{label}</p>
              <p className="text-xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {data.url.aiSummary && (
          <div className="bg-slate-900 border border-indigo-600/20 rounded-2xl p-5">
            <p className="text-xs text-indigo-400 font-semibold mb-2">🤖 AI Summary</p>
            <p className="text-slate-300 text-sm">{data.url.aiSummary}</p>
          </div>
        )}

        <p className="text-center text-slate-600 text-xs">
          Powered by{' '}
          <a href="https://katomaran.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition">SmartLink AI</a>
        </p>
      </div>
    </div>
  );
}
