'use client';

import { useStore } from '@/store';
import { MODULES } from '@/types';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Sparkles, Target, Heart, Zap, Compass } from 'lucide-react';
import ExportReport from '@/components/ExportReport';

export default function DashboardPage() {
  const store = useStore();

  const totalSteps = MODULES.reduce((acc, m) => acc + m.steps.length, 0);
  const doneSteps = Object.values(store.completedSteps).reduce((acc, arr) => acc + arr.length, 0);
  const progressPct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  const passedHypotheses = store.hypotheses.filter(h => h.passedFilter === true);
  const hasData = store.valueKeywords.length > 0 || store.talents.length > 0 || store.passions.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-6 text-center py-16">
        <span className="text-6xl">📊</span>
        <h1 className="text-2xl font-bold text-ink">你的个人仪表盘</h1>
        <p className="text-muted max-w-md mx-auto">还没有数据。完成至少一个模块后，这里会展示你的完整自我认知报告。</p>
        <Link href="/module1" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full font-medium transition-all">
          开始模块1 <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <span className="text-4xl">📊</span>
        <h1 className="text-2xl font-bold text-ink mt-2">你的自我认知报告</h1>
        <p className="text-muted text-sm mt-1">基于《如何找到你想做的事》方法的完整输出</p>
      </div>

      {/* Progress overview */}
      <div className="bg-surface rounded-2xl border border-border-warm/50 p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-ink flex items-center gap-2"><Target size={18} /> 总体进度</h2>
          <span className="text-sm font-medium text-primary">{progressPct}%</span>
        </div>
        <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="text-xs text-muted mt-1.5">{doneSteps}/{totalSteps} 步骤已完成</p>
      </div>

      {/* Module completion status */}
      <div className="grid md:grid-cols-4 gap-3">
        {MODULES.map((mod) => {
          const stepsDone = store.completedSteps[mod.id]?.length || 0;
          const total = mod.steps.length;
          const allDone = stepsDone >= total;
          return (
            <Link key={mod.id} href={`/${mod.id}`}
              className={`rounded-xl p-4 border-2 card-hover ${allDone ? 'bg-accent-light/20 border-accent/30' : 'bg-surface border-border-warm/50 hover:border-primary/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{mod.emoji}</span>
                <div className="text-xs font-medium text-ink truncate">{mod.title}</div>
                {allDone && <CheckCircle size={14} className="text-accent flex-shrink-0" />}
              </div>
              <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(stepsDone / total) * 100}%` }} />
              </div>
              <p className="text-[10px] text-muted mt-1">{stepsDone}/{total}</p>
            </Link>
          );
        })}
      </div>

      {/* Export section */}
      <ExportReport />

      {/* Values section */}
      {store.coreValues.length > 0 && (
        <section className="bg-surface rounded-2xl border border-border-warm/50 p-5 md:p-6">
          <h2 className="font-semibold text-ink flex items-center gap-2 mb-4"><Compass size={18} className="text-primary" /> 你的价值观（Why）</h2>

          {/* Pyramid */}
          <div className="mb-4">
            {store.coreValues.sort((a, b) => a.order - b.order).map((cv, idx, arr) => {
              const width = 100 - idx * (arr.length > 1 ? 55 / arr.length : 0);
              return (
                <div key={cv.id} className="flex justify-center mb-1.5">
                  <div className="bg-gradient-to-r from-primary/90 to-amber-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-all" style={{ width: `${Math.max(width, 30)}%` }}>
                    {idx === 0 && <span className="text-[10px] block opacity-80">🎯 最终目的</span>}
                    {cv.text}
                  </div>
                </div>
              );
            })}
          </div>

          {store.workPurpose && (
            <div className="bg-accent-light/30 border border-accent/30 rounded-xl p-4 text-center">
              <p className="text-xs text-muted">工作目的</p>
              <p className="text-accent font-bold">&ldquo;{store.workPurpose}&rdquo;</p>
            </div>
          )}

          {store.valueKeywords.length > 0 && (
            <details className="mt-4">
              <summary className="text-sm text-muted cursor-pointer hover:text-ink">查看全部关键词 ({store.valueKeywords.length})</summary>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {store.valueKeywords.map(k => (
                  <span key={k.id} className="bg-amber-50 text-ink px-2.5 py-1 rounded-full text-xs border border-border-warm/50">{k.text}</span>
                ))}
              </div>
            </details>
          )}
        </section>
      )}

      {/* Talents section */}
      {store.talents.length > 0 && (
        <section className="bg-surface rounded-2xl border border-border-warm/50 p-5 md:p-6">
          <h2 className="font-semibold text-ink flex items-center gap-2 mb-4"><Zap size={18} className="text-primary" /> 你的才能（How）——《自己的使用说明书》</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {store.talents.map((t, i) => (
              <div key={t.id} className="flex items-center gap-2 bg-amber-50/50 rounded-xl p-3">
                <span className={`text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center ${t.level === '◎' ? 'bg-primary text-white' : t.level === '〇' ? 'bg-amber-200 text-ink' : 'bg-amber-100 text-muted'}`}>
                  {t.level}
                </span>
                <div>
                  <p className="text-sm text-ink font-medium">{t.description}</p>
                  {t.howToUse && <p className="text-[11px] text-muted">{t.howToUse}</p>}
                </div>
              </div>
            ))}
          </div>
          {store.flawTransformations.length > 0 && (
            <details className="mt-3">
              <summary className="text-sm text-muted cursor-pointer hover:text-ink">查看缺点→优点转换 ({store.flawTransformations.length})</summary>
              <div className="space-y-1.5 mt-2">
                {store.flawTransformations.map((ft, i) => (
                  <p key={i} className="text-xs text-muted">❌ {ft.flaw} → ✅ {ft.transformation}</p>
                ))}
              </div>
            </details>
          )}
        </section>
      )}

      {/* Passions section */}
      {store.passions.length > 0 && (
        <section className="bg-surface rounded-2xl border border-border-warm/50 p-5 md:p-6">
          <h2 className="font-semibold text-ink flex items-center gap-2 mb-4"><Heart size={18} className="text-primary" /> 你的热情（What）</h2>
          <div className="flex flex-wrap gap-2">
            {store.passions.map(p => (
              <span key={p.id} className="bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-sm border border-red-200/50">{p.area}</span>
            ))}
          </div>
        </section>
      )}

      {/* Hypotheses section */}
      {store.hypotheses.length > 0 && (
        <section className="bg-surface rounded-2xl border border-border-warm/50 p-5 md:p-6">
          <h2 className="font-semibold text-ink flex items-center gap-2 mb-4"><Sparkles size={18} className="text-primary" /> 你的"想做的事"候选</h2>

          {passedHypotheses.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-accent font-medium mb-2">✅ 通过筛选的候选</p>
              {passedHypotheses.map(h => (
                <div key={h.id} className="bg-accent-light/30 border border-accent/30 rounded-xl p-4 mb-2">
                  <p className="text-ink font-medium">{h.description}</p>
                  <p className="text-xs text-muted mt-1">评分 {h.score}/10 · ❤️ {h.passion} · ⚡ {h.talent}</p>
                </div>
              ))}
            </div>
          )}

          <details>
            <summary className="text-sm text-muted cursor-pointer hover:text-ink">全部假设 ({store.hypotheses.length})</summary>
            <div className="space-y-1.5 mt-2">
              {store.hypotheses.map(h => (
                <div key={h.id} className="flex items-center justify-between text-sm bg-amber-50/30 rounded-lg p-2.5">
                  <span className="text-ink">{h.description}</span>
                  <span className="text-xs text-muted">{h.score}/10</span>
                </div>
              ))}
            </div>
          </details>
        </section>
      )}

      {/* 隐私说明 */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-5 py-2.5 rounded-xl shadow-sm">
          <span className="text-base">🔒</span>
          <span className="font-medium">所有数据仅保存在你的浏览器中，不上传服务器</span>
        </div>
      </div>

      {/* CTA */}
      {passedHypotheses.length > 0 && (
        <div className="bg-accent-light/20 border border-accent/30 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-bold text-accent mb-2">✨ 你已经找到了方向！</h2>
          <p className="text-sm text-muted mb-4">现在就去实践验证吧。记住：一开始只是假设，在实践中修正。</p>
          <Link href="/module4" className="inline-flex items-center gap-2 bg-accent hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-medium transition-all">
            回到模块4制定验证计划 <ArrowRight size={18} />
          </Link>
        </div>
      )}

      {doneSteps < totalSteps && (
        <div className="text-center">
          <Link href={
            !store.isStepCompleted('module1', 'm1-s5') ? '/module1' :
            !store.isStepCompleted('module2', 'm2-s4') ? '/module2' :
            !store.isStepCompleted('module3', 'm3-s3') ? '/module3' :
            '/module4'
          } className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full font-medium transition-all">
            继续未完成的模块 <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
}
