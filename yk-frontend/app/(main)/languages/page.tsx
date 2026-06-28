'use client';

import React, { useEffect, useState } from 'react';
import { useLanguageStore } from '../../../stores/languageStore';
import { Plus, Check, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LanguagesPage() {
  const router = useRouter();
  const { languages, userLanguages, fetchLanguages, fetchUserLanguages, addUserLanguage, isLoading, error } = useLanguageStore();
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLanguages();
    fetchUserLanguages();
  }, [fetchLanguages, fetchUserLanguages]);

  const handleAddLanguage = async (id: string) => {
    setAddingId(id);
    await addUserLanguage(id);
    setAddingId(null);
  };

  const isLanguageAdded = (id: string) => {
    return userLanguages.some(l => l.id === id);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard" 
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Languages</h1>
          <p className="text-slate-400 mt-1">Add languages you want to learn to your profile</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {isLoading && languages.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languages.map(lang => {
            const added = isLanguageAdded(lang.id);
            const isAdding = addingId === lang.id;
            
            return (
              <div 
                key={lang.id} 
                className={`p-6 rounded-2xl border transition-all ${
                  added 
                    ? 'bg-emerald-500/5 border-emerald-500/20' 
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-200">{lang.name}</h3>
                  {added ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : null}
                </div>
                
                <p className="text-sm text-slate-400 mb-6">
                  {lang.code.toUpperCase()}
                </p>
                
                <button
                  onClick={() => handleAddLanguage(lang.id)}
                  disabled={added || isAdding}
                  className={`w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                    added 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : added ? (
                    <>
                      <Check className="w-4 h-4" /> Added to profile
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Add Language
                    </>
                  )}
                </button>
              </div>
            );
          })}
          
          {languages.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              No languages available in the system yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
