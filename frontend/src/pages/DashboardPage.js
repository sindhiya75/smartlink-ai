// src/pages/DashboardPage.js
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/ui/Sidebar';
import StatsCards from '../components/dashboard/StatsCards';
import UrlTable from '../components/dashboard/UrlTable';
import CreateUrlForm from '../components/dashboard/CreateUrlForm';
import Charts from '../components/dashboard/Charts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [urls, setUrls] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [urlsRes, statsRes] = await Promise.all([
        api.get('/api/url/all'),
        api.get('/api/url/stats/summary'),
      ]);
      setUrls(urlsRes.data.urls || []);
      setStats(statsRes.data.stats || {});
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
              <p className="text-slate-400 text-sm mt-1">Here's what's happening with your links.</p>
            </div>
            <StatsCards stats={stats} loading={loading} />
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Recent Links</h2>
                <button onClick={() => setActiveTab('urls')} className="text-indigo-400 hover:text-indigo-300 text-sm transition">View all →</button>
              </div>
              <UrlTable urls={urls.slice(0, 5)} onRefresh={fetchData} />
            </div>
          </div>
        );
      case 'urls':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">My Links</h1>
                <p className="text-slate-400 text-sm mt-1">{urls.length} link{urls.length !== 1 ? 's' : ''} total</p>
              </div>
              <button
                onClick={() => setActiveTab('create')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2"
              >
                <span>+</span> New Link
              </button>
            </div>
            <UrlTable urls={urls} onRefresh={fetchData} />
          </div>
        );
      case 'create':
        return (
          <div className="max-w-2xl animate-fade-in">
            <CreateUrlForm onCreated={fetchData} />
          </div>
        );
      case 'charts':
        return (
          <div className="animate-fade-in">
            <Charts urls={urls} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
