import { create } from 'zustand';
import api from '../lib/api';

export interface SentenceStructureExample {
  id: string;
  sentence: string;
  meaning: string;
}

export interface SentenceStructure {
  id: string;
  pattern: string;
  vietnameseMeaning: string;
  examples: SentenceStructureExample[];
}

interface SentenceStructureState {
  structures: SentenceStructure[];
  isLoading: boolean;
  error: string | null;

  fetchStructures: () => Promise<void>;
  createStructure: (pattern: string, vietnameseMeaning: string, examples: { sentence: string, meaning: string }[]) => Promise<boolean>;
  updateStructure: (id: string, pattern: string, vietnameseMeaning: string, examples: { sentence: string, meaning: string }[]) => Promise<boolean>;
  deleteStructure: (id: string) => Promise<boolean>;
}

export const useSentenceStructureStore = create<SentenceStructureState>((set, get) => ({
  structures: [],
  isLoading: false,
  error: null,

  fetchStructures: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/sentence-structure');
      if (response.data.success) {
        set({ structures: response.data.data });
      } else {
        set({ error: response.data.errors?.[0] || 'Failed to fetch structures' });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.errors?.[0] || 'An error occurred' });
    } finally {
      set({ isLoading: false });
    }
  },

  createStructure: async (pattern, vietnameseMeaning, examples) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/sentence-structure', { pattern, vietnameseMeaning, examples });
      if (response.data.success) {
        await get().fetchStructures();
        return true;
      } else {
        set({ error: response.data.errors?.[0] || 'Failed to create structure', isLoading: false });
        return false;
      }
    } catch (err: any) {
      set({ error: err.response?.data?.errors?.[0] || 'An error occurred', isLoading: false });
      return false;
    }
  },

  updateStructure: async (id, pattern, vietnameseMeaning, examples) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/sentence-structure/${id}`, { pattern, vietnameseMeaning, examples });
      if (response.data.success) {
        await get().fetchStructures();
        return true;
      } else {
        set({ error: response.data.errors?.[0] || 'Failed to update structure', isLoading: false });
        return false;
      }
    } catch (err: any) {
      set({ error: err.response?.data?.errors?.[0] || 'An error occurred', isLoading: false });
      return false;
    }
  },

  deleteStructure: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`/sentence-structure/${id}`);
      if (response.data.success) {
        await get().fetchStructures();
        return true;
      } else {
        set({ error: response.data.errors?.[0] || 'Failed to delete structure', isLoading: false });
        return false;
      }
    } catch (err: any) {
      set({ error: err.response?.data?.errors?.[0] || 'An error occurred', isLoading: false });
      return false;
    }
  }
}));
