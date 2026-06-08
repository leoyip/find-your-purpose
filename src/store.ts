'use client';

import { create } from 'zustand';
import type { ValueEntry, CoreValue, TalentEntry, PassionEntry, Hypothesis } from '@/types';

interface AppState {
  // 进度追踪
  currentModule: string;
  completedModules: string[];
  completedSteps: Record<string, string[]>; // moduleId -> stepIds

  // 模块1：价值观
  valueKeywords: ValueEntry[];
  coreValues: CoreValue[];
  workPurpose: string;

  // 模块2：才能
  talents: TalentEntry[];
  flawTransformations: { flaw: string; transformation: string }[];

  // 模块3：热情
  passions: PassionEntry[];

  // 模块4：组合
  hypotheses: Hypothesis[];

  // Actions
  setCurrentModule: (id: string) => void;
  completeModule: (id: string) => void;
  completeStep: (moduleId: string, stepId: string) => void;
  isStepCompleted: (moduleId: string, stepId: string) => boolean;

  // Values actions
  addValueKeyword: (entry: ValueEntry) => void;
  removeValueKeyword: (id: string) => void;
  setCoreValues: (values: CoreValue[]) => void;
  updateCoreValue: (id: string, updates: Partial<CoreValue>) => void;
  setWorkPurpose: (purpose: string) => void;

  // Talent actions
  addTalent: (talent: TalentEntry) => void;
  updateTalent: (id: string, updates: Partial<TalentEntry>) => void;
  removeTalent: (id: string) => void;
  addFlawTransformation: (ft: { flaw: string; transformation: string }) => void;
  removeFlawTransformation: (index: number) => void;

  // Passion actions
  addPassion: (passion: PassionEntry) => void;
  removePassion: (id: string) => void;

  // Hypothesis actions
  addHypothesis: (h: Hypothesis) => void;
  updateHypothesis: (id: string, updates: Partial<Hypothesis>) => void;
  removeHypothesis: (id: string) => void;

  // User-aware persistence
  loadForUser: (userId: string) => void;
  resetData: (userId?: string) => void;
}

export const initialState = {
  currentModule: 'module1',
  completedModules: [] as string[],
  completedSteps: {} as Record<string, string[]>,
  valueKeywords: [] as ValueEntry[],
  coreValues: [] as CoreValue[],
  workPurpose: '',
  talents: [] as TalentEntry[],
  flawTransformations: [] as { flaw: string; transformation: string }[],
  passions: [] as PassionEntry[],
  hypotheses: [] as Hypothesis[],
};

export const useStore = create<AppState>()((set, get) => ({
  ...initialState,

  setCurrentModule: (id) => set({ currentModule: id }),

  completeModule: (id) =>
    set((state) => ({
      completedModules: state.completedModules.includes(id)
        ? state.completedModules
        : [...state.completedModules, id],
    })),

  completeStep: (moduleId, stepId) =>
    set((state) => {
      const steps = state.completedSteps[moduleId] || [];
      if (steps.includes(stepId)) return state;
      return {
        completedSteps: {
          ...state.completedSteps,
          [moduleId]: [...steps, stepId],
        },
      };
    }),

  isStepCompleted: (moduleId, stepId) => {
    const steps = get().completedSteps[moduleId] || [];
    return steps.includes(stepId);
  },

  // Values
  addValueKeyword: (entry) =>
    set((state) => ({ valueKeywords: [...state.valueKeywords, entry] })),
  removeValueKeyword: (id) =>
    set((state) => ({
      valueKeywords: state.valueKeywords.filter((v) => v.id !== id),
    })),
  setCoreValues: (values) => set({ coreValues: values }),
  updateCoreValue: (id, updates) =>
    set((state) => ({
      coreValues: state.coreValues.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    })),
  setWorkPurpose: (purpose) => set({ workPurpose: purpose }),

  // Talent
  addTalent: (talent) =>
    set((state) => ({ talents: [...state.talents, talent] })),
  updateTalent: (id, updates) =>
    set((state) => ({
      talents: state.talents.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
  removeTalent: (id) =>
    set((state) => ({
      talents: state.talents.filter((t) => t.id !== id),
    })),
  addFlawTransformation: (ft) =>
    set((state) => ({
      flawTransformations: [...state.flawTransformations, ft],
    })),
  removeFlawTransformation: (index) =>
    set((state) => ({
      flawTransformations: state.flawTransformations.filter((_, i) => i !== index),
    })),

  // Passion
  addPassion: (passion) =>
    set((state) => ({ passions: [...state.passions, passion] })),
  removePassion: (id) =>
    set((state) => ({
      passions: state.passions.filter((p) => p.id !== id),
    })),

  // Hypothesis
  addHypothesis: (h) =>
    set((state) => ({ hypotheses: [...state.hypotheses, h] })),
  updateHypothesis: (id, updates) =>
    set((state) => ({
      hypotheses: state.hypotheses.map((h) =>
        h.id === id ? { ...h, ...updates } : h
      ),
    })),
  removeHypothesis: (id) =>
    set((state) => ({
      hypotheses: state.hypotheses.filter((h) => h.id !== id),
    })),

  // === User-aware persistence ===

  loadForUser: (userId: string) => {
    try {
      const saved = localStorage.getItem(`fyp-data-${userId}`);
      if (saved) {
        const data = JSON.parse(saved);
        set({ ...data });
      } else {
        set({ ...initialState });
      }
    } catch {
      set({ ...initialState });
    }
  },

  resetData: (userId?: string) => {
    set({ ...initialState });
    if (userId) {
      try { localStorage.removeItem(`fyp-data-${userId}`); } catch {}
    }
  },
}));
