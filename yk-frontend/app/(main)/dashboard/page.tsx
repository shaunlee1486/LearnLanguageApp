'use client';

import React from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-100 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/categories" className="block p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-colors group">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            📁
          </div>
          <h2 className="text-xl font-bold text-slate-200 mb-2">Categories</h2>
          <p className="text-slate-400 text-sm">Manage your vocabulary categories and word lists.</p>
        </Link>
        
        <Link href="/languages" className="block p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-cyan-500/50 transition-colors group">
          <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            🌐
          </div>
          <h2 className="text-xl font-bold text-slate-200 mb-2">Languages</h2>
          <p className="text-slate-400 text-sm">Add or change the languages you are learning.</p>
        </Link>
      </div>
    </div>
  );
}
