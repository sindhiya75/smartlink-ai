// src/pages/LandingPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ─── Animated counter ────────────────────────────────────────────────────────
function Counter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(end / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, gradient }) {
  return (
    <div className="group relative bg-slate-900/60 border border-slate-800 hover:border-slate-600 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${gradient}`} />
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${gradient}`}>
        {icon}
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [demoUrl, setDemoUrl] = useState('');

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* ── Ambient background blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-cyan-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-slate-800/60 backdrop-blur-sm bg-slate-950/80 sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-indigo-500/25">⚡</div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SmartLink AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how-it-works" className="hover:text-white transition">How it works</a>
          <a href="#stats" className="hover:text-white transition">Stats</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-slate-300 hover:text-white transition px-4 py-2 rounded-lg hover:bg-slate-800">
            Sign in
          </Link>
          <Link to="/register" className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20">
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 text-center px-6 pt-24 pb-20 md:pt-32 md:pb-28 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          AI-Powered URL Intelligence
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Shorten Links.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Amplify Insights.
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          SmartLink AI turns any URL into a smart, trackable link — with AI summaries, safety scores, QR codes, and real-time analytics in one sleek dashboard.
        </p>

        {/* Demo input */}
        <div className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto mb-6">
          <div className="flex-1 w-full flex items-center bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3.5 gap-3 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition">
            <span className="text-slate-500 text-lg">🔗</span>
            <input
              type="url"
              placeholder="Paste your long URL here..."
              value={demoUrl}
              onChange={e => setDemoUrl(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
            />
          </div>
          <Link
            to="/register"
            className="w-full sm:w-auto whitespace-nowrap bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-6 py-3.5 rounded-2xl transition-all shadow-xl shadow-indigo-500/25 text-sm"
          >
            ⚡ Shorten it free
          </Link>
        </div>
        <p className="text-slate-600 text-xs">No credit card required · Free forever plan</p>
      </section>

      {/* ── Stats strip ── */}
      <section id="stats" className="relative z-10 border-y border-slate-800/60 bg-slate-900/30 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6 text-center">
          {[
            { end: 50000, suffix: '+', label: 'Links Shortened' },
            { end: 2400000, suffix: '+', label: 'Total Clicks Tracked' },
            { end: 99, suffix: '%', label: 'Uptime' },
            { end: 100, suffix: '%', label: 'Free to Start' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                <Counter end={s.end} suffix={s.suffix} />
              </div>
              <div className="text-slate-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need in one place</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Built for marketers, developers, and creators who want more than just a short link.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard
            icon="🤖"
            title="AI Page Summaries"
            desc="Automatically generates title, description, and category for every URL using Google Gemini AI."
            gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
          />
          <FeatureCard
            icon="🛡️"
            title="Safety Scoring"
            desc="Every link gets a 0–100 safety score based on HTTPS, suspicious keywords, and domain analysis."
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <FeatureCard
            icon="📊"
            title="Real-time Analytics"
            desc="Track clicks by device, browser, OS, and country. Visual charts with 30-day trends."
            gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
          />
          <FeatureCard
            icon="📱"
            title="QR Code Generator"
            desc="Every short link gets a scannable QR code. Download as PNG for offline use instantly."
            gradient="bg-gradient-to-br from-pink-500 to-rose-600"
          />
          <FeatureCard
            icon="🔮"
            title="Click Prediction"
            desc="Linear regression model predicts next week's clicks based on your historical traffic data."
            gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          />
          <FeatureCard
            icon="⏰"
            title="Link Expiry"
            desc="Set custom expiry dates on links. Expired links show a branded page automatically."
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          />
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="relative z-10 px-6 py-24 bg-slate-900/30 border-y border-slate-800/50">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How it works</h2>
          <p className="text-slate-400">Three steps from long URL to smart link.</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
          {[
            { step: '01', icon: '📋', title: 'Paste your URL', desc: 'Drop any link — blog post, product page, video, or file — into the input.' },
            { step: '02', icon: '⚡', title: 'AI analyses it', desc: 'SmartLink AI fetches metadata, scores safety, and generates a summary in seconds.' },
            { step: '03', icon: '🚀', title: 'Share & track', desc: 'Share your short link anywhere. Watch clicks roll in on your live dashboard.' },
          ].map((item, i) => (
            <div key={i} className="relative text-center">
              {i < 2 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-px border-t border-dashed border-slate-700 -translate-x-1/2 z-0" />
              )}
              <div className="relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 text-3xl mb-4">{item.icon}</div>
              <div className="text-indigo-400 text-xs font-bold tracking-widest mb-2">{item.step}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 px-6 py-28 text-center max-w-3xl mx-auto">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 relative">
          Ready to make your links{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">smarter?</span>
        </h2>
        <p className="text-slate-400 text-lg mb-10 relative">Join thousands of users who track, analyse, and optimise their links with SmartLink AI.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
          <Link
            to="/register"
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-indigo-500/30 text-base"
          >
            🚀 Create free account
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all text-base"
          >
            Sign in →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-slate-800/60 py-8 px-6 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-xs">⚡</div>
          <span className="text-white font-semibold">SmartLink AI</span>
        </div>
      </footer>
    </div>
  );
}
