'use client';

import React, { useState, useEffect } from 'react';
import { useLanguageStore } from '../../../stores/languageStore';
import api from '../../../lib/api';
import { Settings, Play, CheckCircle2, XCircle, Clock, ChevronRight, Home, BrainCircuit, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CustomTestQuestion {
  sourceId: string;
  sourceType: string;
  prompt: string;
  hint: string | null;
  options: string[];
  correctAnswer: string;
}

interface CustomTestSession {
  timerSeconds: number;
  questions: CustomTestQuestion[];
}

export default function TestBuilderPage() {
  const { activeLanguageId, userLanguages } = useLanguageStore();
  const router = useRouter();

  // Settings State
  const [questionLimit, setQuestionLimit] = useState(15);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Test State
  const [session, setSession] = useState<CustomTestSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTestActive, setIsTestActive] = useState(false);
  const [isTestFinished, setIsTestFinished] = useState(false);
  
  // Loading & Error State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const activeLanguage = userLanguages.find(l => l.id === activeLanguageId);

  // Load basic settings on mount if available in user object? 
  // We didn't fetch user settings on frontend yet, so we just stick to defaults 
  // and they will be overridden when we start test.

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTestActive && timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (isTestActive && timeLeft === 0) {
      finishTest();
    }
    return () => clearInterval(timer);
  }, [isTestActive, timeLeft]);

  const handleUpdateSettings = async () => {
    setIsUpdatingSettings(true);
    try {
      await api.put('/tests/custom/settings', { questionLimit, timerSeconds });
    } catch (err) {
      console.error('Failed to update settings');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const startTest = async () => {
    setError('');
    setIsLoading(true);
    try {
      // Ensure settings are saved first
      await handleUpdateSettings();
      
      const response = await api.get('/tests/custom/generate');
      if (response.data.success) {
        const testSession = response.data.data;
        setSession(testSession);
        setTimeLeft(testSession.timerSeconds);
        setCurrentIndex(0);
        setSelectedAnswers({});
        setIsTestFinished(false);
        setIsTestActive(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || 'Failed to generate test. Make sure you have enough vocabulary, grammar rules, and sentence structures.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (!isTestActive) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: option }));
  };

  const handleNext = () => {
    if (currentIndex < (session?.questions.length || 0) - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    setIsTestActive(false);
    setIsTestFinished(true);

    if (!session) return;

    let correctCount = 0;
    session.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const duration = session.timerSeconds - (timeLeft || 0);

    try {
      await api.post('/tests/custom/submit', {
        score: correctCount,
        totalQuestions: session.questions.length,
        durationSeconds: duration
      });
    } catch (err) {
      console.error('Failed to submit test results', err);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!activeLanguageId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
        <BrainCircuit className="w-16 h-16 text-slate-700 mb-6" />
        <h2 className="text-2xl font-bold text-slate-300 mb-2">No Language Selected</h2>
        <p className="text-slate-500">Please select a language from the header to build a test.</p>
      </div>
    );
  }

  // 1. SETTINGS SCREEN
  if (!isTestActive && !isTestFinished) {
    return (
      <div className="max-w-2xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
              <Settings className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Custom Test Builder</h1>
              <p className="text-slate-400">Configure your mixed proficiency test.</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Number of Questions</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  step="5"
                  value={questionLimit}
                  onChange={(e) => setQuestionLimit(parseInt(e.target.value))}
                  className="flex-1 accent-indigo-500"
                />
                <span className="text-xl font-bold text-indigo-400 w-12 text-right">{questionLimit}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Time Limit (Minutes)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="1" 
                  max="30" 
                  step="1"
                  value={timerSeconds / 60}
                  onChange={(e) => setTimerSeconds(parseInt(e.target.value) * 60)}
                  className="flex-1 accent-indigo-500"
                />
                <span className="text-xl font-bold text-indigo-400 w-12 text-right">{timerSeconds / 60}m</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-end">
              <button
                onClick={startTest}
                disabled={isLoading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                Generate & Start Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACTIVE TEST SCREEN
  if (isTestActive && session) {
    const question = session.questions[currentIndex];
    const isAnswered = selectedAnswers[currentIndex] !== undefined;
    const isLastQuestion = currentIndex === session.questions.length - 1;

    return (
      <div className="max-w-3xl mx-auto py-10 animate-in fade-in duration-300">
        
        {/* Header / Status */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium">
              Question {currentIndex + 1} of {session.questions.length}
            </span>
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-sm font-bold capitalize">
              {question.sourceType}
            </span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${
            timeLeft !== null && timeLeft <= 30 ? 'bg-rose-500/10 text-rose-400 animate-pulse' : 'bg-slate-800 text-slate-300'
          }`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft || 0)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full mb-10 overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex) / session.questions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-100 mb-6">
            {question.prompt}
          </h2>
          {question.hint && (
            <p className="text-center text-slate-400 mb-8">{question.hint}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentIndex] === option;
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  className={`p-4 rounded-2xl text-left font-medium transition-all duration-200 border-2 ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' 
                      : 'border-slate-700 bg-slate-800 hover:border-slate-500 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLastQuestion ? 'Finish Test' : 'Next Question'} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // 3. RESULTS SCREEN
  if (isTestFinished && session) {
    let correctCount = 0;
    session.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) correctCount++;
    });

    const percentage = Math.round((correctCount / session.questions.length) * 100);
    const isGood = percentage >= 80;

    return (
      <div className="max-w-4xl mx-auto py-10 animate-in zoom-in-95 duration-500">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-2xl mb-8">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl ${
            isGood ? 'bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20' : 'bg-rose-500/20 text-rose-400 shadow-rose-500/20'
          }`}>
            {isGood ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
          </div>
          
          <h1 className="text-4xl font-black text-slate-100 mb-2">Test Completed!</h1>
          <p className="text-slate-400 mb-8">You scored <strong className="text-slate-200">{percentage}%</strong> in this custom test.</p>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-10">
            <div className="p-4 bg-slate-800 rounded-2xl">
              <div className="text-sm text-slate-400 mb-1">Correct Answers</div>
              <div className="text-2xl font-bold text-emerald-400">{correctCount} / {session.questions.length}</div>
            </div>
            <div className="p-4 bg-slate-800 rounded-2xl">
              <div className="text-sm text-slate-400 mb-1">Time Spent</div>
              <div className="text-2xl font-bold text-indigo-400">{formatTime(session.timerSeconds - (timeLeft || 0))}</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setSession(null);
                setIsTestFinished(false);
                setTimeLeft(null);
              }}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-5 h-5" /> Test Again
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition-colors"
            >
              <Home className="w-5 h-5" /> Dashboard
            </Link>
          </div>
        </div>

        {/* Detailed Review */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-200 mb-4 px-4">Detailed Review</h3>
          {session.questions.map((q, idx) => {
            const userAnswer = selectedAnswers[idx];
            const isCorrect = userAnswer === q.correctAnswer;

            return (
              <div key={idx} className={`p-6 rounded-2xl border ${
                isCorrect ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-rose-950/20 border-rose-900/50'
              }`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                      Question {idx + 1} • {q.sourceType}
                    </span>
                    <div className="text-lg font-bold text-slate-200">{q.prompt}</div>
                  </div>
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-slate-500 inline-block w-24">Your Answer:</span>
                    <span className={`font-semibold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {userAnswer || 'Not answered'}
                    </span>
                  </div>
                  {!isCorrect && (
                    <div className="text-sm">
                      <span className="text-slate-500 inline-block w-24">Correct:</span>
                      <span className="font-semibold text-emerald-400">{q.correctAnswer}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
