// src/pages/ExpiredPage.js
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function ExpiredPage() {
  const [params] = useSearchParams();
  const code = params.get('code');

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center animate-fade-in max-w-sm">
        <div className="text-8xl mb-6">⏰</div>
        <h1 className="text-2xl font-bold text-white mb-2">Link Expired</h1>
        <p className="text-slate-400 text-sm mb-2">
          This short link{code ? ` (/${code})` : ''} has passed its expiry date and is no longer active.
        </p>
        <p className="text-slate-500 text-xs mb-6">The owner may extend the expiry or create a new link.</p>
        <Link to="/dashboard" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium transition">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
