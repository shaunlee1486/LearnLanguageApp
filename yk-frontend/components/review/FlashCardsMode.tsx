'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReviewSessionStore, ReviewWord } from '../../../../stores/reviewSessionStore';
import { PlayCircle, Check, X, RotateCcw } from 'lucide-react';

interface FlashCardsModeProps {
  words: ReviewWord[];
  onComplete: () => void;
}

export default function FlashCardsMode({ words, onComplete }: FlashCardsModeProps) {
  const { addResult } = useReviewSessionStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentWord = words[currentIndex];

  const handleNext = (isCorrect: boolean) => {
    addResult(currentWord.id, isCorrect);
    
    setIsFlipped(false);
    
    // Tiny delay to allow flip animation back before changing content
    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onComplete();
      }
    }, 150);
  };

  if (!currentWord) return null;

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <span className="text-slate-400 font-medium">Flash Cards</span>
        <span className="text-slate-400 font-medium bg-slate-800 px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {words.length}
        </span>
      </div>

      {/* Card Container for 3D flip */}
      <div 
        className="w-full aspect-[4/3] max-h-[400px] perspective-1000 cursor-pointer group mb-8"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-slate-800 border border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl">
            {currentWord.imageUrl && (
              <img 
                src={process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') + currentWord.imageUrl} 
                className="w-32 h-32 object-cover rounded-2xl mb-6 shadow-md"
                alt="hint"
              />
            )}
            <h2 className="text-5xl font-bold text-slate-100 mb-4">{currentWord.text}</h2>
            {currentWord.ipa && <p className="text-xl text-slate-400 font-mono mb-4">{currentWord.ipa}</p>}
            
            {currentWord.audioUrl && (
              <button 
                onClick={(e) => { e.stopPropagation(); new Audio(currentWord.audioUrl!).play().catch(() => {}); }}
                className="p-3 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-full transition-colors"
              >
                <PlayCircle className="w-8 h-8" />
              </button>
            )}
            
            <p className="absolute bottom-6 text-slate-500 text-sm animate-pulse">Tap to flip</p>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-indigo-900 border border-indigo-700 rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-6">Meanings</h3>
            <div className="w-full space-y-4 text-center">
              {currentWord.meanings.map((m, idx) => (
                <div key={m.id} className="text-lg text-indigo-100">
                  <span className="text-indigo-300 text-sm mr-2 block mb-1">{m.typeOfWord}</span>
                  {m.meaningText}
                </div>
              ))}
            </div>

            {currentWord.examples.length > 0 && (
              <div className="w-full mt-6 pt-6 border-t border-indigo-800/50">
                <h4 className="text-sm font-semibold text-indigo-300 mb-3 text-center uppercase tracking-wider">Example</h4>
                <p className="text-center text-indigo-100 italic">"{currentWord.examples[0].sentence}"</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Controls */}
      <div className={`flex items-center gap-4 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(false); }}
          className="flex items-center gap-2 px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl font-bold transition-colors"
        >
          <X className="w-5 h-5" />
          Need Review
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl font-bold transition-colors"
        >
          <Check className="w-5 h-5" />
          Got It
        </button>
      </div>

    </div>
  );
}
