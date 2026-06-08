'use client';

import { useState, useRef, useEffect } from 'react';
import { useUserStore } from '@/userStore';
import { useStore } from '@/store';
import { User, Plus, Trash2, LogOut, RefreshCw, Check, X, ChevronDown } from 'lucide-react';

export default function UserMenu() {
  const { users, currentUserId, addUser, switchUser, deleteUser, renameUser } = useUserStore();
  const loadForUser = useStore((s) => s.loadForUser);
  const resetData = useStore((s) => s.resetData);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const currentUser = users.find((u) => u.id === currentUserId);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSwitch = (id: string) => {
    if (id === currentUserId) return;
    switchUser(id);
    loadForUser(id);
    setOpen(false);
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const id = addUser(newName.trim());
    setNewName('');
    setAdding(false);
    loadForUser(id);
  };

  const handleDelete = (id: string) => {
    if (users.length <= 1) {
      alert('至少需要保留一个用户');
      return;
    }
    const name = users.find((u) => u.id === id)?.name;
    if (!confirm(`确定删除用户"${name}"及其所有数据？此操作不可撤销。`)) return;
    const willSwitch = id === currentUserId;
    deleteUser(id);
    if (willSwitch) {
      const remaining = users.filter((u) => u.id !== id);
      const nextId = remaining[0]?.id;
      if (nextId) loadForUser(nextId);
    }
  };

  const handleReset = () => {
    if (!confirm('确定重置当前用户的所有进度？所有答题记录将被清除。此操作不可撤销。')) return;
    if (currentUserId) resetData(currentUserId);
  };

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const confirmRename = () => {
    if (editingId && editName.trim()) {
      renameUser(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm
                   text-muted hover:text-ink hover:bg-amber-50 transition-all min-h-[44px] group"
      >
        <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
          {currentUser?.name?.charAt(0) || '?'}
        </span>
        <span className="flex-1 text-left truncate">{currentUser?.name || '添加用户'}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''} text-muted`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl border border-border-warm shadow-xl z-50 p-2 max-h-80 overflow-y-auto animate-fade-in">
          {/* User list */}
          <div className="space-y-0.5 mb-2">
            <p className="text-[11px] text-muted px-2 py-1 font-medium">切换用户</p>
            {users.map((u) => (
              <div
                key={u.id}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-all min-h-[40px] group ${
                  u.id === currentUserId
                    ? 'bg-primary-light text-primary-dark'
                    : 'hover:bg-amber-50 text-ink cursor-pointer'
                }`}
                onClick={() => u.id !== currentUserId && handleSwitch(u.id)}
              >
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {u.name.charAt(0)}
                </span>

                {editingId === u.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setEditingId(null); }}
                      className="flex-1 px-2 py-0.5 rounded border border-primary/40 text-sm bg-white focus:outline-none"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button onClick={(e) => { e.stopPropagation(); confirmRename(); }} className="p-0.5 text-accent hover:text-accent">
                      <Check size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="p-0.5 text-muted hover:text-ink">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 truncate">{u.name}</span>
                    {u.id === currentUserId && <span className="text-[10px] text-primary font-medium">当前</span>}
                    <button
                      onClick={(e) => { e.stopPropagation(); startRename(u.id, u.name); }}
                      className="p-0.5 opacity-0 group-hover:opacity-100 text-muted hover:text-ink transition-all"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(u.id); }}
                      className="p-0.5 opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add user */}
          {adding ? (
            <div className="flex items-center gap-1 px-2 py-1.5">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
                placeholder="输入用户名..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-border-warm text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                autoFocus
              />
              <button onClick={handleAdd} disabled={!newName.trim()} className="p-1.5 text-accent hover:text-accent disabled:text-muted/50">
                <Check size={16} />
              </button>
              <button onClick={() => setAdding(false)} className="p-1.5 text-muted hover:text-ink">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-muted hover:text-ink hover:bg-amber-50 transition-all"
            >
              <Plus size={14} />
              <span>新建用户</span>
            </button>
          )}

          {/* Divider */}
          <div className="border-t border-border-warm/50 my-1" />

          {/* Reset current user */}
          <button
            onClick={handleReset}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-all"
          >
            <RefreshCw size={14} />
            <span>重置当前用户进度</span>
          </button>
        </div>
      )}
    </div>
  );
}
