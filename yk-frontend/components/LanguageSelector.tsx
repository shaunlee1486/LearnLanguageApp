'use client';

import React, { useEffect, useState } from 'react';
import { useLanguageStore } from '../stores/languageStore';
import { useAuthStore } from '../stores/authStore';
import { ChevronDown, Plus } from 'lucide-react';
import Link from 'next/link';

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const { userLanguages, activeLanguageId, fetchUserLanguages, setActiveLanguage } = useLanguageStore();

  useEffect(() => {
    if (user) {
      fetchUserLanguages();
    }
  }, [user, fetchUserLanguages]);

  // Sync activeLanguageId with user.activeLanguageId on initial load
  useEffect(() => {
    if (user && (user as any).activeLanguageId && !activeLanguageId) {
       // We might need to handle this in authStore, but for now we'll set it here if missing
       useLanguageStore.setState({ activeLanguageId: (user as any).activeLanguageId });
    }
  }, [user, activeLanguageId]);

  const activeLanguage = userLanguages.find(l => l.id === activeLanguageId);

  const handleSelectLanguage = async (id: string) => {
    await setActiveLanguage(id);
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all"
      >
        <span>{activeLanguage ? activeLanguage.name : 'Select Language'}</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 w-64 mt-2 origin-top-right bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden backdrop-blur-xl">
            <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/80">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Languages</p>
            </div>
            
            <div className="py-1 max-h-64 overflow-y-auto">
              {userLanguages.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400 italic">No languages added yet.</div>
              ) : (
                userLanguages.map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => handleSelectLanguage(lang.id)}
                    className={`flex items-center w-full px-4 py-3 text-sm text-left transition-colors ${
                      lang.id === activeLanguageId
                        ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
                    }`}
                  >
                    <span className="flex-1">{lang.name}</span>
                    {lang.id === activeLanguageId && (
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                    )}
                  </button>
                ))
              )}
            </div>
            
            <div className="p-2 border-t border-slate-700/50 bg-slate-800/80">
              <Link 
                href="/languages" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Language
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
