'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { useGrammarStore, GrammarRule } from '../../stores/grammarStore';

interface GrammarModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRule?: GrammarRule | null;
}

export default function GrammarModal({ isOpen, onClose, editingRule }: GrammarModalProps) {
  const { createRule, updateRule, isLoading } = useGrammarStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [examples, setExamples] = useState<string[]>(['']);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingRule) {
        setName(editingRule.name);
        setDescription(editingRule.description);
        setExamples(editingRule.examples.length > 0 ? editingRule.examples.map(e => e.sentence) : ['']);
      } else {
        setName('');
        setDescription('');
        setExamples(['']);
      }
      setError(null);
    }
  }, [isOpen, editingRule]);

  if (!isOpen) return null;

  const handleExampleChange = (index: number, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = value;
    setExamples(newExamples);
  };

  const addExampleField = () => {
    setExamples([...examples, '']);
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

    if (!name.trim() || !description.trim()) {
      setError('Name and Description are required.');
      return;
    }

    const validExamples = examples.filter(ex => ex.trim() !== '');

    let success = false;
    if (editingRule) {
      success = await updateRule(editingRule.id, name, description, validExamples);
    } else {
      success = await createRule(name, description, validExamples);
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
            {editingRule ? 'Edit Grammar Rule' : 'Add Grammar Rule'}
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

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Rule Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-100 outline-none transition-colors"
              placeholder="e.g., Present Perfect Tense"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description / Explanation</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-100 outline-none transition-colors min-h-[120px] resize-y"
              placeholder="Explain how and when to use this rule..."
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">Examples</label>
              <button 
                type="button" 
                onClick={addExampleField}
                className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
              >
                <Plus className="w-3 h-3" /> Add Example
              </button>
            </div>
            
            <div className="space-y-3">
              {examples.map((ex, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={ex}
                    onChange={(e) => handleExampleChange(index, e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-100 outline-none transition-colors italic"
                    placeholder="e.g., I have been to Paris twice."
                  />
                  {examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExampleField(index)}
                      className="p-3 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0"
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
            {editingRule ? 'Save Changes' : 'Create Rule'}
          </button>
        </div>
      </div>
    </div>
  );
}
