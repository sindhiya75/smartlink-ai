// src/components/dashboard/CreateUrlForm.js
import React, { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function CreateUrlForm({ onCreated }) {
  const [form, setForm] = useState({ originalUrl: '', customAlias: '', expiryDate: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.originalUrl) return addToast('Please enter a URL.', 'error');
    setLoading(true);
    setResult(null);
    try {
      const payload = { originalUrl: form.originalUrl };
      if (form.customAlias.trim()) payload.customAlias = form.customAlias.trim();
      if (form.expiryDate) payload.expiryDate = form.expiryDate;

      const { data } = await api.post('/api/url/create', payload);
      setResult(data.url);
      onCreated?.();
      addToast('Link created successfully! 🎉', 'success');
      setForm({ originalUrl: '', customAlias: '', expiryDate: '' });
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to create link.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Create a Short Link</h2>
        <p className="text-slate-400 text-sm">Paste your long URL and get an AI-powered smart link.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Destination URL *</label>
          <input
            type="url"
            placeholder="https://example.com/your-very-long-url"
            value={form.originalUrl}
            onChange={e => setForm({ ...form, originalUrl: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* Custom Alias + Expiry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Custom Alias <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
              <span className="px-3 text-slate-500 text-sm border-r border-slate-700 py-3 bg-slate-700/50">sl.ink/</span>
              <input
                type="text"
                placeholder="my-link"
                value={form.customAlias}
                onChange={e => setForm({ ...form, customAlias: e.target.value })}
                className="flex-1 bg-transparent px-3 py-3 text-white placeholder-slate-500 focus:outline-none text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Expiry Date <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              type="datetime-local"
              value={form.expiryDate}
              onChange={e => setForm({ ...form, expiryDate: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Generating AI summary...</>
          ) : (
            <><span>⚡</span> Shorten URL</>
          )}
        </button>
      </form>

      {/* Result Card */}
      {result && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <span>✅</span> Link Created!
          </div>

          {/* Short URL */}
          <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3">
            <span className="text-indigo-400 font-mono text-sm flex-1 truncate">{result.shortUrl}</span>
            <button onClick={() => copyToClipboard(result.shortUrl)} className="text-slate-400 hover:text-white transition text-lg" title="Copy">📋</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI Summary */}
            {result.aiSummary && (
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-2">🤖 AI Summary</p>
                <p className="text-sm text-white font-medium mb-1">{result.pageTitle}</p>
                <p className="text-xs text-slate-400">{result.aiSummary}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-600/20 text-indigo-400 rounded-full text-xs">{result.category}</span>
              </div>
            )}

            {/* Safety Score */}
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2">🛡️ Safety Score</p>
              <div className="flex items-end gap-2 mb-2">
                <span className={`text-2xl font-bold ${result.safetyScore >= 80 ? 'text-emerald-400' : result.safetyScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {result.safetyScore}
                </span>
                <span className="text-slate-400 text-sm mb-1">/100</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${result.safetyScore >= 80 ? 'bg-emerald-400' : result.safetyScore >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                  style={{ width: `${result.safetyScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* QR Code */}
          {result.qrCode && (
            <div className="flex items-center gap-4 bg-slate-800 rounded-xl p-4">
              <img src={result.qrCode} alt="QR Code" className="w-20 h-20 rounded-lg bg-white p-1" />
              <div>
                <p className="text-sm font-medium text-white mb-1">📱 QR Code</p>
                <p className="text-xs text-slate-400 mb-2">Scan to visit the link</p>
                <a
                  href={result.qrCode}
                  download={`qr-${result.shortCode}.png`}
                  className="text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-3 py-1.5 rounded-lg transition"
                >
                  ⬇ Download QR
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
