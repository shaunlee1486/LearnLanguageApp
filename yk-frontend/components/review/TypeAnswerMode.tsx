'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useReviewSessionStore, ReviewWord } from '../../stores/reviewSessionStore';
import { useLanguageStore } from '../../stores/languageStore';
import { PlayCircle, ArrowRight, Check, X } from 'lucide-react';

interface TypeAnswerModeProps {
  words: ReviewWord[];
  onComplete: () => void;
}

export default function TypeAnswerMode({ words, onComplete }: TypeAnswerModeProps) {
  const { addResult } = useReviewSessionStore();
  const { userLanguages, activeLanguageId } = useLanguageStore();
  const activeLanguage = userLanguages.find(l => l.id === activeLanguageId);
  const activeLangCode = activeLanguage?.code?.toLowerCase() || '';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const currentWord = words[currentIndex];

  useEffect(() => {
    if (!isSubmitted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, isSubmitted]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isSubmitted) return;

    // Strict string matching but ignoring case and extra spaces
    const correct = inputValue.trim().toLowerCase() === currentWord.text.toLowerCase();
    
    setIsCorrect(correct);
    setIsSubmitted(true);
    addResult(currentWord.id, correct);
  };

  const handleNext = () => {
    setIsSubmitted(false);
    setInputValue('');
    setIsCorrect(false);
    
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  if (!currentWord) return null;

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <span className="text-slate-400 font-medium">Type Answer</span>
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
        {/* The Prompt - meaning instead of word */}
        <h3 className="text-slate-400 uppercase tracking-widest text-sm font-semibold mb-6">Translate to Target Language</h3>
        <h2 className="text-3xl font-bold text-slate-100 mb-6 text-center">
          {currentWord.meanings.map(m => m.meaningText).join(', ') || 'No meaning provided'}
        </h2>
        
        {isSubmitted && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-2xl text-slate-300 mb-2">{currentWord.text}</div>
            {currentWord.ipa && <div className="text-slate-500 font-mono mb-3">{currentWord.ipa}</div>}
            {(currentWord.audioUrl || (activeLangCode && ['zh', 'ja'].includes(activeLangCode))) && (
              <button 
                onClick={() => {
                  if (currentWord.audioUrl) {
                    new Audio(currentWord.audioUrl).play().catch(() => {});
                  } else if (typeof window !== 'undefined' && window.speechSynthesis) {
                    let utteranceLang = '';
                    if (activeLangCode === 'zh') utteranceLang = 'zh-CN';
                    else if (activeLangCode === 'ja') utteranceLang = 'ja-JP';
                    
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(currentWord.text);
                    utterance.lang = utteranceLang;
                    window.speechSynthesis.speak(utterance);
                  }
                }}
                className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-full transition-colors mb-4"
              >
                <PlayCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="w-full">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your answer..."
              className="w-full bg-slate-900 border-2 border-slate-700 focus:border-indigo-500 rounded-2xl px-6 py-5 text-xl text-slate-100 outline-none transition-colors pr-20"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-3 top-3 bottom-3 aspect-square bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-700 text-white rounded-xl flex items-center justify-center transition-colors"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </form>
        ) : (
          <div className={`w-full p-6 rounded-2xl border-2 flex items-center justify-between ${
            isCorrect ? 'bg-emerald-500/10 border-emerald-500' : 'bg-rose-500/10 border-rose-500'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${isCorrect ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                {isCorrect ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
              </div>
              <div>
                <div className={`text-lg font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </div>
                {!isCorrect && (
                  <div className="text-slate-400 mt-1">
                    You typed: <span className="line-through text-slate-500">{inputValue}</span>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={handleNext}
              className={`px-6 py-3 rounded-xl font-bold transition-colors ${
                isCorrect 
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' 
                  : 'bg-rose-500 text-slate-950 hover:bg-rose-400'
              }`}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
