'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Target, Loader2, ArrowLeft, Check, X, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import api from '../../../../lib/api';

interface StructureTestQuestion {
  structureId: string;
  vietnameseMeaning: string;
  exampleSentence: string;
  correctOption: string;
  options: string[];
}

export default function StructureTestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<StructureTestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    fetchTest();
  }, []);

  const fetchTest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/sentence-structure/test/generate?count=10');
      if (response.data.success) {
        setQuestions(response.data.data);
        setStartTime(Date.now());
      } else {
        setError(response.data.errors?.[0] || 'Failed to generate test.');
      }
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (option: string) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(option);
    
    const currentQ = questions[currentIndex];
    const correct = option === currentQ.correctOption;
    
    setIsCorrect(correct);
    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setShowHint(false);
    } else {
      // Finish
      setIsSubmitting(true);
      setIsComplete(true);
      
      const duration = Math.floor((Date.now() - startTime) / 1000);
      
      try {
        await api.post('/sentence-structure/test/submit', {
          totalQuestions: questions.length,
          score: score + (isCorrect ? 1 : 0),
          durationSeconds: duration
        });
      } catch (err) {
        console.error("Failed to save test result", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-400">Generating structure test...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto pb-20">
        <Link href="/structures" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Structures
        </Link>
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-2xl flex flex-col items-center text-center">
          <X className="w-12 h-12 mb-4" />
          <h2 className="text-xl font-bold mb-2">Could not start test</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="max-w-xl mx-auto py-10 pb-20">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full mb-6 ring-4 ring-emerald-500/10">
            <Target className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Test Complete!</h1>
          <p className="text-slate-400 mb-8">You finished your structure session.</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-800 rounded-2xl p-6">
              <div className="text-sm text-slate-400 mb-1">Score</div>
              <div className="text-3xl font-bold text-slate-100">{score} / {questions.length}</div>
            </div>
            <div className="bg-slate-800 rounded-2xl p-6">
              <div className="text-sm text-slate-400 mb-1">Accuracy</div>
              <div className="text-3xl font-bold text-slate-100">
                {Math.round((score / questions.length) * 100)}%
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              href="/structures"
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors"
            >
              Back to Structures
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <Link href="/structures" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Quit Test
        </Link>
        <span className="text-slate-400 font-medium bg-slate-800 px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="w-full h-2 bg-slate-800 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-indigo-500 transition-all duration-300" 
          style={{ width: `${(currentIndex / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl mb-6">
        <h3 className="text-slate-400 uppercase tracking-widest text-sm font-semibold mb-6 flex items-center justify-between">
          <span>Which sentence pattern is this?</span>
          <button 
            onClick={() => setShowHint(!showHint)}
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 capitalize tracking-normal"
          >
            <BookOpen className="w-4 h-4" /> {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
        </h3>
        
        <div className="text-3xl font-bold text-slate-100 mb-6">
          {currentQ.exampleSentence}
        </div>

        {showHint && (
          <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-200 animate-in fade-in slide-in-from-top-2 italic">
            <strong>Meaning:</strong> {currentQ.vietnameseMeaning}
          </div>
        )}

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            let buttonClass = "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700";
            
            if (selectedOption !== null) {
              if (option === currentQ.correctOption) {
                buttonClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
              } else if (option === selectedOption) {
                buttonClass = "bg-rose-500/20 border-rose-500 text-rose-400";
              } else {
                buttonClass = "bg-slate-800/50 border-slate-800 text-slate-500 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(option)}
                disabled={selectedOption !== null}
                className={`w-full p-4 rounded-xl border-2 font-medium text-lg transition-all text-left flex items-center justify-between ${buttonClass}`}
              >
                <span>{option}</span>
                {selectedOption !== null && option === currentQ.correctOption && <Check className="w-5 h-5" />}
                {selectedOption !== null && option === selectedOption && option !== currentQ.correctOption && <X className="w-5 h-5" />}
              </button>
            );
          })}
        </div>
      </div>

      {selectedOption !== null && (
        <div className="flex justify-end animate-in slide-in-from-bottom-4">
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
          >
            {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Test'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
