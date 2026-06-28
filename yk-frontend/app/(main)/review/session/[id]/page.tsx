'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useReviewSessionStore } from '../../../../../stores/reviewSessionStore';
import FlashCardsMode from '../../../../../components/review/FlashCardsMode';
import QuizMode from '../../../../../components/review/QuizMode';
import TypeAnswerMode from '../../../../../components/review/TypeAnswerMode';
import { Loader2 } from 'lucide-react';

export default function ReviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { currentSession, submitSession, isLoading, error } = useReviewSessionStore();

  useEffect(() => {
    if (!currentSession) {
      // If refreshed, session state is lost. Redirect back to start.
      router.replace('/review/start');
    }
  }, [currentSession, router]);

  const handleComplete = async () => {
    await submitSession();
    router.replace(`/review/summary`);
  };

  if (!currentSession) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-400">Submitting your session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6">
          {error}
        </div>
        <button
          onClick={() => router.replace('/review')}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl"
        >
          Return to Review List
        </button>
      </div>
    );
  }

  // 0=FlashCards, 1=Quiz, 2=TypeAnswer
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10">
      {currentSession.mode === 0 && (
        <FlashCardsMode words={currentSession.words} onComplete={handleComplete} />
      )}
      {currentSession.mode === 1 && (
        <QuizMode words={currentSession.words} onComplete={handleComplete} />
      )}
      {currentSession.mode === 2 && (
        <TypeAnswerMode words={currentSession.words} onComplete={handleComplete} />
      )}
    </div>
  );
}
