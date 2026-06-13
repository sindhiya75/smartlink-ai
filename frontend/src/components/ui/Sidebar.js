// src/components/ui/Sidebar.js
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const navItems = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/dashboard?tab=urls', icon: '🔗', label: 'My Links' },
  { path: '/dashboard?tab=create', icon: '✨', label: 'Create Link' },
  { path: '/dashboard?tab=charts', icon: '📊', label: 'Charts' },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully.', 'info');
    navigate('/login');
  };

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0`}>
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-slate-800">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-lg shrink-0">⚡</div>
        {!collapsed && (
          <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SmartLink AI</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-slate-500 hover:text-white transition p-1"
          title="Toggle sidebar"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {[
          { tab: 'overview', icon: '🏠', label: 'Overview' },
          { tab: 'urls', icon: '🔗', label: 'My Links' },
          { tab: 'create', icon: '✨', label: 'Create Link' },
          { tab: 'charts', icon: '📊', label: 'Charts' },
        ].map(({ tab, icon, label }) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="text-lg shrink-0">{icon}</span>
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-800">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <span className="text-lg shrink-0">🚪</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
