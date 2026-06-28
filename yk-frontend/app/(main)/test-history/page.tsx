'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Clock, Award, Target, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../../lib/api';

interface TestHistoryItem {
  id: string;
  testType: string;
  score: number;
  totalQuestions: number;
  duration: number;
  takenAt: string;
}

export default function TestHistoryPage() {
  const [history, setHistory] = useState<TestHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  const fetchHistory = async (p: number) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/tests/custom/history?page=${p}&pageSize=10`);
      if (response.data.success) {
        setHistory(response.data.data.items || []);
        setTotalPages(response.data.data.meta?.totalPages || 1);
        setTotalCount(response.data.data.meta?.totalItems || 0);
      }
    } catch (err) {
      console.error('Failed to fetch test history', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
          <Activity className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Test History</h1>
          <p className="text-slate-400">Review your past performance and test scores.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-slate-200">All Completed Tests</h2>
          <span className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded-full text-sm font-medium">
            {totalCount} Total
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20">
            <Target className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-300 mb-2">No Test History</h3>
            <p className="text-slate-500">You haven't completed any custom tests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const percentage = Math.round((item.score / item.totalQuestions) * 100);
              const isGood = percentage >= 80;
              const isMedium = percentage >= 50 && percentage < 80;

              return (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-2xl transition-colors gap-4">
                  
                  <div className="flex items-start sm:items-center gap-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
                      isGood ? 'bg-emerald-500/10 text-emerald-400 shadow-emerald-500/10' : 
                      isMedium ? 'bg-yellow-500/10 text-yellow-400 shadow-yellow-500/10' : 
                      'bg-rose-500/10 text-rose-400 shadow-rose-500/10'
                    }`}>
                      <span className="text-xl font-black">{percentage}%</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-slate-200 capitalize">{item.testType} Test</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> {formatDate(item.takenAt)}</span>
                        <span className="hidden sm:inline text-slate-600">•</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatDuration(item.duration)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:pl-6 sm:border-l border-slate-700">
                    <div className="text-center">
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Score</div>
                      <div className="text-xl font-bold text-slate-300">
                        <span className={isGood ? 'text-emerald-400' : isMedium ? 'text-yellow-400' : 'text-rose-400'}>{item.score}</span> 
                        <span className="text-slate-600"> / {item.totalQuestions}</span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-800">
            <span className="text-sm text-slate-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
