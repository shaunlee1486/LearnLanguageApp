import { create } from 'zustand';
import api from '../lib/api';

export interface GrammarExample {
  id: string;
  sentence: string;
}

export interface GrammarRule {
  id: string;
  name: string;
  description: string;
  examples: GrammarExample[];
}

interface GrammarState {
  rules: GrammarRule[];
  isLoading: boolean;
  error: string | null;

  fetchRules: () => Promise<void>;
  createRule: (name: string, description: string, examples: string[]) => Promise<boolean>;
  updateRule: (id: string, name: string, description: string, examples: string[]) => Promise<boolean>;
  deleteRule: (id: string) => Promise<boolean>;
}

export const useGrammarStore = create<GrammarState>((set, get) => ({
  rules: [],
  isLoading: false,
  error: null,

  fetchRules: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/grammar');
      if (response.data.success) {
        set({ rules: response.data.data });
      } else {
        set({ error: response.data.errors?.[0] || 'Failed to fetch grammar rules' });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.errors?.[0] || 'An error occurred' });
    } finally {
      set({ isLoading: false });
    }
  },

  createRule: async (name, description, examples) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/grammar', { name, description, examples });
      if (response.data.success) {
        await get().fetchRules();
        return true;
      } else {
        set({ error: response.data.errors?.[0] || 'Failed to create rule', isLoading: false });
        return false;
      }
    } catch (err: any) {
      set({ error: err.response?.data?.errors?.[0] || 'An error occurred', isLoading: false });
      return false;
    }
  },

  updateRule: async (id, name, description, examples) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/grammar/${id}`, { name, description, examples });
      if (response.data.success) {
        await get().fetchRules();
        return true;
      } else {
        set({ error: response.data.errors?.[0] || 'Failed to update rule', isLoading: false });
        return false;
      }
    } catch (err: any) {
      set({ error: err.response?.data?.errors?.[0] || 'An error occurred', isLoading: false });
      return false;
    }
  },

  deleteRule: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`/grammar/${id}`);
      if (response.data.success) {
        await get().fetchRules();
        return true;
      } else {
        set({ error: response.data.errors?.[0] || 'Failed to delete rule', isLoading: false });
        return false;
      }
    } catch (err: any) {
      set({ error: err.response?.data?.errors?.[0] || 'An error occurred', isLoading: false });
      return false;
    }
  }
}));
