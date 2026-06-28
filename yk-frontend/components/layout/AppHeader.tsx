'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../stores/authStore';
import LanguageSelector from '../LanguageSelector';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AppHeader() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-900/80 border-b border-slate-800">
      <div className="flex items-center justify-between h-16 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              YK
            </span>
            <span className="hidden sm:inline-block text-sm font-medium text-slate-400 tracking-wider">
              LANGUAGE
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <LanguageSelector />
              
              <div className="h-6 w-px bg-slate-700/50 hidden sm:block"></div>
              
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-slate-200">{user.displayName}</span>
                  <span className="text-xs text-slate-500">{user.email}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  <UserIcon className="w-5 h-5" />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors ml-2"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors">
                Log in
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium text-slate-900 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
