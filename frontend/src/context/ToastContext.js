// src/context/ToastContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove }) => (
  <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    {toasts.map(toast => (
      <div
        key={toast.id}
        onClick={() => onRemove(toast.id)}
        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium cursor-pointer animate-slide-up max-w-sm backdrop-blur-sm
          ${toast.type === 'success' ? 'bg-emerald-500/90 text-white' : ''}
          ${toast.type === 'error' ? 'bg-red-500/90 text-white' : ''}
          ${toast.type === 'info' ? 'bg-indigo-500/90 text-white' : ''}
          ${toast.type === 'warning' ? 'bg-amber-500/90 text-white' : ''}
        `}
      >
        <span className="text-lg">
          {toast.type === 'success' && '✅'}
          {toast.type === 'error' && '❌'}
          {toast.type === 'info' && 'ℹ️'}
          {toast.type === 'warning' && '⚠️'}
        </span>
        <span>{toast.message}</span>
      </div>
    ))}
  </div>
);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
