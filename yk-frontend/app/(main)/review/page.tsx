'use client';

import React, { useEffect, useState } from 'react';
import { useWordStore } from '../../../stores/wordStore';
import { useLanguageStore } from '../../../stores/languageStore';
import { BookOpen, Trash2, PlayCircle, FolderOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ReviewListPage() {
  const { reviewWords, fetchReviewList, removeFromReviewList, isLoading, error } = useWordStore();
  const { activeLanguageId, userLanguages } = useLanguageStore();

  useEffect(() => {
    if (activeLanguageId) {
      fetchReviewList(activeLanguageId);
    }
  }, [activeLanguageId, fetchReviewList]);

  const activeLanguage = userLanguages.find(l => l.id === activeLanguageId);

  const handleRemove = async (wordId: string) => {
    if (activeLanguageId) {
      await removeFromReviewList(activeLanguageId, wordId);
    }
  };

  if (!activeLanguageId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FolderOpen className="w-16 h-16 text-slate-700 mb-6" />
        <h2 className="text-2xl font-bold text-slate-300 mb-2">No Language Selected</h2>
        <p className="text-slate-500 mb-8 text-center max-w-md">
          Please select an active language to view your review list.
        </p>
        <Link 
          href="/languages" 
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-colors"
        >
          Manage Languages
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            Review List
            {activeLanguage && (
              <span className="text-sm px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                {activeLanguage.name}
              </span>
            )}
          </h1>
          <p className="text-slate-400 mt-1">Words you've selected to study</p>
        </div>
        
        {reviewWords.length > 0 && (
          <button
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            <BookOpen className="w-4 h-4" />
            Start Study Session
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {isLoading && reviewWords.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
      ) : reviewWords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-700/50 rounded-2xl bg-slate-900/30">
          <BookOpen className="w-16 h-16 text-slate-700 mb-4" />
          <h3 className="text-xl font-bold text-slate-300 mb-2">Your review list is empty</h3>
          <p className="text-slate-500 mb-6 text-center max-w-md">
            Go to your categories and select words to add to your review list.
          </p>
          <Link
            href="/categories"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors"
          >
            Browse Categories
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewWords.map((word) => (
            <div key={word.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:border-indigo-500/30 transition-colors group">
              <div className="flex items-center gap-4">
                {word.imageUrl ? (
                  <img 
                    src={process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') + word.imageUrl} 
                    alt={word.text} 
                    className="w-16 h-16 rounded-xl object-cover bg-slate-800 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                    <span className="text-2xl text-slate-600 font-bold">{word.text.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-slate-200">{word.text}</h3>
                    {word.audioUrl && (
                      <button 
                        onClick={() => new Audio(word.audioUrl!).play().catch(() => {})}
                        className="text-slate-500 hover:text-indigo-400 transition-colors"
                      >
                        <PlayCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {word.ipa && <div className="text-sm text-slate-500 font-mono mb-2">{word.ipa}</div>}
                  
                  <div className="text-sm text-slate-300">
                    {word.meanings[0]?.meaningText || 'No meaning provided'}
                    {word.meanings.length > 1 && <span className="text-slate-500 ml-2">+{word.meanings.length - 1} more</span>}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => handleRemove(word.id)}
                className="shrink-0 p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors sm:opacity-0 group-hover:opacity-100"
                title="Remove from review list"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
