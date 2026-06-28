import { create } from 'zustand';
import { categoryService } from '../services/categoryService';

export interface Category {
  id: string;
  languageId: string;
  name: string;
  description?: string;
  wordCount: number;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface CategoryState {
  categories: Category[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  
  fetchCategories: (page?: number, pageSize?: number) => Promise<void>;
  createCategory: (data: { name: string; description?: string }) => Promise<boolean>;
  updateCategory: (id: string, data: { name: string; description?: string }) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  meta: null,
  isLoading: false,
  error: null,

  fetchCategories: async (page = 1, pageSize = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryService.getCategories(page, pageSize);
      if (response.data.success) {
        set({ 
          categories: response.data.data,
          meta: response.data.meta 
        });
      }
    } catch (error: any) {
      set({ error: error.response?.data?.errors?.[0] || 'Failed to fetch categories' });
    } finally {
      set({ isLoading: false });
    }
  },

  createCategory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryService.createCategory(data);
      if (response.data.success) {
        // Refresh first page
        await get().fetchCategories(1);
        return true;
      }
      return false;
    } catch (error: any) {
      set({ error: error.response?.data?.errors?.[0] || 'Failed to create category' });
      set({ isLoading: false });
      return false;
    }
  },

  updateCategory: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryService.updateCategory(id, data);
      if (response.data.success) {
        // Refresh current page
        await get().fetchCategories(get().meta?.page || 1);
        return true;
      }
      return false;
    } catch (error: any) {
      set({ error: error.response?.data?.errors?.[0] || 'Failed to update category' });
      set({ isLoading: false });
      return false;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryService.deleteCategory(id);
      if (response.data.success) {
        // Refresh current page
        await get().fetchCategories(get().meta?.page || 1);
        return true;
      }
      return false;
    } catch (error: any) {
      set({ error: error.response?.data?.errors?.[0] || 'Failed to delete category' });
      set({ isLoading: false });
      return false;
    }
  }
}));
