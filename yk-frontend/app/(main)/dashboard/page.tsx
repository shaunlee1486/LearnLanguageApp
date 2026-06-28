'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguageStore } from '../../../stores/languageStore';
import api from '../../../lib/api';
import { 
  Flame, 
  BrainCircuit, 
  BookOpen, 
  Library, 
  Network, 
  Activity, 
  Clock,
  ChevronRight,
  ChevronRight,
  TrendingUp,
  Award,
  BookA
} from 'lucide-react';

interface RecentTestScore {
  testType: string;
  score: number;
  totalQuestions: number;
  takenAt: string;
}

interface DashboardStats {
  totalWordsLearned: number;
  totalWordsKnown: number;
  wordsDueForReview: number;
  totalGrammars: number;
  totalStructures: number;
  currentStreak: number;
  longestStreak: number;
  recentTestScores: RecentTestScore[];
}

export default function DashboardPage() {
  const { activeLanguageId, userLanguages } = useLanguageStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeLanguageId) {
      fetchStats();
    }
  }, [activeLanguageId]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeLanguage = userLanguages.find(l => l.id === activeLanguageId);

  // Get greeting based on time of day
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';

  if (!activeLanguageId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <Library className="w-16 h-16 text-slate-700 mb-6" />
        <h2 className="text-2xl font-bold text-slate-300 mb-2">Welcome to YK Language Learning</h2>
        <p className="text-slate-500">Please select a language from the sidebar to view your dashboard.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400">Loading your progress...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-3xl p-8 overflow-hidden shadow-2xl shadow-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-purple-400 opacity-10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{greeting}!</h1>
            <p className="text-indigo-100 flex items-center gap-2">
              You are currently studying 
              <span className="font-bold bg-white/20 px-3 py-1 rounded-full text-sm">
                {activeLanguage?.name}
              </span>
            </p>
          </div>
          
          <div className="flex items-center gap-6 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Flame className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-indigo-100 mb-1">Current Streak</div>
                <div className="text-3xl font-bold text-white leading-none">
                  {stats?.currentStreak || 0} <span className="text-lg text-indigo-200 font-normal">days</span>
                </div>
              </div>
            </div>
            <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-indigo-100 mb-1">Best Streak</div>
              <div className="text-xl font-bold text-white leading-none">
                {stats?.longestStreak || 0} <span className="text-sm text-indigo-200 font-normal">days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Actions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-all shadow-lg hover:shadow-emerald-500/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-4">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">Review Session</h3>
                <p className="text-slate-400 text-sm mb-6">
                  {stats?.wordsDueForReview ? (
                    <span className="text-emerald-400 font-medium">{stats.wordsDueForReview} words due for review today.</span>
                  ) : (
                    <span>No words due today, but you can still practice.</span>
                  )}
                </p>
                <Link 
                  href="/review/start" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                >
                  Start Review <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-all shadow-lg hover:shadow-indigo-500/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-500/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
                  <Library className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">Vocabulary</h3>
                <p className="text-slate-400 text-sm mb-6">
                  You have learned a total of <span className="text-indigo-400 font-medium">{stats?.totalWordsLearned || 0}</span> words. Keep it up!
                </p>
                <Link 
                  href="/categories" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors"
                >
                  Browse Words <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-purple-500/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">Custom Test</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Challenge yourself with a mixed test of words and grammar.
                </p>
                <Link 
                  href="/test-builder" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20"
                >
                  Build Test <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" /> Your Knowledge Base
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <div className="text-slate-400 text-sm font-medium mb-1">Words Learned</div>
                <div className="text-3xl font-bold text-slate-100">{stats?.totalWordsLearned || 0}</div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <div className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-1">
                  Words Known <Award className="w-3 h-3 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-yellow-400">{stats?.totalWordsKnown || 0}</div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <div className="text-slate-400 text-sm font-medium mb-1">Grammar Rules</div>
                <div className="text-3xl font-bold text-slate-100">{stats?.totalGrammars || 0}</div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <div className="text-slate-400 text-sm font-medium mb-1">Structures</div>
                <div className="text-3xl font-bold text-slate-100">{stats?.totalStructures || 0}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Recent Activity & Grammar */}
        <div className="space-y-8">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" /> Recent Activity
            </h2>
            
            {!stats?.recentTestScores?.length ? (
              <div className="text-center py-8 px-4 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                <p className="text-slate-500 text-sm">No recent tests taken.</p>
                <p className="text-slate-600 text-xs mt-1">Complete a grammar or structure test to see it here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentTestScores.map((score, idx) => {
                  const percentage = Math.round((score.score / score.totalQuestions) * 100);
                  const isGood = percentage >= 80;
                  const isMedium = percentage >= 50 && percentage < 80;
                  
                  return (
                    <div key={idx} className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-200 capitalize">
                          {score.testType.replace('Test', '')} Test
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(score.takenAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`text-xl font-black ${
                        isGood ? 'text-emerald-400' : isMedium ? 'text-yellow-400' : 'text-rose-400'
                      }`}>
                        {percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <BookOpen className="absolute -bottom-4 -right-4 w-32 h-32 text-slate-700/30" />
            <h3 className="text-lg font-bold text-slate-100 mb-2 relative z-10">Grammar & Syntax</h3>
            <p className="text-sm text-slate-400 mb-6 relative z-10">
              A strong foundation is key. Review rules or practice structures to improve your fluency.
            </p>
            <div className="flex flex-col gap-3 relative z-10">
              <Link 
                href="/grammar"
                className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-xl transition-colors text-center text-sm font-bold flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Manage Grammar
              </Link>
              <Link 
                href="/structures"
                className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-xl transition-colors text-center text-sm font-bold flex items-center justify-center gap-2"
              >
                <Network className="w-4 h-4" /> Manage Structures
              </Link>
            </div>
          </div>

          {(activeLanguage?.name.toLowerCase().includes('chinese') || activeLanguage?.name.toLowerCase().includes('japanese')) && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl relative overflow-hidden mt-8">
              <BookA className="absolute -bottom-4 -right-4 w-32 h-32 text-rose-500/10" />
              <h3 className="text-lg font-bold text-slate-100 mb-2 relative z-10 flex items-center gap-2">
                <BookA className="w-5 h-5 text-rose-400" /> Character Radicals
              </h3>
              <p className="text-sm text-slate-400 mb-6 relative z-10">
                Master the foundational building blocks of characters. View stroke order animations and practice tracing.
              </p>
              <Link 
                href="/radicals"
                className="w-full px-4 py-3 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-300 rounded-xl transition-colors text-center text-sm font-bold flex items-center justify-center gap-2 relative z-10"
              >
                Learn Radicals <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
