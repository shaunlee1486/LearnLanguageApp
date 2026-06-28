'use client';

import React, { useEffect, useState } from 'react';
import { useCategoryStore, Category } from '../../../stores/categoryStore';
import { useLanguageStore } from '../../../stores/languageStore';
import { Plus, Edit2, Trash2, ArrowLeft, Loader2, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function CategoriesPage() {
  const { categories, meta, fetchCategories, createCategory, updateCategory, deleteCategory, isLoading, error } = useCategoryStore();
  const { activeLanguageId, userLanguages } = useLanguageStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch data when language changes
  useEffect(() => {
    if (activeLanguageId) {
      fetchCategories(1);
    }
  }, [activeLanguageId, fetchCategories]);

  const activeLanguage = userLanguages.find(l => l.id === activeLanguageId);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const openDeleteModal = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Category name is required');
      return;
    }

    let success = false;
    if (editingCategory) {
      success = await updateCategory(editingCategory.id, { name, description });
    } else {
      success = await createCategory({ name, description });
    }

    if (success) {
      setIsModalOpen(false);
    } else {
      // The store handles setting the global error, but we could also show it in the modal
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingCategory) {
      const success = await deleteCategory(deletingCategory.id);
      if (success) {
        setIsDeleteModalOpen(false);
      }
    }
  };

  if (!activeLanguageId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FolderOpen className="w-16 h-16 text-slate-700 mb-6" />
        <h2 className="text-2xl font-bold text-slate-300 mb-2">No Language Selected</h2>
        <p className="text-slate-500 mb-8 text-center max-w-md">
          Please select an active language from the header to view and manage your categories.
        </p>
        <Link 
          href="/languages" 
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-colors"
        >
          Manage Languages
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              Categories 
              {activeLanguage && (
                <span className="text-sm px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                  {activeLanguage.name}
                </span>
              )}
            </h1>
            <p className="text-slate-400 mt-1">Organize your vocabulary into thematic groups</p>
          </div>
        </div>
        
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create Category
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Grid of categories */}
      {isLoading && categories.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-700/50 rounded-2xl bg-slate-900/30">
          <FolderOpen className="w-16 h-16 text-slate-700 mb-4" />
          <h3 className="text-xl font-bold text-slate-300 mb-2">No categories yet</h3>
          <p className="text-slate-500 mb-6 text-center max-w-md">
            Create your first category to start organizing your vocabulary for {activeLanguage?.name}.
          </p>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group relative overflow-hidden flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                  {category.name}
                </h3>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(category)}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => openDeleteModal(category)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-1">
                {category.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800/50">
                <span>{category.wordCount || 0} words</span>
                <span>Created {format(new Date(category.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination (Simple implementation) */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button 
            disabled={meta.page <= 1}
            onClick={() => fetchCategories(meta.page - 1)}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
          >
            Previous
          </button>
          <span className="text-slate-400 text-sm">
            Page {meta.page} of {meta.totalPages}
          </span>
          <button 
            disabled={meta.page >= meta.totalPages}
            onClick={() => fetchCategories(meta.page + 1)}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
          >
            Next
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-slate-100">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/10 text-rose-400 text-sm rounded-lg border border-rose-500/20">
                  {formError}
                </div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  placeholder="e.g., Greetings, Food, Travel..."
                  autoFocus
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Description <span className="text-slate-500">(Optional)</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
                  placeholder="A short description about this category..."
                  rows={3}
                ></textarea>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">Delete Category?</h2>
            <p className="text-slate-400 mb-6 text-sm">
              Are you sure you want to delete the <span className="text-slate-200 font-semibold">{deletingCategory.name}</span> category? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-semibold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
