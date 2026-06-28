'use client';

import React, { useEffect, useState } from 'react';
import { useGrammarStore, GrammarRule } from '../../../stores/grammarStore';
import { useLanguageStore } from '../../../stores/languageStore';
import { BookText, Plus, Trash2, Edit2, Play, ChevronDown, ChevronUp, Loader2, Target } from 'lucide-react';
import Link from 'next/link';
import GrammarModal from '../../../components/grammar/GrammarModal';

export default function GrammarPage() {
  const { rules, fetchRules, deleteRule, isLoading, error } = useGrammarStore();
  const { activeLanguageId, userLanguages } = useLanguageStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<GrammarRule | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (activeLanguageId) {
      fetchRules();
    }
  }, [activeLanguageId, fetchRules]);

  const activeLanguage = userLanguages.find(l => l.id === activeLanguageId);

  const handleEdit = (rule: GrammarRule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this rule?')) {
      await deleteRule(id);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  if (!activeLanguageId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BookText className="w-16 h-16 text-slate-700 mb-6" />
        <h2 className="text-2xl font-bold text-slate-300 mb-2">No Language Selected</h2>
        <p className="text-slate-500">Please select an active language to view grammar rules.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            Grammar Rules
            {activeLanguage && (
              <span className="text-sm px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                {activeLanguage.name}
              </span>
            )}
          </h1>
          <p className="text-slate-400 mt-1">Manage and learn the grammatical structures</p>
        </div>
        
        <div className="flex items-center gap-3">
          {rules.length >= 2 && (
            <Link
              href="/grammar/test"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              <Target className="w-4 h-4" />
              Test Knowledge
            </Link>
          )}
          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {isLoading && rules.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-700/50 rounded-2xl bg-slate-900/30">
          <BookText className="w-16 h-16 text-slate-700 mb-4" />
          <h3 className="text-xl font-bold text-slate-300 mb-2">No grammar rules yet</h3>
          <p className="text-slate-500 mb-6 text-center max-w-md">
            Start adding grammar rules and examples to build your knowledge base.
          </p>
          <button
            onClick={handleAddNew}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors"
          >
            Add Your First Rule
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div 
              key={rule.id} 
              className={`bg-slate-900 border rounded-2xl transition-all overflow-hidden ${
                expandedId === rule.id ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div 
                className="p-5 flex items-center justify-between cursor-pointer select-none"
                onClick={() => toggleExpand(rule.id)}
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-200">{rule.name}</h3>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-1">{rule.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-slate-500 text-sm font-medium mr-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center mr-2">{rule.examples.length}</span>
                    examples
                  </div>
                  {expandedId === rule.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {expandedId === rule.id && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800 bg-slate-900/50 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-slate-300 mb-6 whitespace-pre-wrap leading-relaxed">{rule.description}</p>
                  
                  {rule.examples.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Examples</h4>
                      <ul className="space-y-2">
                        {rule.examples.map(ex => (
                          <li key={ex.id} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-indigo-100 italic">
                            "{ex.sentence}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(rule); }}
                      className="px-4 py-2 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button 
                      onClick={(e) => handleDelete(rule.id, e)}
                      className="px-4 py-2 flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <GrammarModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingRule={editingRule}
      />
    </div>
  );
}
