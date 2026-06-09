'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store';
import { MODULES } from '@/types';
import { Menu, X, ChevronRight, CheckCircle, Target } from 'lucide-react';
import './globals.css';
import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/userStore';
import UserMenu from '@/components/UserMenu';

// ===== DataLoader: 用户数据初始化 + 自动保存 =====
function DataLoader({ children }: { children: React.ReactNode }) {
  const initDone = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    // 1. 从旧版存储迁移
    migrateOldData();

    // 2. 确保至少有一个用户
    useUserStore.getState().ensureUser();

    // 3. 加载当前用户数据
    const uid = useUserStore.getState().currentUserId;
    if (uid) {
      useStore.getState().loadForUser(uid);
    }
    setReady(true);

    // 4. 设置自动保存订阅
    let saving = false;
    const unsubData = useStore.subscribe((state) => {
      if (saving) return;
      saving = true;
      requestAnimationFrame(() => {
        try {
          const userId = useUserStore.getState().currentUserId;
          if (userId) {
            const { loadForUser, resetData, ...savable } = state;
            localStorage.setItem(`fyp-data-${userId}`, JSON.stringify(savable));
          }
        } catch {}
        saving = false;
      });
    });

    return () => {
      unsubData();
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm">
        <div className="text-center animate-fade-in">
          <span className="text-4xl">🧭</span>
          <p className="text-muted text-sm mt-3">加载中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/** 从旧版 localStorage 迁移数据到新格式 */
function migrateOldData() {
  try {
    const oldKey = 'find-your-purpose-storage';
    const raw = localStorage.getItem(oldKey);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    // Zustand persist 格式: { state: {...} }
    const oldState = parsed.state || parsed;
    if (!oldState || !Object.keys(oldState).length) {
      localStorage.removeItem(oldKey);
      return;
    }

    // 创建默认用户并写入数据
    const userStore = useUserStore.getState();
    if (userStore.users.length === 0) {
      const id = globalThis.crypto?.randomUUID?.() || `migrated-${Date.now()}`;
      userStore.addUser('我');
      // userStore.addUser 会设置 currentUserId，但数据还没写
      const newId = useUserStore.getState().currentUserId;
      if (newId) {
        localStorage.setItem(`fyp-data-${newId}`, JSON.stringify(oldState));
      }
    }

    // 删除旧数据
    localStorage.removeItem(oldKey);
  } catch {
    // 迁移失败不阻塞
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const completedModules = useStore((s) => s.completedModules);
  const completedSteps = useStore((s) => s.completedSteps);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const totalSteps = MODULES.reduce((acc, m) => acc + m.steps.length, 0);
  const doneSteps = Object.values(completedSteps).reduce((acc, arr) => acc + arr.length, 0);
  const progressPct = totalSteps > 0 ? (doneSteps / totalSteps) * 100 : 0;

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: '/', label: '路线图', emoji: '🗺️' },
    ...MODULES.map((m) => ({ path: `/${m.id}`, label: m.subtitle, emoji: m.emoji })),
    { path: '/dashboard', label: '仪表盘', emoji: '📊' },
    { path: '/settings', label: 'AI 设置', emoji: '⚙️' },
  ];

  return (
    <DataLoader>
      <html lang="zh-CN">
        <head>
          <title>找到你想做的事 — 交互指南</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body className="min-h-screen flex">
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Sidebar */}
          <aside className={`
            fixed lg:sticky top-0 left-0 z-50 h-screen
            w-72 lg:w-64 bg-white/95 backdrop-blur-sm border-r border-border-warm
            transform transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 flex flex-col shadow-xl lg:shadow-none
          `}>
            {/* Logo area + close button */}
            <div className="flex items-center justify-between p-4 lg:p-5 border-b border-border-warm/50">
              <Link href="/" className="flex items-center gap-2 group" onClick={() => setSidebarOpen(false)}>
                <span className="text-2xl">🧭</span>
                <div>
                  <h1 className="font-bold text-ink text-sm leading-tight">找到你想做的事</h1>
                  <p className="text-[11px] text-muted">交互式自我认知指南</p>
                </div>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 -mr-2 rounded-xl hover:bg-amber-50 text-muted hover:text-ink transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 lg:space-y-1">
              {navItems.map((item) => {
                const isModule = item.path.startsWith('/module');
                const modId = isModule ? item.path.replace('/', '') : null;
                const mod = modId ? MODULES.find((m) => m.id === modId) : null;
                const stepsDone = modId ? (completedSteps[modId]?.length || 0) : 0;
                const stepsTotal = mod?.steps.length || 0;
                const isAllDone = stepsTotal > 0 && stepsDone >= stepsTotal;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 lg:px-3 py-3 lg:py-2.5 rounded-xl text-sm
                      transition-all duration-150 group min-h-[44px]
                      ${isActive(item.path)
                        ? 'bg-primary-light text-primary-dark font-medium shadow-sm'
                        : 'text-muted hover:bg-amber-50 active:bg-amber-100 hover:text-ink'
                      }
                    `}
                  >
                    <span className="text-lg flex-shrink-0">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{item.label}</div>
                      {isModule && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex-1 h-1 bg-amber-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${stepsTotal > 0 ? (stepsDone / stepsTotal) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted">{stepsDone}/{stepsTotal}</span>
                        </div>
                      )}
                    </div>
                    {isActive(item.path) && <ChevronRight size={14} className="text-primary flex-shrink-0" />}
                    {isAllDone && <CheckCircle size={14} className="text-accent flex-shrink-0" />}
                  </Link>
                );
              })}
            </nav>

            {/* User section */}
            <div className="border-t border-border-warm/50 px-2 py-1">
              <UserMenu />
            </div>

            {/* Global progress */}
            <div className="p-4 border-t border-border-warm/50 bg-warm/50">
              <div className="flex items-center justify-between text-xs text-muted mb-1.5">
                <span>总进度</span>
                <span>{doneSteps}/{totalSteps} 步</span>
              </div>
              <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-700"
                  style={{ width: `${mounted ? progressPct : 0}%` }}
                />
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 flex flex-col min-h-screen">
            {/* Mobile top bar */}
            <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-border-warm/50 px-3 py-2.5 flex items-center justify-between gap-2">
              <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-1 rounded-xl hover:bg-amber-50 active:bg-amber-100 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
                <Menu size={22} className="text-ink" />
              </button>
              <span className="text-sm font-medium text-ink truncate">
                {navItems.find(i => isActive(i.path))?.emoji}{' '}
                {navItems.find(i => isActive(i.path))?.label || '找到你想做的事'}
              </span>
              <Link href="/dashboard" className="p-2 -mr-1 rounded-xl hover:bg-amber-50 active:bg-amber-100 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
                <span className="text-lg">📊</span>
              </Link>
            </header>

            <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full animate-fade-in">
              {children}
            </main>

            <footer className="text-center text-xs text-muted/60 py-4 border-t border-border-warm/30">
              基于《如何找到你想做的事》八木仁平 · 交互式自我认知工具
            </footer>
          </div>
        </body>
      </html>
    </DataLoader>
  );
}
