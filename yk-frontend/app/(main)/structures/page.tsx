'use client';

import React, { useEffect, useState } from 'react';
import { useSentenceStructureStore, SentenceStructure } from '../../../stores/sentenceStructureStore';
import { useLanguageStore } from '../../../stores/languageStore';
import { Network, Plus, Trash2, Edit2, ChevronDown, ChevronUp, Loader2, Target } from 'lucide-react';
import Link from 'next/link';
import StructureModal from '../../../components/structures/StructureModal';

export default function StructuresPage() {
  const { structures, fetchStructures, deleteStructure, isLoading, error } = useSentenceStructureStore();
  const { activeLanguageId, userLanguages } = useLanguageStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<SentenceStructure | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (activeLanguageId) {
      fetchStructures();
    }
  }, [activeLanguageId, fetchStructures]);

  const activeLanguage = userLanguages.find(l => l.id === activeLanguageId);

  const handleEdit = (structure: SentenceStructure) => {
    setEditingStructure(structure);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingStructure(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this structure?')) {
      await deleteStructure(id);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  if (!activeLanguageId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Network className="w-16 h-16 text-slate-700 mb-6" />
        <h2 className="text-2xl font-bold text-slate-300 mb-2">No Language Selected</h2>
        <p className="text-slate-500">Please select an active language to view sentence structures.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            Sentence Structures
            {activeLanguage && (
              <span className="text-sm px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                {activeLanguage.name}
              </span>
            )}
          </h1>
          <p className="text-slate-400 mt-1">Master how to build sentences</p>
        </div>
        
        <div className="flex items-center gap-3">
          {structures.length >= 2 && (
            <Link
              href="/structures/test"
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
            Add Structure
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {isLoading && structures.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
      ) : structures.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-700/50 rounded-2xl bg-slate-900/30">
          <Network className="w-16 h-16 text-slate-700 mb-4" />
          <h3 className="text-xl font-bold text-slate-300 mb-2">No structures yet</h3>
          <p className="text-slate-500 mb-6 text-center max-w-md">
            Start adding sentence patterns to understand how sentences are formed.
          </p>
          <button
            onClick={handleAddNew}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors"
          >
            Add Your First Structure
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {structures.map((structure) => (
            <div 
              key={structure.id} 
              className={`bg-slate-900 border rounded-2xl transition-all overflow-hidden ${
                expandedId === structure.id ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div 
                className="p-5 flex items-center justify-between cursor-pointer select-none"
                onClick={() => toggleExpand(structure.id)}
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-200 mb-1">{structure.pattern}</h3>
                  <p className="text-sm text-indigo-300">{structure.vietnameseMeaning}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-slate-500 text-sm font-medium mr-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center mr-2">{structure.examples.length}</span>
                    examples
                  </div>
                  {expandedId === structure.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {expandedId === structure.id && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800 bg-slate-900/50 animate-in slide-in-from-top-2 duration-200">
                  {structure.examples.length > 0 && (
                    <div className="mb-6 mt-4">
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Examples</h4>
                      <ul className="space-y-3">
                        {structure.examples.map(ex => (
                          <li key={ex.id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <div className="text-slate-200 font-medium mb-1">{ex.sentence}</div>
                            <div className="text-slate-400 text-sm italic">{ex.meaning}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(structure); }}
                      className="px-4 py-2 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button 
                      onClick={(e) => handleDelete(structure.id, e)}
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

      <StructureModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingStructure={editingStructure}
      />
    </div>
  );
}
