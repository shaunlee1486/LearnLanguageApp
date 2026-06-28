'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useReviewSessionStore } from '../../../../stores/reviewSessionStore';
import { Trophy, CheckCircle, Clock, Target, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ReviewSummaryPage() {
  const router = useRouter();
  const { summary, resetSession } = useReviewSessionStore();

  useEffect(() => {
    if (!summary) {
      router.replace('/review');
    }
    
    // Cleanup on unmount
    return () => {
      resetSession();
    };
  }, [summary, router, resetSession]);

  if (!summary) return null;

  return (
    <div className="max-w-2xl mx-auto py-10 pb-20">
      <div className="text-center mb-10 animate-in slide-in-from-bottom-8 duration-500">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-500/20 text-indigo-400 rounded-full mb-6 ring-4 ring-indigo-500/10">
          <Trophy className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold text-slate-100 mb-4">Session Complete!</h1>
        <p className="text-slate-400 text-lg">Great job. Here's how you did.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        {/* Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg">
          <Target className="w-8 h-8 text-emerald-400 mb-3" />
          <span className="text-4xl font-bold text-slate-100 mb-1">{summary.scorePercentage}%</span>
          <span className="text-slate-500">Accuracy</span>
        </div>

        {/* Time */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg">
          <Clock className="w-8 h-8 text-indigo-400 mb-3" />
          <span className="text-4xl font-bold text-slate-100 mb-1">
            {Math.floor(summary.durationSeconds / 60)}:{(summary.durationSeconds % 60).toString().padStart(2, '0')}
          </span>
          <span className="text-slate-500">Time Spent</span>
        </div>
        
        {/* Total Words */}
        <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-800 rounded-full text-slate-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-100">{summary.correctCount} / {summary.totalWords}</div>
              <div className="text-slate-500">Words Mastered Today</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link 
          href="/review"
          className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors text-center"
        >
          Back to List
        </Link>
        <Link 
          href="/dashboard"
          className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
        >
          View Progress
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
