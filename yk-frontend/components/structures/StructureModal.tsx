'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { useSentenceStructureStore, SentenceStructure } from '../../stores/sentenceStructureStore';

interface StructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingStructure?: SentenceStructure | null;
}

export default function StructureModal({ isOpen, onClose, editingStructure }: StructureModalProps) {
  const { createStructure, updateStructure, isLoading } = useSentenceStructureStore();
  
  const [pattern, setPattern] = useState('');
  const [vietnameseMeaning, setVietnameseMeaning] = useState('');
  const [examples, setExamples] = useState<{ sentence: string; meaning: string }[]>([{ sentence: '', meaning: '' }]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingStructure) {
        setPattern(editingStructure.pattern);
        setVietnameseMeaning(editingStructure.vietnameseMeaning);
        setExamples(editingStructure.examples.length > 0 ? [...editingStructure.examples] : [{ sentence: '', meaning: '' }]);
      } else {
        setPattern('');
        setVietnameseMeaning('');
        setExamples([{ sentence: '', meaning: '' }]);
      }
      setError(null);
    }
  }, [isOpen, editingStructure]);

  if (!isOpen) return null;

  const handleExampleChange = (index: number, field: 'sentence' | 'meaning', value: string) => {
    const newExamples = [...examples];
    newExamples[index][field] = value;
    setExamples(newExamples);
  };

  const addExampleField = () => {
    setExamples([...examples, { sentence: '', meaning: '' }]);
  };

  const removeExampleField = (index: number) => {
    if (examples.length > 1) {
      const newExamples = examples.filter((_, i) => i !== index);
      setExamples(newExamples);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pattern.trim() || !vietnameseMeaning.trim()) {
      setError('Pattern and Vietnamese Meaning are required.');
      return;
    }

    const validExamples = examples.filter(ex => ex.sentence.trim() !== '');

    let success = false;
    if (editingStructure) {
      success = await updateStructure(editingStructure.id, pattern, vietnameseMeaning, validExamples);
    } else {
      success = await createStructure(pattern, vietnameseMeaning, validExamples);
    }

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-slate-100">
            {editingStructure ? 'Edit Structure' : 'Add Sentence Structure'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Pattern</label>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-100 outline-none transition-colors"
                placeholder="e.g., S + V + O"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Vietnamese Meaning</label>
              <input
                type="text"
                value={vietnameseMeaning}
                onChange={(e) => setVietnameseMeaning(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-100 outline-none transition-colors"
                placeholder="e.g., Ai đó làm gì đó"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 mt-2 border-t border-slate-800 pt-6">
              <label className="block text-sm font-medium text-slate-300">Examples</label>
              <button 
                type="button" 
                onClick={addExampleField}
                className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 px-3 py-1.5 bg-indigo-500/10 rounded-lg"
              >
                <Plus className="w-4 h-4" /> Add Example
              </button>
            </div>
            
            <div className="space-y-4">
              {examples.map((ex, index) => (
                <div key={index} className="flex gap-2 items-start bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50 relative">
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={ex.sentence}
                      onChange={(e) => handleExampleChange(index, 'sentence', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-100 outline-none transition-colors"
                      placeholder="Sentence in target language"
                    />
                    <input
                      type="text"
                      value={ex.meaning}
                      onChange={(e) => handleExampleChange(index, 'meaning', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-100 outline-none transition-colors italic"
                      placeholder="Vietnamese meaning of the sentence"
                    />
                  </div>
                  {examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExampleField(index)}
                      className="p-3 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0 mt-8"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 font-semibold text-slate-300 hover:text-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {editingStructure ? 'Save Changes' : 'Create Structure'}
          </button>
        </div>
      </div>
    </div>
  );
}
