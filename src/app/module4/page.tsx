'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Check, Sparkles, Trash2, Plus, Lightbulb } from 'lucide-react';
import AIAnalyzer from '@/components/AIAnalyzer';
import CsvImport from '@/components/CsvImport';

export default function Module4Page() {
  const store = useStore();
  const [step, setStep] = useState(0);
  const [selectedPassion, setSelectedPassion] = useState('');
  const [selectedTalent, setSelectedTalent] = useState('');
  const [hypothesisDesc, setHypothesisDesc] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [plan, setPlan] = useState({ action: '', timeline: '', measure: '' });

  const markStepDone = () => {
    const stepIds = ['m4-s1', 'm4-s2', 'm4-s3'];
    store.completeStep('module4', stepIds[step]);
  };

  const uniquePassions = [...new Set(store.passions.map(p => p.area))];
  const uniqueTalents = store.talents.map(t => t.description);

  const generateHypothesis = () => {
    if (!selectedPassion || !selectedTalent) return;
    const desc = hypothesisDesc || `用「${selectedTalent}」在「${selectedPassion}」领域创造价值`;
    store.addHypothesis({
      id: Date.now().toString(),
      passion: selectedPassion,
      talent: selectedTalent,
      description: desc,
      score: 5,
      passedFilter: null,
    });
    setHypothesisDesc('');
  };

  const isReady = store.passions.length > 0 && store.talents.length > 0 && store.coreValues.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">🔗</span>
        <div>
          <h1 className="text-2xl font-bold text-ink">组合成想做的事</h1>
          <p className="text-muted text-sm">What × How × Why — 找到真正想做的事</p>
        </div>
      </div>

      {/* Book reference hint */}
      <div className="bg-blue-50/80 border border-blue-200/60 rounded-xl p-3 md:p-4 flex items-start gap-3">
        <span className="text-lg flex-shrink-0 mt-0.5">📖</span>
        <div className="text-sm">
          <p className="font-medium text-blue-800">关联书中第七部分：组合成真正想做的事</p>
          <p className="text-blue-600/80 mt-0.5">
            建议先阅读书中关于 <strong>两个核心公式</strong> 的内容（第七部分）：
            <strong>「喜欢×擅长=想做的事」</strong> 和 <strong>「喜欢×擅长×重要=真正想做的事」</strong>。
            理解"想做的事最初只是假设"这个观念，大胆组合、小步验证。
          </p>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-none -mx-1 px-1">
        {[
          { id: 'm4-s1', label: '自由组合', emoji: '🧩' },
          { id: 'm4-s2', label: '工作目的筛选', emoji: '🎯' },
          { id: 'm4-s3', label: '验证计划', emoji: '📋' },
        ].map((s, i) => (
          <button key={s.id} onClick={() => { setStep(i); markStepDone(); }}
            className={`flex items-center gap-1.5 px-3 sm:px-3 py-2.5 sm:py-2 rounded-lg text-sm whitespace-nowrap transition-all flex-shrink-0 min-h-[44px] ${i === step ? 'bg-primary text-white shadow-md' : store.isStepCompleted('module4', s.id) ? 'bg-accent-light/50 text-accent font-medium' : 'bg-surface text-muted hover:bg-amber-50 border border-border-warm/30'}`}>
            <span>{s.emoji}</span>
            <span className="hidden sm:inline">{s.label}</span>
            {store.isStepCompleted('module4', s.id) && <Check size={12} />}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-2xl border border-border-warm/50 p-5 md:p-8 min-h-[400px]">
        {/* Step 0: 自由组合 */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-ink">🧩 自由组合：喜欢的事 × 擅长的事</h2>
              <p className="text-sm text-muted mt-1">从喜欢的领域选一个，再选一个你的长处，组合起来就是"假设想做的事"。量大于质，越多越好。</p>
            </div>

            {!isReady && (
              <div className="bg-amber-50 rounded-xl p-5 text-center text-muted text-sm">
                请先完成前三个模块（收集价值观、才能、热情），再回来组合。
                {store.passions.length === 0 && <p className="mt-1">缺少：兴趣领域</p>}
                {store.talents.length === 0 && <p>缺少：才能清单</p>}
              </div>
            )}

            {isReady && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-ink mb-2 block">❤️ 选择喜欢的事（热情）</label>
                    <select value={selectedPassion} onChange={(e) => setSelectedPassion(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border-warm bg-warm/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm">
                      <option value="">-- 选择一个兴趣领域 --</option>
                      {uniquePassions.map((p, i) => <option key={i} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-ink mb-2 block">⚡ 选择擅长的事（才能）</label>
                    <select value={selectedTalent} onChange={(e) => setSelectedTalent(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border-warm bg-warm/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm">
                      <option value="">-- 选择一个长处 --</option>
                      {uniqueTalents.map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-ink mb-2 block">描述这个组合</label>
                  <input value={hypothesisDesc} onChange={(e) => setHypothesisDesc(e.target.value)}
                    placeholder={`用「${selectedTalent || '你的长处'}」在「${selectedPassion || '你喜欢的领域'}」...`}
                    className="w-full px-4 py-3 rounded-xl border border-border-warm bg-warm/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm" />
                </div>

                <button onClick={generateHypothesis} disabled={!selectedPassion || !selectedTalent}
                  className="w-full py-3 bg-primary hover:bg-primary-dark disabled:bg-amber-200 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                  <Sparkles size={18} /> 生成假设
                </button>

                {/* AI 智能推荐组合 */}
                {store.talents.length >= 3 && store.passions.length >= 3 && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={16} className="text-primary" />
                      <span className="text-sm font-medium text-ink">🤖 AI 智能推荐</span>
                    </div>
                    <p className="text-xs text-muted mb-3">
                      让 AI 根据你的兴趣领域和才能，智能推荐最合理的组合方案。
                    </p>
                    <AIAnalyzer
                      type="suggest-combinations"
                      text={[
                        '我的兴趣领域：' + uniquePassions.join('、'),
                        '我的才能：' + uniqueTalents.join('、'),
                        ...(store.workPurpose ? ['我的工作目的：' + store.workPurpose] : []),
                      ].join('\n')}
                      onResult={(items) => {
                        items.forEach((item) => {
                          const suggestion = typeof item === 'string'
                            ? { passion: '', talent: '', description: item, reason: '' }
                            : item;
                          if (suggestion.description && !store.hypotheses.find(h => h.description === suggestion.description)) {
                            store.addHypothesis({
                              id: Date.now().toString() + Math.random(),
                              passion: suggestion.passion || '综合',
                              talent: suggestion.talent || '综合',
                              description: suggestion.description,
                              score: 7,
                              passedFilter: null,
                            });
                          }
                        });
                      }}
                      label="✨ AI 智能推荐组合"
                      minTextLength={10}
                    />
                  </div>
                )}

                {/* CSV 批量导入假设 */}
                <CsvImport
                  title="📥 批量导入组合假设"
                  description={'下载模板，填写「喜欢的事 × 擅长的事」组合后上传 CSV 文件批量导入。'}
                  template={{
                    filename: '组合假设模板.csv',
                    headers: ['passion', 'talent', 'description', 'score'],
                    sampleRows: [
                      ['心理学', '善于倾听', '用倾听能力在心理咨询领域帮助他人', '8'],
                      ['教育', '能把复杂事情讲清楚', '用教学能力在在线教育领域创造价值', '7'],
                      ['写作', '做事有条理', '用规划能力撰写系统性的知识内容', '6'],
                    ],
                  }}
                  onImport={(rows) => {
                    rows.forEach((row) => {
                      if (row.description?.trim() && !store.hypotheses.find(h => h.description === row.description.trim())) {
                        store.addHypothesis({
                          id: Date.now().toString() + Math.random(),
                          passion: row.passion?.trim() || '综合',
                          talent: row.talent?.trim() || '综合',
                          description: row.description.trim(),
                          score: Math.min(10, Math.max(1, parseInt(row.score) || 5)),
                          passedFilter: null,
                        });
                      }
                    });
                  }}
                  validateRow={(row, i) => {
                    if (!row.description?.trim()) return `第 ${i + 1} 行缺少假设描述 (description 列为空)`;
                    if (row.score && (isNaN(parseInt(row.score)) || parseInt(row.score) < 1 || parseInt(row.score) > 10)) {
                      return `第 ${i + 1} 行评分无效：应为 1~10 的整数`;
                    }
                    return null;
                  }}
                  hint="passion = 喜欢的领域，talent = 擅长的才能，score = 感兴趣程度（1-10），不填默认 5 分"
                />

                {/* Combined list */}
                {store.hypotheses.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium text-ink">你的假设清单 ({store.hypotheses.length})</p>
                    <p className="text-xs text-muted -mt-1">给每个假设打分（1-10），标记最感兴趣的</p>
                    {store.hypotheses.map((h) => (
                      <div key={h.id} className="bg-amber-50/50 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-ink font-medium">{h.description}</p>
                            <p className="text-xs text-muted mt-0.5">
                              ❤️ {h.passion} · ⚡ {h.talent}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <select value={h.score} onChange={(e) => store.updateHypothesis(h.id, { score: Number(e.target.value) })}
                              className="bg-white border border-border-warm/50 rounded-lg px-2 py-1 text-sm">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            <button onClick={() => store.removeHypothesis(h.id)} className="text-muted hover:text-red-500"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 1: 工作目的筛选 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-ink">🎯 用工作目的筛选</h2>
              <p className="text-sm text-muted mt-1">用你的工作目的作为过滤器，选出最匹配的假设。</p>
            </div>

            {!store.workPurpose ? (
              <div className="bg-amber-50 rounded-xl p-5 text-center text-muted text-sm">
                还没有设定工作目的。请先在模块1（步骤5）中确定你的工作目的。
              </div>
            ) : (
              <div className="bg-accent-light/30 border border-accent/30 rounded-xl p-5 text-center">
                <p className="text-xs text-muted mb-1">你的工作目的</p>
                <p className="text-lg font-bold text-accent">&ldquo;{store.workPurpose}&rdquo;</p>
              </div>
            )}

            {store.hypotheses.length === 0 ? (
              <div className="text-center py-6 text-muted">
                <p>还没有生成任何假设，请先完成自由组合。</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-medium text-ink">逐一检验你的假设：它是否匹配你的工作目的？</p>
                {store.hypotheses.map((h) => (
                  <div key={h.id} className={`rounded-xl p-4 border-2 transition-all ${h.passedFilter === true ? 'border-accent bg-accent-light/20' : h.passedFilter === false ? 'border-red-200 bg-red-50/50' : 'border-border-warm/50 bg-amber-50/30'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-ink font-medium">{h.description}</p>
                        <p className="text-xs text-muted mt-1">评分：{h.score}/10</p>
                      </div>
                      <div className="flex gap-1.5 ml-3">
                        <button onClick={() => store.updateHypothesis(h.id, { passedFilter: true })}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${h.passedFilter === true ? 'bg-accent text-white' : 'bg-white text-muted border border-border-warm/50 hover:border-accent/50'}`}>
                          ✅ 通过
                        </button>
                        <button onClick={() => store.updateHypothesis(h.id, { passedFilter: false })}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${h.passedFilter === false ? 'bg-red-500 text-white' : 'bg-white text-muted border border-border-warm/50 hover:border-red-200'}`}>
                          ❌ 淘汰
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-amber-50 rounded-xl p-4 text-sm flex items-start gap-2">
                  <Lightbulb size={16} className="text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted">问自己：这个"假设想做的事"是否在传递你的工作目的？别人愿意为它付费吗？因为付费=感谢=你提供了价值。</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: 验证计划 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-ink">📋 制定最小可行验证方案</h2>
              <p className="text-sm text-muted mt-1">想做的事一开始只是假设。用最小成本试错，在实践中验证和修正。</p>
            </div>

            {store.hypotheses.filter(h => h.passedFilter === true).length === 0 ? (
              <div className="text-center py-6 text-muted bg-amber-50/50 rounded-xl">
                <p>还没有通过筛选的假设。先完成上一步的筛选。</p>
              </div>
            ) : (
              <>
                <div className="bg-accent-light/20 border border-accent/30 rounded-xl p-5">
                  <p className="font-medium text-ink mb-3">🎯 通过筛选的候选</p>
                  <div className="space-y-2">
                    {store.hypotheses.filter(h => h.passedFilter === true).map((h, i) => (
                      <div key={h.id} className="flex items-center gap-2">
                        <span className="text-sm text-muted">{i + 1}.</span>
                        <span className="text-ink font-medium">{h.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-border-warm/50 rounded-xl p-5 space-y-4">
                  <h3 className="font-medium text-ink">制定你的第一步验证计划</h3>
                  <div>
                    <label className="text-sm text-muted block mb-1">第一步行动（最小成本试错）</label>
                    <textarea value={plan.action} onChange={(e) => setPlan({ ...plan, action: e.target.value })}
                      placeholder="例：下周约3个朋友聊我的想法，听听他们的反馈"
                      className="w-full px-4 py-3 rounded-xl border border-border-warm bg-warm/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm min-h-[80px]" />
                  </div>
                  <div>
                    <label className="text-sm text-muted block mb-1">时间安排</label>
                    <input value={plan.timeline} onChange={(e) => setPlan({ ...plan, timeline: e.target.value })}
                      placeholder="例：1周内完成"
                      className="w-full px-4 py-3 rounded-xl border border-border-warm bg-warm/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm text-muted block mb-1">怎么判断是否成功？</label>
                    <input value={plan.measure} onChange={(e) => setPlan({ ...plan, measure: e.target.value })}
                      placeholder="例：3个人中有2个人说'这个想法很有意思'"
                      className="w-full px-4 py-3 rounded-xl border border-border-warm bg-warm/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm" />
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 text-sm space-y-1">
                  <p className="font-medium text-ink">💡 验证后的三种可能</p>
                  <p className="text-muted">✅ 方向正确 → 继续深入，做更大规模的验证</p>
                  <p className="text-muted">🔄 需要调整 → 修改假设，换一种方式再试</p>
                  <p className="text-muted">❌ 完全不对 → 回到组合步骤，换一个组合再试</p>
                  <p className="text-muted mt-2 text-xs">记住：八木经历了"一对一咨询→研讨会→视频课程"三次修正才找到最终方向。试错是过程的一部分。</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-border-warm/30">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-muted hover:text-ink disabled:opacity-30 transition-all">
            <ArrowLeft size={16} /> 上一步
          </button>
          <button onClick={() => markStepDone()}
            className="px-3 py-1.5 text-xs bg-amber-50 text-muted rounded-lg hover:bg-amber-100 transition-all">
            {['m4-s1', 'm4-s2', 'm4-s3'][step] && store.isStepCompleted('module4', ['m4-s1', 'm4-s2', 'm4-s3'][step]) ? '✅ 已完成' : '标记完成'}
          </button>
          {step < 2 ? (
            <button onClick={() => { setStep(step + 1); markStepDone(); }}
              className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition-all">
              下一步 <ArrowRight size={16} />
            </button>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-1.5 px-5 py-2 bg-accent hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all">
              查看完整报告 <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
