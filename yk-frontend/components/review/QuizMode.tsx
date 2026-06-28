'use client';

import React, { useState, useEffect } from 'react';
import { useReviewSessionStore, ReviewWord } from '../../../../stores/reviewSessionStore';
import { PlayCircle, Loader2 } from 'lucide-react';
import api from '../../../../lib/api';

interface QuizModeProps {
  words: ReviewWord[];
  onComplete: () => void;
}

export default function QuizMode({ words, onComplete }: QuizModeProps) {
  const { addResult } = useReviewSessionStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentWord = words[currentIndex];

  useEffect(() => {
    if (currentWord) {
      fetchOptions();
    }
  }, [currentWord]);

  const fetchOptions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/review/options/${currentWord.id}?count=3`);
      if (response.data.success) {
        const distractors = response.data.data;
        const correctMeaning = currentWord.meanings[0]?.meaningText || currentWord.text;
        
        // Combine and shuffle
        const allOptions = [...distractors, correctMeaning].sort(() => 0.5 - Math.random());
        setOptions(allOptions);
      }
    } catch (err) {
      console.error("Failed to fetch distractors", err);
      // Fallback
      setOptions([
        currentWord.meanings[0]?.meaningText || currentWord.text,
        'Option A',
        'Option B',
        'Option C'
      ].sort(() => 0.5 - Math.random()));
    } finally {
      setIsLoading(false);
      setSelectedOption(null);
      setIsCorrect(null);
    }
  };

  const handleSelect = (option: string) => {
    if (selectedOption !== null) return; // Prevent multiple clicks
    
    setSelectedOption(option);
    const correctMeaning = currentWord.meanings[0]?.meaningText || currentWord.text;
    const correct = option === correctMeaning;
    setIsCorrect(correct);
    
    addResult(currentWord.id, correct);

    // Auto advance after short delay
    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onComplete();
      }
    }, 1500);
  };

  if (!currentWord) return null;

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <span className="text-slate-400 font-medium">Quiz</span>
        <span className="text-slate-400 font-medium bg-slate-800 px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {words.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-800 rounded-full mb-10 overflow-hidden">
        <div 
          className="h-full bg-indigo-500 transition-all duration-300" 
          style={{ width: `${(currentIndex / words.length) * 100}%` }}
        />
      </div>

      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl mb-8 min-h-[250px]">
        {currentWord.imageUrl && (
          <img 
            src={process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') + currentWord.imageUrl} 
            className="w-24 h-24 object-cover rounded-xl mb-6 shadow-md"
            alt="hint"
          />
        )}
        <h2 className="text-4xl font-bold text-slate-100 mb-3">{currentWord.text}</h2>
        {currentWord.ipa && <p className="text-lg text-slate-400 font-mono mb-4">{currentWord.ipa}</p>}
        
        {currentWord.audioUrl && (
          <button 
            onClick={() => new Audio(currentWord.audioUrl!).play().catch(() => {})}
            className="p-3 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-full transition-colors"
          >
            <PlayCircle className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Options */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          options.map((option, idx) => {
            let buttonClass = "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700";
            
            if (selectedOption !== null) {
              const correctMeaning = currentWord.meanings[0]?.meaningText || currentWord.text;
              if (option === correctMeaning) {
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
                className={`p-6 rounded-2xl border-2 font-medium text-lg transition-all text-center flex items-center justify-center min-h-[100px] ${buttonClass}`}
              >
                {option}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
