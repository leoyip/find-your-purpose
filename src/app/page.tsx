'use client';

import Link from 'next/link';
import { useStore } from '@/store';
import { MODULES } from '@/types';
import { ArrowRight, CheckCircle, Clock, Sparkles, Target } from 'lucide-react';

export default function HomePage() {
  const completedModules = useStore((s) => s.completedModules);
  const completedSteps = useStore((s) => s.completedSteps);
  const workPurpose = useStore((s) => s.workPurpose);

  const totalSteps = MODULES.reduce((acc, m) => acc + m.steps.length, 0);
  const doneSteps = Object.values(completedSteps).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-8 md:py-12">
        <div className="inline-flex items-center gap-2 bg-primary-light text-primary-dark px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <Sparkles size={16} />
          基于《如何找到你想做的事》八木仁平
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-ink leading-tight">
          用逻辑找到
          <span className="gradient-text"> 真正想做的事</span>
        </h1>
        <p className="mt-4 text-muted max-w-lg mx-auto text-base leading-relaxed">
          不是靠直觉和运气，而是通过一套系统的自我认知方法——
          <strong className="text-ink">价值观 × 才能 × 热情</strong>，
          找到你真正想做的事。
        </p>

        {/* Quick stats */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
          <div className="flex items-center gap-1.5">
            <Target size={14} /> <span>{MODULES.length} 个模块</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} /> <span>{totalSteps} 个步骤</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle size={14} /> <span>{doneSteps}/{totalSteps} 已完成</span>
          </div>
        </div>

        {doneSteps === 0 && (
          <Link
            href="/module1"
            className="mt-8 inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 animate-pulse-soft"
          >
            开始第一步：找到价值观 <ArrowRight size={18} />
          </Link>
        )}
      </section>

      {/* Roadmap */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
          <span>🗺️</span> 完整路线图
        </h2>
        <p className="text-sm text-muted -mt-1">
          按照这个顺序进行，效果最好。每个模块可以分多次完成。
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          {MODULES.map((mod, idx) => {
            const modDone = completedModules.includes(mod.id);
            const stepsDone = completedSteps[mod.id]?.length || 0;
            const totalModSteps = mod.steps.length;
            const allStepsDone = stepsDone >= totalModSteps;

            return (
              <Link
                key={mod.id}
                href={`/${mod.id}`}
                className={`
                  block p-5 rounded-2xl border-2 card-hover
                  ${allStepsDone
                    ? 'bg-accent-light/30 border-accent/30'
                    : modDone
                      ? 'bg-primary-light/50 border-primary/30'
                      : 'bg-surface border-border-warm/50 hover:border-primary/30'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{mod.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted">步骤 {idx + 1}</span>
                        {allStepsDone && <CheckCircle size={14} className="text-accent" />}
                      </div>
                      <h3 className="font-semibold text-ink">{mod.title}</h3>
                      <p className="text-xs text-muted mt-0.5">{mod.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-muted flex-shrink-0 mt-1" />
                </div>
                <p className="text-sm text-muted mt-3 line-clamp-2">{mod.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-primary"
                      style={{ width: `${(stepsDone / totalModSteps) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted font-mono">{stepsDone}/{totalModSteps}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Core formula */}
      <section className="bg-surface rounded-2xl border border-border-warm/50 p-6 md:p-8">
        <h2 className="text-lg font-semibold text-ink text-center mb-6">核心公式</h2>
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
          <FormulaCard emoji="❤️" label="喜欢的事" sub="热情 (What)" color="text-red-500" />
          <span className="text-2xl text-muted">×</span>
          <FormulaCard emoji="⚡" label="擅长的事" sub="才能 (How)" color="text-amber-500" />
          <span className="text-2xl text-muted">=</span>
          <FormulaCard emoji="🎯" label="想做的事" sub="假设" color="text-primary" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mt-3">
          <span className="text-sm text-muted">再 × 价值观 (Why)</span>
          <span className="text-2xl text-muted">=</span>
          <FormulaCard emoji="✨" label="真正想做的事" sub="人生目的" color="text-accent" />
        </div>
        {workPurpose && (
          <div className="mt-6 text-center p-4 bg-primary-light rounded-xl">
            <p className="text-xs text-muted">你的工作目的</p>
            <p className="text-primary-dark font-medium mt-1">&ldquo;{workPurpose}&rdquo;</p>
          </div>
        )}
      </section>

      {/* 导出报告提示 */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50/70 rounded-2xl border border-primary/20 p-5 md:p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">📄</span>
          <h2 className="text-lg font-semibold text-ink">完成所有问答，导出你的专属报告</h2>
        </div>
        <p className="text-sm text-muted max-w-lg mx-auto">
          完成全部 4 个模块的问答后，你可以在仪表盘中导出 <strong>Markdown</strong> 或 <strong>PDF</strong> 格式的完整自我认知报告，
          包含价值观金字塔、才能清单、兴趣领域和组合方案，方便你随时回顾和分享。
        </p>
        {doneSteps > 0 && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm">
            <div className="flex-1 max-w-xs h-2 bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-700"
                style={{ width: `${(doneSteps / totalSteps) * 100}%` }}
              />
            </div>
            <span className="text-muted font-mono text-xs">{doneSteps}/{totalSteps}</span>
          </div>
        )}
      </section>

      {/* 隐私说明 */}
      <section className="text-center py-4">
        <div className="inline-flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-5 py-2.5 rounded-xl shadow-sm">
          <span className="text-base">🔒</span>
          <span className="font-medium">所有数据仅保存在你的浏览器中，不上传服务器</span>
        </div>
      </section>

      {/* CTA */}
      {doneSteps > 0 && doneSteps < totalSteps && (
        <div className="text-center py-4">
          <Link
            href={
              completedSteps['module1']?.length < MODULES[0].steps.length
                ? '/module1'
                : completedSteps['module2']?.length < MODULES[1].steps.length
                  ? '/module2'
                  : completedSteps['module3']?.length < MODULES[2].steps.length
                    ? '/module3'
                    : '/module4'
            }
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full font-medium transition-all"
          >
            继续旅程 <ArrowRight size={18} />
          </Link>
        </div>
      )}

      {doneSteps >= totalSteps && (
        <div className="text-center py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-accent hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-medium transition-all"
          >
            查看你的完整报告 <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
}

function FormulaCard({ emoji, label, sub, color }: { emoji: string; label: string; sub: string; color: string }) {
  return (
    <div className="flex flex-col items-center bg-amber-50/50 rounded-xl px-4 py-3 min-w-[100px]">
      <span className="text-2xl">{emoji}</span>
      <span className={`text-sm font-semibold ${color}`}>{label}</span>
      <span className="text-[10px] text-muted">{sub}</span>
    </div>
  );
}
