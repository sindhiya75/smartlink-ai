// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PublicStatsPage from './pages/PublicStatsPage';
import NotFoundPage from './pages/NotFoundPage';
import ExpiredPage from './pages/ExpiredPage';
import LandingPage from './pages/LandingPage';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
  </div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public-only route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/analytics/:shortCode" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/stats/:shortCode" element={<PublicStatsPage />} />
      <Route path="/expired" element={<ExpiredPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  // Dark mode default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-slate-950 text-white font-sans">
            <AppRoutes />
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
