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
  TrendingUp,
  Award,
  BookA
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';

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
  const [studyTime, setStudyTime] = useState<any[]>([]);
  const [wordStatus, setWordStatus] = useState<any[]>([]);
  const [examScores, setExamScores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeLanguageId) {
      fetchStats();
    }
  }, [activeLanguageId]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [statsRes, studyTimeRes, wordStatusRes, examScoresRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/study-time'),
        api.get('/dashboard/word-status'),
        api.get('/dashboard/exam-scores')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (studyTimeRes.data.success) {
        setStudyTime(studyTimeRes.data.data);
      }
      if (wordStatusRes.data.success) {
        const statusMap: Record<string, string> = {
          'NotLearned': 'Chưa học',
          'Learned': 'Đang ôn',
          'AlreadyKnown': 'Đã thuộc'
        };
        const mapped = wordStatusRes.data.data.map((item: any) => ({
          name: statusMap[item.status] || item.status,
          value: item.count
        }));
        setWordStatus(mapped);
      }
      if (examScoresRes.data.success) {
        const mapped = examScoresRes.data.data.map((item: any) => ({
          date: new Date(item.takenAt).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
          percentage: item.percentage,
          type: item.testType.replace('Test', '')
        }));
        setExamScores(mapped);
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
  let greeting = 'Chào buổi tối';
  if (hour < 12) greeting = 'Chào buổi sáng';
  else if (hour < 18) greeting = 'Chào buổi chiều';

  if (!activeLanguageId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <Library className="w-16 h-16 text-slate-700 mb-6" />
        <h2 className="text-2xl font-bold text-slate-300 mb-2">Chào mừng đến với YK Language</h2>
        <p className="text-slate-500">Vui lòng chọn một ngôn ngữ ở góc trên để xem tiến trình học tập.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400">Đang tải tiến trình học tập của bạn...</p>
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
              Bạn đang học ngôn ngữ: 
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
                <div className="text-sm font-medium text-indigo-100 mb-1">Streak Hiện Tại</div>
                <div className="text-3xl font-bold text-white leading-none">
                  {stats?.currentStreak || 0} <span className="text-lg text-indigo-200 font-normal">ngày</span>
                </div>
              </div>
            </div>
            <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-indigo-100 mb-1">Streak Lớn Nhất</div>
              <div className="text-xl font-bold text-white leading-none">
                {stats?.longestStreak || 0} <span className="text-sm text-indigo-200 font-normal">ngày</span>
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
                <h3 className="text-xl font-bold text-slate-100 mb-2">Học & Ôn Tập</h3>
                <p className="text-slate-400 text-sm mb-6">
                  {stats?.wordsDueForReview ? (
                    <span className="text-emerald-400 font-medium">Có {stats.wordsDueForReview} từ cần ôn tập hôm nay.</span>
                  ) : (
                    <span>Không có từ nào cần ôn tập hôm nay.</span>
                  )}
                </p>
                <Link 
                  href="/review/start" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                >
                  Bắt đầu ôn <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-all shadow-lg hover:shadow-indigo-500/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-500/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
                  <Library className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">Từ Vựng</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Bạn đã ghi nhận <span className="text-indigo-400 font-medium">{(stats?.totalWordsLearned || 0) + (stats?.totalWordsKnown || 0)}</span> từ vựng.
                </p>
                <Link 
                  href="/categories" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors"
                >
                  Xem từ vựng <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-purple-500/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">Tự Luyện Đề</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Tạo các bài kiểm tra tùy biến kết hợp từ vựng & cấu trúc ngữ pháp.
                </p>
                <Link 
                  href="/test-builder" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20"
                >
                  Tạo đề test <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Detailed Stats Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" /> Hệ Thống Kiến Thức Đã Học
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <div className="text-slate-400 text-sm font-medium mb-1">Đang ôn tập</div>
                <div className="text-3xl font-bold text-slate-100">{stats?.totalWordsLearned || 0}</div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <div className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-1">
                  Đã thuộc lòng <Award className="w-3 h-3 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-yellow-400">{stats?.totalWordsKnown || 0}</div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <div className="text-slate-400 text-sm font-medium mb-1">Quy tắc ngữ pháp</div>
                <div className="text-3xl font-bold text-slate-100">{stats?.totalGrammars || 0}</div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <div className="text-slate-400 text-sm font-medium mb-1">Cấu trúc câu</div>
                <div className="text-3xl font-bold text-slate-100">{stats?.totalStructures || 0}</div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          {mounted && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Study Time Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-400" /> Thời gian học (30 ngày)
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">Số phút</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={studyTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#64748b" 
                        fontSize={10} 
                        tickFormatter={(tick) => {
                          const parts = tick.split('-');
                          return parts.length === 3 ? `${parts[2]}/${parts[1]}` : tick;
                        }}
                      />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                        labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                      />
                      <Line type="monotone" dataKey="minutes" name="Số phút" stroke="#10b981" strokeWidth={2.5} dot={{ r: 0 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Word Status Distribution Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-400" /> Phân phối từ vựng
                </h3>
                <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
                  {wordStatus.every(item => item.value === 0) ? (
                    <div className="text-slate-500 italic text-sm text-center py-10">Chưa có dữ liệu học tập</div>
                  ) : (
                    <>
                      <div className="h-44 w-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={wordStatus}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {wordStatus.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#64748b', '#6366f1', '#eab308'][index % 3]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-col gap-2">
                        {wordStatus.map((item, index) => (
                          <div key={item.name} className="flex items-center gap-2.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#64748b', '#6366f1', '#eab308'][index % 3] }} />
                            <span className="text-xs font-medium text-slate-300">{item.name}:</span>
                            <span className="text-xs font-bold text-slate-100">{item.value} từ</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Exam Scores Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl md:col-span-2">
                <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" /> Lịch sử điểm kiểm tra (%)
                </h3>
                <div className="h-64 w-full">
                  {examScores.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500 italic text-sm">Chưa thực hiện đề kiểm tra nào</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={examScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                          formatter={(value: any, name: any, props: any) => [`${value}% (${props.payload.type})`, 'Điểm số']}
                        />
                        <Bar dataKey="percentage" fill="#a78bfa" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
        
        {/* Right Column: Recent Activity & Grammar */}
        <div className="space-y-8">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" /> Lịch Sử Hoạt Động
            </h2>
            
            {!stats?.recentTestScores?.length ? (
              <div className="text-center py-8 px-4 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                <p className="text-slate-500 text-sm">Chưa thực hiện đề test nào.</p>
                <p className="text-slate-600 text-xs mt-1">Luyện tập từ vựng hoặc ngữ pháp để lưu lịch sử học tập.</p>
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
                          Đề Test {score.testType.replace('Test', '')}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(score.takenAt).toLocaleDateString('vi-VN')}
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
            <h3 className="text-lg font-bold text-slate-100 mb-2 relative z-10">Ngữ Pháp & Mẫu Câu</h3>
            <p className="text-sm text-slate-400 mb-6 relative z-10">
              Nắm vững cấu trúc câu và quy tắc ngữ pháp để tạo tiền đề giao tiếp tự tin.
            </p>
            <div className="flex flex-col gap-3 relative z-10">
              <Link 
                href="/grammar"
                className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-xl transition-colors text-center text-sm font-bold flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Quản lý ngữ pháp
              </Link>
              <Link 
                href="/structures"
                className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-xl transition-colors text-center text-sm font-bold flex items-center justify-center gap-2"
              >
                <Network className="w-4 h-4" /> Quản lý cấu trúc
              </Link>
            </div>
          </div>

          {activeLanguage && (activeLanguage.name.toLowerCase().includes('chinese') || activeLanguage.name.toLowerCase().includes('japanese') || activeLanguage.name.toLowerCase().includes('trung') || activeLanguage.name.toLowerCase().includes('nhật')) && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl relative overflow-hidden mt-8">
              <BookA className="absolute -bottom-4 -right-4 w-32 h-32 text-rose-500/10" />
              <h3 className="text-lg font-bold text-slate-100 mb-2 relative z-10 flex items-center gap-2">
                <BookA className="w-5 h-5 text-rose-400" /> Học Bộ Thủ Chữ Hán
              </h3>
              <p className="text-sm text-slate-400 mb-6 relative z-10">
                Ghi nhớ kết cấu chữ và tập viết bộ thủ chữ Hán/Kani trực quan.
              </p>
              <Link 
                href="/radicals"
                className="w-full px-4 py-3 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-300 rounded-xl transition-colors text-center text-sm font-bold flex items-center justify-center gap-2 relative z-10"
              >
                Học bộ thủ <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
