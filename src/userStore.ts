'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  name: string;
  createdAt: number;
}

interface UserStore {
  users: UserProfile[];
  currentUserId: string | null;

  addUser: (name: string) => string;
  switchUser: (id: string) => void;
  deleteUser: (id: string) => void;
  renameUser: (id: string, name: string) => void;
  ensureUser: () => void; // Create default user if none exists
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
        // Clean up data
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
    }),
    { name: 'fyp-users' }
  )
);
