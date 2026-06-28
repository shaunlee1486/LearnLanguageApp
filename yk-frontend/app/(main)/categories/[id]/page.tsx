'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWordStore, Word } from '../../../../stores/wordStore';
import { useLanguageStore } from '../../../../stores/languageStore';
import WordFormModal from '../../../../components/words/WordFormModal';
import { Plus, ArrowLeft, Search, CheckCircle2, Circle, MoreVertical, Trash2, Edit2, PlayCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CategoryWordsPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const router = useRouter();

  const { words, totalCount, totalPages, fetchWordsByCategory, deleteWord, markKnown, addToReviewList, isLoading, error } = useWordStore();
  const { activeLanguageId, userLanguages } = useLanguageStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (categoryId) {
      fetchWordsByCategory(categoryId, 1, 50); // Using 50 for page size for now
    }
  }, [categoryId, fetchWordsByCategory]);

  const activeLanguage = userLanguages.find(l => l.id === activeLanguageId);

  const handleSelectAll = () => {
    if (selectedWordIds.size === words.length) {
      setSelectedWordIds(new Set());
    } else {
      setSelectedWordIds(new Set(words.map(w => w.id)));
    }
  };

  const toggleWordSelection = (id: string) => {
    const newSelection = new Set(selectedWordIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedWordIds(newSelection);
  };

  const handleAddToReview = async () => {
    if (selectedWordIds.size === 0 || !activeLanguageId) return;
    try {
      await addToReviewList(activeLanguageId, Array.from(selectedWordIds));
      alert(`Successfully added ${selectedWordIds.size} words to your review list!`);
      setSelectedWordIds(new Set());
    } catch (e) {
      // Error handled in store
    }
  };

  const handleDeleteWord = async (id: string) => {
    if (confirm('Are you sure you want to delete this word?')) {
      await deleteWord(id);
      setSelectedWordIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const filteredWords = words.filter(w => 
    w.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.meanings.some(m => m.meaningText.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/categories" 
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              Vocabulary List
            </h1>
            <p className="text-slate-400 mt-1">Manage words in this category</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedWordIds.size > 0 && (
            <button
              onClick={handleAddToReview}
              className="px-4 py-2 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-xl font-medium transition-colors"
            >
              Add {selectedWordIds.size} to Review
            </button>
          )}
          
          <button
            onClick={() => { setEditingWord(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Word
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search words or meanings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>
        
        <div className="text-sm text-slate-400">
          Showing {filteredWords.length} of {words.length} words
        </div>
      </div>

      {/* Words Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading && words.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-slate-500">No words found in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="p-4 w-12">
                    <button onClick={handleSelectAll} className="text-slate-400 hover:text-emerald-400">
                      {selectedWordIds.size === words.length && words.length > 0 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  <th className="p-4 text-sm font-semibold text-slate-400">Word</th>
                  <th className="p-4 text-sm font-semibold text-slate-400">Meanings</th>
                  <th className="p-4 text-sm font-semibold text-slate-400 hidden md:table-cell">Examples</th>
                  <th className="p-4 text-sm font-semibold text-slate-400 hidden sm:table-cell">Status</th>
                  <th className="p-4 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredWords.map((word) => (
                  <tr key={word.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4">
                      <button onClick={() => toggleWordSelection(word.id)} className="text-slate-400 hover:text-emerald-400">
                        {selectedWordIds.has(word.id) ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {word.imageUrl && (
                          <img 
                            src={process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') + word.imageUrl} 
                            alt={word.text} 
                            className="w-10 h-10 rounded-lg object-cover hidden sm:block bg-slate-800"
                          />
                        )}
                        <div>
                          <div className="font-bold text-slate-200 text-lg flex items-center gap-2">
                            {word.text}
                            {word.audioUrl && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  new Audio(word.audioUrl!).play().catch(() => {});
                                }}
                                className="text-slate-500 hover:text-indigo-400 transition-colors"
                              >
                                <PlayCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          {word.ipa && <div className="text-sm text-slate-500 font-mono">{word.ipa}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {word.meanings.slice(0, 2).map((m, i) => (
                          <div key={m.id || i} className="text-sm">
                            <span className="text-xs text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded mr-2 inline-block min-w-12 text-center">
                              {m.typeOfWord.substring(0, 3)}
                            </span>
                            <span className="text-slate-300">{m.meaningText}</span>
                          </div>
                        ))}
                        {word.meanings.length > 2 && (
                          <div className="text-xs text-slate-500">+{word.meanings.length - 2} more...</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-slate-400">
                      {word.examples.length > 0 ? (
                        <div className="line-clamp-2 italic">"{word.examples[0].sentence}"</div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      {word.status === 'AlreadyKnown' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Known
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          Learning
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingWord(word); setIsModalOpen(true); }}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteWord(word.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <WordFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryId={categoryId}
        languageCode={activeLanguage?.code || 'en'}
        word={editingWord}
      />
    </div>
  );
}
