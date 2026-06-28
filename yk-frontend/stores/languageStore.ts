import { create } from 'zustand';
import api from '../lib/api';

export interface Language {
  id: string;
  name: string;
  code: string;
  flagUrl?: string;
}

interface LanguageState {
  languages: Language[];
  userLanguages: Language[];
  activeLanguageId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchLanguages: () => Promise<void>;
  fetchUserLanguages: () => Promise<void>;
  setActiveLanguage: (id: string) => Promise<void>;
  addUserLanguage: (id: string) => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  languages: [],
  userLanguages: [],
  activeLanguageId: null,
  isLoading: false,
  error: null,

  fetchLanguages: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/languages');
      if (response.data.success) {
        set({ languages: response.data.data });
      }
    } catch (error: any) {
      set({ error: error.response?.data?.errors?.[0] || 'Failed to fetch languages' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserLanguages: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/languages/mine');
      if (response.data.success) {
        set({ userLanguages: response.data.data });
      }
    } catch (error: any) {
      set({ error: error.response?.data?.errors?.[0] || 'Failed to fetch user languages' });
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveLanguage: async (id: string) => {
    try {
      const response = await api.put('/languages/active', { languageId: id });
      if (response.data.success) {
        set({ activeLanguageId: id });
      }
    } catch (error: any) {
      set({ error: error.response?.data?.errors?.[0] || 'Failed to set active language' });
    }
  },

  addUserLanguage: async (id: string) => {
    try {
      const response = await api.post('/languages/mine', { languageId: id });
      if (response.data.success) {
        await get().fetchUserLanguages();
        if (!get().activeLanguageId) {
          await get().setActiveLanguage(id);
        }
      }
    } catch (error: any) {
      set({ error: error.response?.data?.errors?.[0] || 'Failed to add user language' });
    }
  }
}));
