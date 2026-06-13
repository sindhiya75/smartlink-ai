// src/components/dashboard/UrlTable.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

// ─── QR Modal ────────────────────────────────────────────────────────────────
function QrModal({ url, onClose }) {
  const [imgSrc, setImgSrc] = useState(null); // blob object URL
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch the PNG via Axios (sends Authorization header automatically)
  React.useEffect(() => {
    let objectUrl;
    api.get(`/api/url/${url._id}/qr`, { responseType: 'blob' })
      .then(res => {
        objectUrl = URL.createObjectURL(res.data);
        setImgSrc(objectUrl);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [url._id]);

  const handleDownload = () => {
    if (!imgSrc) return;
    const a = document.createElement('a');
    a.href = imgSrc;
    a.download = `qr-${url.shortCode}.png`;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-80 flex flex-col items-center gap-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">📱 QR Code</p>
            <p className="text-slate-400 text-xs mt-0.5 font-mono truncate max-w-[200px]">
              {url.shortUrl?.replace(/^https?:\/\/[^/]+\//, '') || url.shortCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition text-lg leading-none"
            aria-label="Close QR modal"
          >
            ✕
          </button>
        </div>

        {/* QR Image */}
        <div className="bg-white rounded-xl p-3 w-52 h-52 flex items-center justify-center">
          {loading && (
            <span className="animate-spin w-6 h-6 border-2 border-slate-300 border-t-indigo-500 rounded-full" />
          )}
          {error && (
            <p className="text-red-400 text-xs text-center">Failed to load QR code</p>
          )}
          {imgSrc && (
            <img
              src={imgSrc}
              alt={`QR code for ${url.shortCode}`}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Info */}
        <p className="text-slate-400 text-xs text-center">
          Scan with any QR scanner to visit the link
        </p>

        {/* Actions */}
        <div className="flex gap-2 w-full">
          <button
            onClick={handleDownload}
            disabled={loading || error || !imgSrc}
            className="flex-1 bg-indigo-600/20 hover:bg-indigo-600/30 disabled:opacity-40 text-indigo-400 text-sm font-medium py-2.5 rounded-xl transition"
          >
            ⬇ Download PNG
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium py-2.5 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Table ───────────────────────────────────────────────────────────────
export default function UrlTable({ urls, onRefresh }) {
  const [deleting, setDeleting] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editUrl, setEditUrl] = useState('');
  const [qrUrl, setQrUrl] = useState(null); // url object to show in QR modal
  const { addToast } = useToast();
  const navigate = useNavigate();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Copied!', 'success');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this link? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/api/url/${id}`);
      addToast('Link deleted.', 'info');
      onRefresh?.();
    } catch (err) {
      addToast('Failed to delete.', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = async (id) => {
    if (!editUrl.trim()) return;
    try {
      await api.put(`/api/url/${id}`, { originalUrl: editUrl });
      addToast('Link updated!', 'success');
      setEditing(null);
      onRefresh?.();
    } catch (err) {
      addToast(err.response?.data?.error || 'Update failed.', 'error');
    }
  };

  const getSafetyColor = (score) => {
    if (score === null || score === undefined) return 'text-slate-500';
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  if (!urls?.length) {
    return (
      <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="text-5xl mb-4">🔗</div>
        <p className="text-slate-300 font-medium mb-2">No links yet</p>
        <p className="text-slate-500 text-sm">Create your first shortened link to get started.</p>
      </div>
    );
  }

  return (
    <>
      {/* QR Modal */}
      {qrUrl && <QrModal url={qrUrl} onClose={() => setQrUrl(null)} />}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Desktop table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Link</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Short URL</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Clicks</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Safety</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {urls.map(url => (
                <tr key={url._id} className="hover:bg-slate-800/30 transition group">
                  {/* Original URL */}
                  <td className="px-4 py-3">
                    {editing === url._id ? (
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={editUrl}
                          onChange={e => setEditUrl(e.target.value)}
                          className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          autoFocus
                        />
                        <button onClick={() => handleEdit(url._id)} className="text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-2 py-1 rounded-lg transition">Save</button>
                        <button onClick={() => setEditing(null)} className="text-xs text-slate-400 hover:text-white transition">✕</button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-white font-medium truncate max-w-xs" title={url.originalUrl}>
                          {url.pageTitle || new URL(url.originalUrl).hostname.replace('www.', '')}
                        </p>
                        <p className="text-slate-500 text-xs truncate max-w-xs">{url.originalUrl}</p>
                        {url.isExpired && <span className="text-xs text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">Expired</span>}
                        {url.category && url.category !== 'Uncategorized' && (
                          <span className="text-xs text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded ml-1">{url.category}</span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Short URL */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 font-mono text-xs transition">
                        {url.shortUrl?.replace(/^https?:\/\/[^/]+\//, '').slice(0, 15) || url.shortCode}
                      </a>
                      <button onClick={() => copyToClipboard(url.shortUrl)} className="text-slate-500 hover:text-white transition opacity-0 group-hover:opacity-100 text-xs">📋</button>
                    </div>
                  </td>

                  {/* Clicks */}
                  <td className="px-4 py-3">
                    <span className="text-white font-semibold">{url.clickCount?.toLocaleString()}</span>
                  </td>

                  {/* Safety */}
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${getSafetyColor(url.safetyScore)}`}>
                      {url.safetyScore !== null && url.safetyScore !== undefined ? `${url.safetyScore}/100` : '—'}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(url.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => copyToClipboard(url.shortUrl)} title="Copy" className="p-1.5 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white text-base">📋</button>
                      <button
                        onClick={() => setQrUrl(url)}
                        title="QR Code"
                        className="p-1.5 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white text-base"
                      >
                        ▣
                      </button>
                      <button onClick={() => navigate(`/analytics/${url.shortCode}`)} title="Analytics" className="p-1.5 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white text-base">📊</button>
                      <button onClick={() => { setEditing(url._id); setEditUrl(url.originalUrl); }} title="Edit" className="p-1.5 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white text-base">✏️</button>
                      <button
                        onClick={() => handleDelete(url._id)}
                        disabled={deleting === url._id}
                        title="Delete"
                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition text-slate-400 hover:text-red-400 text-base disabled:opacity-50"
                      >
                        {deleting === url._id ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
