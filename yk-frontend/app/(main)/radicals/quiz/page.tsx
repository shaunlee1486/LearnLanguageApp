'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguageStore } from '../../../../stores/languageStore';
import api from '../../../../lib/api';
import { 
  Target, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  Timer,
  BookA
} from 'lucide-react';

interface QuizQuestion {
  radicalId: string;
  questionType: 'RadicalToMeaning' | 'MeaningToRadical';
  prompt: string;
  options: string[];
  correctAnswer: string;
}

export default function RadicalQuizPage() {
  const router = useRouter();
  const { activeLanguageId, userLanguages } = useLanguageStore();
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [duration, setDuration] = useState(0);

  const activeLanguage = userLanguages.find(l => l.id === activeLanguageId);
  const isEligible = activeLanguage?.name.toLowerCase().includes('chinese') || 
                     activeLanguage?.name.toLowerCase().includes('japanese');

  useEffect(() => {
    if (activeLanguageId && isEligible) {
      generateQuiz();
    }
  }, [activeLanguageId, isEligible]);

  const generateQuiz = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/radicals/quiz/generate?count=10');
      if (response.data.success && response.data.data.length > 0) {
        setQuestions(response.data.data);
        setStartTime(Date.now());
      } else {
        setError('Not enough radicals to generate a quiz. Please check back later.');
      }
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || 'Failed to generate quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswerRevealed) return;
    
    setSelectedAnswer(answer);
    setIsAnswerRevealed(true);
    
    if (answer === questions[currentIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
    } else {
      await submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
    const timeSpent = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
    setDuration(timeSpent);
    
    try {
      await api.post('/radicals/quiz/submit', {
        score: score + (selectedAnswer === questions[currentIndex].correctAnswer ? 1 : 0),
        totalQuestions: questions.length,
        durationSeconds: timeSpent
      });
      setIsFinished(true);
    } catch (err) {
      console.error('Failed to submit test', err);
      // Even if it fails to submit, we show results locally
      setIsFinished(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEligible) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
        <BookA className="w-16 h-16 text-slate-700 mb-6" />
        <h2 className="text-2xl font-bold text-slate-300 mb-2">Feature Not Available</h2>
        <p className="text-slate-500 max-w-md">
          The Radicals module is only available for Chinese and Japanese.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Generating your quiz...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-in fade-in">
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Cannot Start Quiz</h2>
        <p className="text-slate-400 mb-8">{error}</p>
        <button 
          onClick={() => router.push('/radicals')}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors"
        >
          Return to Radicals
        </button>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const isGood = percentage >= 80;
    const isMedium = percentage >= 50 && percentage < 80;

    return (
      <div className="max-w-3xl mx-auto py-10 animate-in zoom-in-95 duration-500">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6">
              <Target className="w-10 h-10" />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-100 mb-2">Quiz Complete!</h1>
            <p className="text-slate-400 mb-10">Great job reviewing your radicals.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Final Score</div>
                <div className="text-4xl font-black text-slate-100">
                  <span className={isGood ? 'text-emerald-400' : isMedium ? 'text-yellow-400' : 'text-rose-400'}>
                    {score}
                  </span>
                  <span className="text-slate-600">/{questions.length}</span>
                </div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Accuracy</div>
                <div className="text-4xl font-black text-slate-100">{percentage}%</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
                  <Timer className="w-4 h-4" /> Time
                </div>
                <div className="text-4xl font-black text-slate-100">
                  {Math.floor(duration / 60)}m {duration % 60}s
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => router.push('/radicals')}
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors"
              >
                Return to Radicals
              </button>
              <button 
                onClick={generateQuiz}
                className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-rose-500/20"
              >
                Take Another Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isCharacterPrompt = currentQ.questionType === 'RadicalToMeaning';

  return (
    <div className="max-w-4xl mx-auto py-10 animate-in fade-in duration-500">
      
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between text-sm font-bold text-slate-400 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span className="text-rose-400">Score: {score}</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-rose-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-xl mb-8 text-center">
        <h2 className="text-slate-400 text-lg font-medium mb-8">
          {isCharacterPrompt ? 'What is the meaning of this radical?' : 'Which radical matches this meaning?'}
        </h2>
        
        <div className={`mx-auto mb-12 flex items-center justify-center bg-slate-800/50 border border-slate-700/50 rounded-3xl ${isCharacterPrompt ? 'w-48 h-48' : 'w-full max-w-lg h-32'}`}>
          <span className={`${isCharacterPrompt ? 'text-8xl' : 'text-3xl font-bold text-rose-300'} text-slate-100`}>
            {currentQ.prompt}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedAnswer === opt;
            const isCorrect = opt === currentQ.correctAnswer;
            
            let btnClass = "p-5 rounded-2xl border-2 transition-all font-medium text-lg text-left relative overflow-hidden group ";
            
            if (!isAnswerRevealed) {
              btnClass += "bg-slate-800/80 border-slate-700 text-slate-200 hover:border-rose-500/50 hover:bg-slate-800 cursor-pointer shadow-sm hover:shadow-rose-500/10";
            } else {
              if (isCorrect) {
                btnClass += "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]";
              } else if (isSelected && !isCorrect) {
                btnClass += "bg-rose-500/10 border-rose-500 text-rose-400";
              } else {
                btnClass += "bg-slate-800/30 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed";
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswerRevealed}
                onClick={() => handleAnswerSelect(opt)}
                className={btnClass}
              >
                <div className="flex items-center justify-between">
                  <span className={!isCharacterPrompt ? 'text-4xl' : ''}>{opt}</span>
                  {isAnswerRevealed && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-in zoom-in" />}
                  {isAnswerRevealed && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-rose-500 animate-in zoom-in" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {isAnswerRevealed && (
        <div className="flex justify-end animate-in fade-in slide-in-from-bottom-4">
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-500/20"
          >
            {isSubmitting ? 'Submitting...' : currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
            {!isSubmitting && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      )}

    </div>
  );
}
