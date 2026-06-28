'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useLanguageStore } from '../../../stores/languageStore';
import api from '../../../lib/api';
import HanziWriter from 'hanzi-writer';
import { 
  BookA, 
  ChevronDown, 
  ChevronRight, 
  Play, 
  Target,
  X
} from 'lucide-react';

interface RadicalExample {
  id: string;
  word: string;
  vietnameseMeaning: string;
}

interface Radical {
  id: string;
  character: string;
  strokeCount: number;
  vietnameseMeaning: string;
  pinyin: string | null;
  reading: string | null;
  examples: RadicalExample[];
}

interface RadicalGroup {
  strokeCount: number;
  radicals: Radical[];
}

export default function RadicalsPage() {
  const { activeLanguageId, userLanguages } = useLanguageStore();
  const [groups, setGroups] = useState<RadicalGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});
  
  const [selectedRadical, setSelectedRadical] = useState<Radical | null>(null);

  const activeLanguage = userLanguages.find(l => l.id === activeLanguageId);
  const isEligible = activeLanguage?.name.toLowerCase().includes('chinese') || 
                     activeLanguage?.name.toLowerCase().includes('japanese');

  useEffect(() => {
    if (activeLanguageId && isEligible) {
      fetchRadicals();
    }
  }, [activeLanguageId, isEligible]);

  const fetchRadicals = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/radicals');
      if (response.data.success) {
        setGroups(response.data.data);
        // Expand the first group by default
        if (response.data.data.length > 0) {
          setExpandedGroups({ [response.data.data[0].strokeCount]: true });
        }
      }
    } catch (err) {
      console.error('Failed to fetch radicals', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGroup = (strokeCount: number) => {
    setExpandedGroups(prev => ({
      ...prev,
      [strokeCount]: !prev[strokeCount]
    }));
  };

  if (!isEligible) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
        <BookA className="w-16 h-16 text-slate-700 mb-6" />
        <h2 className="text-2xl font-bold text-slate-300 mb-2">Feature Not Available</h2>
        <p className="text-slate-500 max-w-md">
          The Radicals module is specifically designed for character-based languages like Chinese or Japanese. Please switch your active language to access this feature.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 pb-24 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400">
              <BookA className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-slate-100">Radicals</h1>
          </div>
          <p className="text-slate-400 ml-16">
            Master the foundational building blocks of characters.
          </p>
        </div>
        
        <Link 
          href="/radicals/quiz"
          className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-rose-500/20"
        >
          <Target className="w-5 h-5" /> Take Quiz
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => {
            const isExpanded = expandedGroups[group.strokeCount];
            
            return (
              <div key={group.strokeCount} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => toggleGroup(group.strokeCount)}
                  className="w-full flex items-center justify-between p-6 bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-rose-400">{group.strokeCount} Stroke{group.strokeCount > 1 ? 's' : ''}</span>
                    <span className="text-sm text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
                      {group.radicals.length} radicals
                    </span>
                  </div>
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="p-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-in slide-in-from-top-2 duration-300">
                    {group.radicals.map((radical) => (
                      <button
                        key={radical.id}
                        onClick={() => setSelectedRadical(radical)}
                        className="flex flex-col items-center justify-center p-4 bg-slate-800 border border-slate-700 hover:border-rose-500/50 hover:bg-slate-700/50 rounded-2xl transition-all group shadow-sm hover:shadow-rose-500/10"
                      >
                        <div className="text-4xl font-normal text-slate-100 mb-2 group-hover:scale-110 transition-transform">
                          {radical.character}
                        </div>
                        <div className="text-xs font-medium text-rose-300 mb-1">
                          {radical.pinyin || radical.reading || '-'}
                        </div>
                        <div className="text-xs text-slate-400 text-center truncate w-full" title={radical.vietnameseMeaning}>
                          {radical.vietnameseMeaning}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Radical Modal Component */}
      {selectedRadical && (
        <RadicalModal 
          radical={selectedRadical} 
          onClose={() => setSelectedRadical(null)} 
        />
      )}
      
    </div>
  );
}

function RadicalModal({ radical, onClose }: { radical: Radical, onClose: () => void }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);

  useEffect(() => {
    if (canvasRef.current && !writerRef.current) {
      writerRef.current = HanziWriter.create(canvasRef.current, radical.character, {
        width: 150,
        height: 150,
        padding: 5,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 50,
        strokeColor: '#f1f5f9', // slate-100
        radicalColor: '#f43f5e', // rose-500
        outlineColor: '#334155', // slate-700
      });
    }

    return () => {
      if (writerRef.current) {
        // hanzi-writer doesn't have a strict destroy method in older versions, 
        // but it's safe to clear innerHTML
        if (canvasRef.current) {
            canvasRef.current.innerHTML = '';
        }
        writerRef.current = null;
      }
    };
  }, [radical.character]);

  const animateStroke = () => {
    if (writerRef.current) {
      writerRef.current.animateCharacter();
    }
  };

  const startQuiz = () => {
    if (writerRef.current) {
      writerRef.current.quiz({
        onMistake: (strokeData: any) => {
            console.log('Mistake', strokeData);
        },
        onComplete: (summaryData: any) => {
            console.log('Quiz complete', summaryData);
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Radical Details
          </h2>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            
            {/* Canvas Area */}
            <div className="flex flex-col items-center gap-4">
              <div 
                ref={canvasRef} 
                className="w-[150px] h-[150px] bg-slate-800 border-2 border-slate-700 rounded-2xl flex items-center justify-center overflow-hidden cursor-crosshair touch-none"
              >
              </div>
              <div className="flex gap-2 w-full">
                <button 
                  onClick={animateStroke}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg transition-colors border border-slate-700"
                >
                  <Play className="w-3 h-3" /> Animate
                </button>
                <button 
                  onClick={startQuiz}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 text-sm font-semibold rounded-lg transition-colors border border-rose-500/20"
                >
                  Trace
                </button>
              </div>
            </div>

            {/* Info Area */}
            <div className="flex-1 space-y-4 text-center md:text-left w-full">
              <div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">Meaning</div>
                <div className="text-xl font-bold text-slate-100">{radical.vietnameseMeaning}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">Reading</div>
                  <div className="text-lg font-medium text-rose-300">{radical.pinyin || radical.reading || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">Strokes</div>
                  <div className="text-lg font-medium text-slate-300">{radical.strokeCount}</div>
                </div>
              </div>

              {radical.examples && radical.examples.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Examples</div>
                  <div className="flex flex-wrap gap-2">
                    {radical.examples.map(ex => (
                      <div key={ex.id} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">
                        <span className="text-slate-100 mr-2">{ex.word}</span>
                        <span className="text-slate-400">{ex.vietnameseMeaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
