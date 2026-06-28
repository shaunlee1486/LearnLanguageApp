'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Brain, LayoutGrid, Loader2, Type } from 'lucide-react';
import Link from 'next/link';
import api from '../../../../lib/api';
import { useLanguageStore } from '../../../../stores/languageStore';
import { useReviewSessionStore } from '../../../../stores/reviewSessionStore';

export default function ReviewStartPage() {
  const router = useRouter();
  const { activeLanguageId } = useLanguageStore();
  const { setCurrentSession } = useReviewSessionStore();
  const [wordLimit, setWordLimit] = useState(10);
  const [mode, setMode] = useState<'FlashCards' | 'Quiz' | 'TypeAnswer'>('Quiz');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartSession = async () => {
    if (!activeLanguageId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Map modes to the enum integers (FlashCards=0, Quiz=1, TypeAnswer=2)
      let modeInt = 1;
      if (mode === 'FlashCards') modeInt = 0;
      if (mode === 'TypeAnswer') modeInt = 2;

      const response = await api.post('/review/start', {
        wordLimit,
        mode: modeInt
      });

      if (response.data.success) {
        const sessionDto = response.data.data;
        setCurrentSession(sessionDto);
        router.push(`/review/session/${sessionDto.id}`);
      } else {
        setError(response.data.errors?.[0] || 'Failed to start session');
      }
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || 'An error occurred while starting the session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <Link href="/review" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Review List
      </Link>
      
      <h1 className="text-3xl font-bold text-slate-100 mb-2">Configure Session</h1>
      <p className="text-slate-400 mb-8">Choose how you want to study today.</p>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      <div className="space-y-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        {/* Word Limit */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Number of words to review</label>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={wordLimit}
            onChange={(e) => setWordLimit(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-slate-500 text-sm">5 words</span>
            <span className="text-2xl font-bold text-indigo-400">{wordLimit}</span>
            <span className="text-slate-500 text-sm">50 words</span>
          </div>
        </div>

        {/* Study Mode */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Study Mode</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setMode('FlashCards')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                mode === 'FlashCards' 
                  ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/10' 
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <LayoutGrid className="w-8 h-8" />
              <span className="font-semibold">Flash Cards</span>
            </button>
            <button
              onClick={() => setMode('Quiz')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                mode === 'Quiz' 
                  ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/10' 
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <Brain className="w-8 h-8" />
              <span className="font-semibold">Quiz</span>
            </button>
            <button
              onClick={() => setMode('TypeAnswer')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                mode === 'TypeAnswer' 
                  ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/10' 
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <Type className="w-8 h-8" />
              <span className="font-semibold">Type Answer</span>
            </button>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartSession}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 text-lg mt-4"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
          {isLoading ? 'Preparing session...' : 'Start Session'}
        </button>
      </div>
    </div>
  );
}
