'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIProvider } from '@/lib/ai-providers';
import { getDefaultProvider } from '@/lib/ai-providers';

export interface UserProfile {
  id: string;
  name: string;
  createdAt: number;
  // AI 自定义设置（用户可选配置自己的 API Key）
  aiProvider?: string;
  aiApiKey?: string;
  aiModel?: string;
}

interface UserStore {
  users: UserProfile[];
  currentUserId: string | null;

  addUser: (name: string) => string;
  switchUser: (id: string) => void;
  deleteUser: (id: string) => void;
  renameUser: (id: string, name: string) => void;
  ensureUser: () => void;

  /** 获取当前用户的 AI 配置（含默认值） */
  getAiConfig: () => { provider: AIProvider | undefined; apiKey: string; model: string };

  // AI 设置
  setAiProvider: (providerId: string) => void;
  setAiApiKey: (key: string) => void;
  setAiModel: (modelId: string) => void;
  clearAiSettings: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,

      addUser: (name: string) => {
        const id = globalThis.crypto?.randomUUID?.() || `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const newUser: UserProfile = { id, name, createdAt: Date.now() };
        set((s) => ({
          users: [...s.users, newUser],
          currentUserId: id,
        }));
        return id;
      },

      switchUser: (id: string) => {
        set({ currentUserId: id });
      },

      deleteUser: (id: string) => {
        const { users, currentUserId } = get();
        const remaining = users.filter((u) => u.id !== id);
        set({
          users: remaining,
          currentUserId: currentUserId === id ? (remaining[0]?.id || null) : currentUserId,
        });
        try { localStorage.removeItem(`fyp-data-${id}`); } catch {}
      },

      renameUser: (id: string, name: string) => {
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, name } : u)),
        }));
      },

      ensureUser: () => {
        const { users, currentUserId } = get();
        if (users.length === 0) {
          const id = globalThis.crypto?.randomUUID?.() || `u-${Date.now()}`;
          set({
            users: [{ id, name: '我', createdAt: Date.now() }],
            currentUserId: id,
          });
        } else if (!currentUserId || !users.find((u) => u.id === currentUserId)) {
          set({ currentUserId: users[0].id });
        }
      },

      getAiConfig: () => {
        const { users, currentUserId } = get();
        const user = users.find((u) => u.id === currentUserId);
        const defaultProvider = getDefaultProvider();
        return {
          provider: user?.aiProvider ? undefined : defaultProvider,
          apiKey: user?.aiApiKey || '',
          model: user?.aiModel || defaultProvider.models[0].id,
        };
      },

      // AI 设置
      setAiProvider: (providerId: string) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => ({
          users: s.users.map((u) =>
            u.id === currentUserId ? { ...u, aiProvider: providerId, aiModel: undefined } : u
          ),
        }));
      },

      setAiApiKey: (key: string) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => ({
          users: s.users.map((u) =>
            u.id === currentUserId ? { ...u, aiApiKey: key } : u
          ),
        }));
      },

      setAiModel: (modelId: string) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => ({
          users: s.users.map((u) =>
            u.id === currentUserId ? { ...u, aiModel: modelId } : u
          ),
        }));
      },

      clearAiSettings: () => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => ({
          users: s.users.map((u) =>
            u.id === currentUserId ? { ...u, aiProvider: undefined, aiApiKey: undefined, aiModel: undefined } : u
          ),
        }));
      },
    }),
    { name: 'fyp-users' }
  )
);
