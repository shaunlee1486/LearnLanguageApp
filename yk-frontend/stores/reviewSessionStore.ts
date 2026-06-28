import { create } from 'zustand';
import api from '../lib/api';

interface WordMeaning {
  id: string;
  typeOfWord: string;
  meaningText: string;
}

interface WordExample {
  id: string;
  sentence: string;
}

export interface ReviewWord {
  id: string;
  text: string;
  ipa: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  note: string | null;
  status: number;
  meanings: WordMeaning[];
  examples: WordExample[];
}

export interface ReviewSession {
  id: string;
  languageId: string;
  startTime: string;
  mode: number; // 0=FlashCards, 1=Quiz, 2=TypeAnswer
  words: ReviewWord[];
}

export interface ReviewResultItem {
  wordId: string;
  isCorrect: boolean;
}

export interface ReviewSummary {
  totalWords: number;
  correctCount: number;
  scorePercentage: number;
  durationSeconds: number;
}

interface ReviewSessionState {
  currentSession: ReviewSession | null;
  results: ReviewResultItem[];
  summary: ReviewSummary | null;
  isLoading: boolean;
  error: string | null;

  setCurrentSession: (session: ReviewSession) => void;
  addResult: (wordId: string, isCorrect: boolean) => void;
  submitSession: () => Promise<void>;
  resetSession: () => void;
}

export const useReviewSessionStore = create<ReviewSessionState>((set, get) => ({
  currentSession: null,
  results: [],
  summary: null,
  isLoading: false,
  error: null,

  setCurrentSession: (session) => {
    set({ currentSession: session, results: [], summary: null, error: null });
  },

  addResult: (wordId, isCorrect) => {
    const { results } = get();
    // Update if exists, else push
    const existingIndex = results.findIndex(r => r.wordId === wordId);
    if (existingIndex >= 0) {
      const newResults = [...results];
      newResults[existingIndex].isCorrect = isCorrect;
      set({ results: newResults });
    } else {
      set({ results: [...results, { wordId, isCorrect }] });
    }
  },

  submitSession: async () => {
    const { currentSession, results } = get();
    if (!currentSession) return;

    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/review/session/${currentSession.id}/submit`, {
        results
      });
      if (response.data.success) {
        set({ summary: response.data.data, currentSession: null, isLoading: false });
      } else {
        set({ error: response.data.errors?.[0] || 'Failed to submit session', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.errors?.[0] || 'Error submitting session', isLoading: false });
    }
  },

  resetSession: () => {
    set({ currentSession: null, results: [], summary: null, error: null });
  }
}));
