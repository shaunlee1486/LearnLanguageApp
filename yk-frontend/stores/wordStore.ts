import { create } from 'zustand';
import api from '../lib/api';

export interface WordMeaning {
  id?: string;
  typeOfWord: string;
  meaningText: string;
}

export interface WordExample {
  id?: string;
  sentence: string;
}

export interface Word {
  id: string;
  text: string;
  ipa?: string;
  audioUrl?: string;
  imageUrl?: string;
  note?: string;
  status: string;
  categoryId: string;
  createdDate: string;
  meanings: WordMeaning[];
  examples: WordExample[];
}

export interface DictionaryResult {
  word: string;
  phonetic?: string;
  audioUrl?: string;
}

interface WordState {
  words: Word[];
  reviewWords: Word[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;

  fetchWordsByCategory: (categoryId: string, page?: number, pageSize?: number) => Promise<void>;
  createWord: (categoryId: string, data: FormData) => Promise<void>;
  updateWord: (id: string, data: FormData) => Promise<void>;
  deleteWord: (id: string) => Promise<void>;
  markKnown: (id: string) => Promise<void>;
  
  fetchReviewList: (languageId: string) => Promise<void>;
  addToReviewList: (languageId: string, wordIds: string[]) => Promise<void>;
  removeFromReviewList: (languageId: string, wordId: string) => Promise<void>;

  lookupDictionary: (word: string, lang?: string) => Promise<DictionaryResult | null>;
}

export const useWordStore = create<WordState>((set, get) => ({
  words: [],
  reviewWords: [],
  isLoading: false,
  error: null,
  totalCount: 0,
  totalPages: 0,

  fetchWordsByCategory: async (categoryId: string, page = 1, pageSize = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/categories/${categoryId}/words`, {
        params: { page, pageSize }
      });
      if (response.data.success) {
        set({ 
            words: response.data.data,
            totalCount: response.data.meta?.totalCount || 0,
            totalPages: response.data.meta?.totalPages || 0,
            isLoading: false 
        });
      }
    } catch (error: any) {
      set({ error: error.response?.data?.errors?.[0] || 'Failed to fetch words', isLoading: false });
    }
  },

  createWord: async (categoryId: string, data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/categories/${categoryId}/words`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        // Refresh words list (would usually need page context, but we just re-fetch page 1)
        await get().fetchWordsByCategory(categoryId);
      }
    } catch (error: any) {
      set({ error: error.response?.data?.errors?.[0] || 'Failed to create word', isLoading: false });
      throw error;
    }
  },

  updateWord: async (id: string, data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/words/${id}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        // Update in place if present
        const currentWords = get().words;
        const index = currentWords.findIndex(w => w.id === id);
        if (index > -1 && response.data.data) {
            // Re-fetch category to ensure consistency (especially with pagination)
            const catId = currentWords[index].categoryId;
            await get().fetchWordsByCategory(catId);
        } else {
            set({ isLoading: false });
        }
      }
    } catch (error: any) {
      set({ error: error.response?.data?.errors?.[0] || 'Failed to update word', isLoading: false });
      throw error;
    }
  },

  deleteWord: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/words/${id}`);
      set((state) => ({
        words: state.words.filter(w => w.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.errors?.[0] || 'Failed to delete word', isLoading: false });
      throw error;
    }
  },

  markKnown: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/words/${id}/known`);
      set((state) => ({
        words: state.words.map(w => w.id === id ? { ...w, status: 'AlreadyKnown' } : w),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.errors?.[0] || 'Failed to mark word as known', isLoading: false });
      throw error;
    }
  },

  fetchReviewList: async (languageId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/review-list/${languageId}`);
      if (response.data.success) {
        set({ reviewWords: response.data.data, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.response?.data?.errors?.[0] || 'Failed to fetch review list', isLoading: false });
    }
  },

  addToReviewList: async (languageId: string, wordIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/review-list`, { languageId, wordIds });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.errors?.[0] || 'Failed to add words to review list', isLoading: false });
      throw error;
    }
  },

  removeFromReviewList: async (languageId: string, wordId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/review-list/${languageId}/words/${wordId}`);
      set((state) => ({
        reviewWords: state.reviewWords.filter(w => w.id !== wordId),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.errors?.[0] || 'Failed to remove from review list', isLoading: false });
      throw error;
    }
  },

  lookupDictionary: async (word: string, lang: string = 'en') => {
    try {
      const response = await api.get(`/dictionary/lookup`, { params: { word, lang } });
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      return null;
    }
  }
}));
