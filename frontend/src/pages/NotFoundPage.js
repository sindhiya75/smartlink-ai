// src/pages/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <p className="text-slate-400 mb-6">This link doesn't exist or has been deleted.</p>
        <Link to="/dashboard" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium transition">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
