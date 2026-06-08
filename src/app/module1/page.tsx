'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { ArrowRight, ArrowLeft, Plus, Trash2, Check, Lightbulb, AlertCircle, Sparkles } from 'lucide-react';
import AIAnalyzer from '@/components/AIAnalyzer';

const QUESTIONS = [
  { id: 'q1', title: '你尊敬的人是谁？', desc: '尊敬他们什么地方？写下你敬佩的具体特质。', placeholder: '例：我尊敬乔布斯，因为他有极致的追求完美和打破常规的勇气...' },
  { id: 'q2', title: '小时候什么经历对你影响最大？', desc: '无论是好的还是坏的，写出那些塑造了今天的你的事件。', placeholder: '例：小时候父母总是鼓励我独立做决定，让我学会了为自己负责...' },
  { id: 'q3', title: '你觉得现在的社会有什么不足？', desc: '你对社会中的什么问题感到在意或不满？', placeholder: '例：我觉得现代人太焦虑了，大家都被效率绑架，失去了生活的从容...' },
  { id: 'q4', title: '你觉得别人看重你什么？', desc: '回忆一下别人对你的评价，或者问身边的人"你觉得我在人生中比较看重什么？"', placeholder: '例：朋友说我是一个很真诚的人，总是愿意倾听别人的烦恼...' },
  { id: 'q5', title: '你最想告诉别人什么？', desc: '如果你有机会对很多人说一句话，那会是什么？或者反过来，你最不想让别人知道的是什么？', placeholder: '例：我想告诉大家"你不用成为别人眼中的完美，做真实的自己就够了"...' },
];

const STEP_HEADERS = [
  { id: 'm1-s1', label: '收集关键词', emoji: '📝' },
  { id: 'm1-s2', label: '归纳核心词', emoji: '🔍' },
  { id: 'm1-s3', label: '真假辨别', emoji: '⚖️' },
  { id: 'm1-s4', label: '排序优先级', emoji: '📊' },
  { id: 'm1-s5', label: '确定工作目的', emoji: '🎯' },
];

export default function Module1Page() {
  const store = useStore();
  const [step, setStep] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [input, setInput] = useState('');
  const [editingCoreValue, setEditingCoreValue] = useState('');
  const [newCoreValue, setNewCoreValue] = useState('');
  const [workPurposeInput, setWorkPurposeInput] = useState(store.workPurpose || '');
  const [freeTextAnswers, setFreeTextAnswers] = useState<string[]>(new Array(QUESTIONS.length).fill(''));

  const maxStep = STEP_HEADERS.length - 1;
  const isLastStep = step === maxStep;

  const markStepDone = () => {
    store.completeStep('module1', STEP_HEADERS[step].id);
  };

  const addKeyword = () => {
    if (!input.trim()) return;
    store.addValueKeyword({ id: Date.now().toString(), text: input.trim(), questionId: QUESTIONS[activeQuestion].id });
    setInput('');
  };

  const addCoreValue = () => {
    if (!newCoreValue.trim()) return;
    store.setCoreValues([
      ...store.coreValues,
      { id: Date.now().toString(), text: newCoreValue.trim(), order: store.coreValues.length, isControllable: true, deepDesire: '', isTrue: true },
    ]);
    setNewCoreValue('');
    setEditingCoreValue('');
  };

  const keywordsForCurrentQuestion = store.valueKeywords.filter((k) => k.questionId === QUESTIONS[activeQuestion].id);
  const allKeywords = store.valueKeywords;

  const groupedKeywords = QUESTIONS.map((q) => ({
    question: q.title,
    keywords: store.valueKeywords.filter((k) => k.questionId === q.id),
  }));

  return (
    <div className="space-y-6">
      {/* Module header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">🧭</span>
        <div>
          <h1 className="text-2xl font-bold text-ink">找到重要的事</h1>
          <p className="text-muted text-sm">价值观 — Why — 人生的指南针</p>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-none -mx-1 px-1">
        {STEP_HEADERS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => { setStep(i); markStepDone(); }}
            className={`
              flex items-center gap-1.5 px-3 sm:px-3 py-2.5 sm:py-2 rounded-lg text-sm whitespace-nowrap transition-all flex-shrink-0 min-h-[44px]
              ${i === step
                ? 'bg-primary text-white shadow-md'
                : store.isStepCompleted('module1', s.id)
                  ? 'bg-accent-light/50 text-accent font-medium'
                  : 'bg-surface text-muted hover:bg-amber-50 border border-border-warm/30'
              }
            `}
          >
            <span>{s.emoji}</span>
            <span className="hidden sm:inline">{s.label}</span>
            {store.isStepCompleted('module1', s.id) && <Check size={12} />}
          </button>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-surface rounded-2xl border border-border-warm/50 p-5 md:p-8 min-h-[400px]">
        {/* Step 0: 5个问题收集关键词 */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-ink">📝 回答5个问题，收集价值观关键词</h2>
              <p className="text-sm text-muted mt-1">不用想太多，写下第一个浮现在脑海中的词。之后我们可以归类整理。</p>
            </div>

            {/* Question tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
              {QUESTIONS.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setActiveQuestion(i)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm transition-all flex-shrink-0
                    ${i === activeQuestion
                      ? 'bg-primary-light text-primary-dark font-medium border border-primary/30'
                      : 'bg-amber-50/50 text-muted border border-transparent hover:border-border-warm'
                    }
                  `}
                >
                  Q{i + 1}
                </button>
              ))}
            </div>

            {/* Current question */}
            <div className="bg-amber-50/70 rounded-xl p-5">
              <h3 className="font-semibold text-ink text-lg">{QUESTIONS[activeQuestion].title}</h3>
              <p className="text-sm text-muted mt-1">{QUESTIONS[activeQuestion].desc}</p>
            </div>

            {/* Input area */}
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addKeyword(); }}
                placeholder={QUESTIONS[activeQuestion].placeholder}
                className="flex-1 px-4 py-3 rounded-xl border border-border-warm bg-warm/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
              />
              <button
                onClick={addKeyword}
                disabled={!input.trim()}
                className="px-4 py-3 bg-primary hover:bg-primary-dark disabled:bg-amber-200 text-white rounded-xl transition-all flex items-center gap-1.5"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">添加</span>
              </button>
            </div>

            {keywordsForCurrentQuestion.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-2">本题已收集 ({keywordsForCurrentQuestion.length})</p>
                <div className="flex flex-wrap gap-2">
                  {keywordsForCurrentQuestion.map((k) => (
                    <span key={k.id} className="inline-flex items-center gap-1.5 bg-primary-light text-primary-dark px-3 py-1.5 rounded-full text-sm">
                      {k.text}
                      <button onClick={() => store.removeValueKeyword(k.id)} className="hover:text-red-500">
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI: Free text + keyword extraction */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-primary" />
                <span className="text-sm font-medium text-ink">🤖 AI 智能提取</span>
              </div>
              <p className="text-xs text-muted mb-3">直接在下方写出你对这道题的完整回答，AI 会自动提取价值观关键词。</p>
              <textarea
                value={freeTextAnswers[activeQuestion]}
                onChange={(e) => {
                  const newAnswers = [...freeTextAnswers];
                  newAnswers[activeQuestion] = e.target.value;
                  setFreeTextAnswers(newAnswers);
                }}
                placeholder="把你的完整回答写在这里，AI 会帮你提取关键词..."
                className="w-full px-4 py-3 rounded-xl border border-border-warm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm min-h-[100px] resize-y"
              />
              <div className="mt-2">
                <AIAnalyzer
                  type="extract-values"
                  text={freeTextAnswers[activeQuestion]}
                  context={{ question: QUESTIONS[activeQuestion].title }}
                  onResult={(items) => {
                    items.forEach((item) => {
                      const text = typeof item === 'string' ? item : JSON.parse(item).text || '';
                      if (text.trim()) {
                        store.addValueKeyword({ id: Date.now().toString() + Math.random(), text: text.trim(), questionId: QUESTIONS[activeQuestion].id });
                      }
                    });
                  }}
                  label="✨ AI 提取关键词"
                  variant="ghost"
                  minTextLength={15}
                />
              </div>
            </div>

            {/* Switch question hint */}
            <div className="flex gap-2">
              {activeQuestion > 0 && (
                <button onClick={() => setActiveQuestion(activeQuestion - 1)} className="text-sm text-muted hover:text-ink flex items-center gap-1">
                  <ArrowLeft size={14} /> 上一题
                </button>
              )}
              {activeQuestion < QUESTIONS.length - 1 && (
                <button onClick={() => setActiveQuestion(activeQuestion + 1)} className="text-sm text-muted hover:text-ink flex items-center gap-1">
                  下一题 <ArrowRight size={14} />
                </button>
              )}
            </div>

            {/* All keywords summary */}
            {allKeywords.length > 0 && (
              <div className="bg-amber-50/50 rounded-xl p-4">
                <p className="text-sm font-medium text-ink mb-2">全部关键词 ({allKeywords.length})</p>
                <div className="flex flex-wrap gap-2">
                  {allKeywords.map((k) => (
                    <span key={k.id} className="bg-white text-ink px-2.5 py-1 rounded-full text-xs border border-border-warm/50">
                      {k.text}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 1: 形成价值观思维导图（归纳核心词） */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-ink">🔍 把关键词归纳为核心价值观</h2>
              <p className="text-sm text-muted mt-1">把含义相近的词归为一组，给每组起一个名字，那就是你的核心价值观。</p>
            </div>

            {/* Raw keywords grouped by question */}
            {groupedKeywords.map((g) =>
              g.keywords.length > 0 && (
                <div key={g.question}>
                  <p className="text-xs text-muted mb-1.5">{g.question}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {g.keywords.map((k) => (
                      <span key={k.id} className="bg-white text-ink px-2.5 py-1 rounded-full text-xs border border-border-warm/50">
                        {k.text}
                      </span>
                    ))}
                  </div>
                </div>
              )
            )}

            {allKeywords.length === 0 && (
              <div className="text-center py-8 text-muted">
                <p>还没有收集关键词，请先完成第一步。</p>
              </div>
            )}

            {/* Core values editor */}
            <div className="border-t border-border-warm/30 pt-5">
              <h3 className="font-semibold text-ink mb-3">核心价值观列表</h3>

              <div className="space-y-2 mb-4">
                {store.coreValues.map((cv, idx) => (
                  <div key={cv.id} className="flex items-center gap-2 bg-amber-50/50 rounded-xl p-3">
                    <span className="text-xs text-muted w-6">{idx + 1}.</span>
                    <input
                      value={cv.text}
                      onChange={(e) => store.updateCoreValue(cv.id, { text: e.target.value })}
                      className="flex-1 bg-transparent border-none focus:outline-none font-medium text-ink"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={newCoreValue}
                  onChange={(e) => setNewCoreValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addCoreValue(); }}
                  placeholder="输入一个新的核心价值观..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border-warm bg-warm/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
                <button onClick={addCoreValue} disabled={!newCoreValue.trim()} className="px-4 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-amber-200 text-white rounded-xl transition-all">
                  <Plus size={18} />
                </button>
              </div>

              {store.coreValues.length > 0 && (
                <p className="text-xs text-muted mt-2">提示：观察这些词之间的关联，思考哪一个是更底层的。<Lightbulb size={12} className="inline" /></p>
              )}
            </div>

            {/* AI 自动分组 */}
            {allKeywords.length >= 3 && (
              <div className="border-t border-border-warm/30 pt-4">
                <AIAnalyzer
                  type="group-values"
                  text={allKeywords.map(k => k.text).join('、')}
                  onResult={(items) => {
                    items.forEach((item) => {
                      const group = typeof item === 'string' ? { group: item, keywords: [] } : item;
                      if (group.group && !store.coreValues.find(cv => cv.text === group.group)) {
                        store.setCoreValues([
                          ...store.coreValues,
                          { id: Date.now().toString() + Math.random(), text: group.group, order: store.coreValues.length, isControllable: true, deepDesire: '', isTrue: true },
                        ]);
                      }
                    });
                  }}
                  label="🤖 AI 自动归纳核心词"
                  minTextLength={10}
                />
                <p className="text-xs text-muted mt-1">AI 会根据关键词的语义自动分组，生成核心价值观候选。</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: 真假价值观辨别 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-ink">⚖️ 辨别真假价值观</h2>
              <p className="text-sm text-muted mt-1">
                真正的价值观是<strong className="text-primary-dark">"我想做"</strong>，假的价值观是<strong className="text-muted">"我应该做"</strong>。
                问自己：这个价值观是我能控制的吗？
              </p>
            </div>

            {store.coreValues.length === 0 ? (
              <div className="text-center py-8 text-muted">
                <p>还没有核心价值观，请先完成上一步。</p>
              </div>
            ) : (
              <div className="space-y-3">
                {store.coreValues.map((cv) => (
                  <div key={cv.id} className="bg-amber-50/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink">{cv.text}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${cv.isTrue ? 'bg-accent-light text-accent' : 'bg-red-50 text-red-500'}`}>
                        {cv.isTrue ? '真价值观' : '假价值观'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted">是你能控制的吗？</span>
                      <button
                        onClick={() => store.updateCoreValue(cv.id, { isControllable: !cv.isControllable, isTrue: !cv.isTrue })}
                        className={`px-3 py-1 rounded-lg border transition-all ${cv.isControllable ? 'bg-accent-light text-accent border-accent/30' : 'bg-red-50 text-red-400 border-red-200'}`}
                      >
                        {cv.isControllable ? '✅ 可控' : '❌ 不可控'}
                      </button>
                    </div>

                    {!cv.isControllable && (
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-muted mb-1">追问：为什么想要这个？得到了之后呢？再之后呢？→ 找到更底层的渴望</p>
                        <input
                          value={cv.deepDesire}
                          onChange={(e) => store.updateCoreValue(cv.id, { deepDesire: e.target.value, isControllable: true, isTrue: true })}
                          placeholder="深层渴望（可控的）..."
                          className="w-full px-3 py-2 rounded-lg border border-border-warm/50 bg-warm/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={18} className="text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted">
                <p className="font-medium text-ink mb-1">💡 真假价值观检测要点</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>"我想做" → 真价值观 | "我应该做" → 假价值观（父母/社会强加）</li>
                  <li>不可控制的→追问到可控的底层渴望</li>
                  <li>利益志向型（想赚钱/想出名）→ 转为目的志向型</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 排序 */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-ink">📊 排序确定优先级</h2>
              <p className="text-sm text-muted mt-1">思考：哪一个价值观是所有其他价值观的最终目的？把它放在最上面。</p>
            </div>

            {store.coreValues.length === 0 ? (
              <div className="text-center py-8 text-muted">
                <p>还没有核心价值观，请先完成前两个步骤。</p>
              </div>
            ) : (
              <div className="space-y-2">
                {store.coreValues
                  .sort((a, b) => a.order - b.order)
                  .map((cv, idx) => (
                    <div key={cv.id} className="flex items-center gap-3 bg-amber-50/50 rounded-xl p-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <input
                        value={cv.text}
                        onChange={(e) => store.updateCoreValue(cv.id, { text: e.target.value })}
                        className="flex-1 bg-transparent border-none focus:outline-none font-medium text-ink"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            if (idx > 0) {
                              const values = [...store.coreValues].sort((a, b) => a.order - b.order);
                              const prev = values[idx - 1];
                              store.updateCoreValue(cv.id, { order: prev.order });
                              store.updateCoreValue(prev.id, { order: cv.order });
                            }
                          }}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg hover:bg-white disabled:opacity-30 text-muted hover:text-ink transition-all"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => {
                            const values = [...store.coreValues].sort((a, b) => a.order - b.order);
                            if (idx < values.length - 1) {
                              const next = values[idx + 1];
                              store.updateCoreValue(cv.id, { order: next.order });
                              store.updateCoreValue(next.id, { order: cv.order });
                            }
                          }}
                          disabled={idx === store.coreValues.length - 1}
                          className="p-1.5 rounded-lg hover:bg-white disabled:opacity-30 text-muted hover:text-ink transition-all"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ))}

                {/* Visual pyramid */}
                <div className="mt-8">
                  <p className="text-sm font-medium text-ink mb-3 text-center">你的价值观金字塔</p>
                  {store.coreValues.sort((a, b) => a.order - b.order).map((cv, idx, arr) => {
                    const width = 100 - idx * (arr.length > 1 ? 60 / arr.length : 0);
                    return (
                      <div key={cv.id} className="flex justify-center mb-1.5">
                        <div
                          className="bg-gradient-to-r from-primary/90 to-amber-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-all"
                          style={{ width: `${Math.max(width, 30)}%` }}
                        >
                          {idx === 0 && <span className="text-[10px] block opacity-80">最终目的</span>}
                          {cv.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: 确定工作目的 */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-ink">🎯 确定你的工作目的</h2>
              <p className="text-sm text-muted mt-1">
                从你的价值观中选择一个你最想推广给别人的，那就是你的工作目的。
              </p>
            </div>

            {store.coreValues.length === 0 ? (
              <div className="text-center py-8 text-muted">
                <p>请先完成前几个步骤。</p>
              </div>
            ) : (
              <>
                <div className="bg-amber-50/70 rounded-xl p-5">
                  <h3 className="font-medium text-ink mb-3">你的核心价值观（已排序）</h3>
                  <div className="space-y-1.5">
                    {store.coreValues.sort((a, b) => a.order - b.order).map((cv, idx) => (
                      <div key={cv.id} className="flex items-center gap-2">
                        <span className="text-xs text-muted w-6">{idx + 1}.</span>
                        <span className="text-ink">{cv.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-border-warm/50 p-5">
                  <h3 className="font-medium text-ink mb-2">回忆10次你向他人提供价值的经历</h3>
                  <p className="text-sm text-muted mb-4">
                    在这些经历中，你反复在传递什么？那个反复出现的主题就是你的工作目的。
                  </p>
                  <textarea
                    value={workPurposeInput}
                    onChange={(e) => setWorkPurposeInput(e.target.value)}
                    placeholder='"我希望更多的人能够______"'
                    className="w-full px-4 py-3 rounded-xl border border-border-warm bg-warm/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm min-h-[80px] resize-y"
                  />
                  <button
                    onClick={() => {
                      if (workPurposeInput.trim()) {
                        store.setWorkPurpose(workPurposeInput.trim());
                      }
                    }}
                    className="mt-3 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition-all flex items-center gap-1.5"
                  >
                    <Check size={16} /> 保存工作目的
                  </button>
                </div>

                {store.workPurpose && (
                  <div className="bg-accent-light/50 border border-accent/30 rounded-xl p-5 text-center">
                    <p className="text-xs text-muted mb-1">你的工作目的</p>
                    <p className="text-lg font-bold text-accent">&ldquo;{store.workPurpose}&rdquo;</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-border-warm/30 gap-2">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] text-sm text-muted hover:text-ink disabled:opacity-30 transition-all"
          >
            <ArrowLeft size={16} /> 上一步
          </button>

          <button
            onClick={() => markStepDone()}
            className="px-3 py-2 min-h-[44px] text-xs bg-amber-50 text-muted rounded-lg hover:bg-amber-100 transition-all flex-shrink-0"
          >
            {store.isStepCompleted('module1', STEP_HEADERS[step].id) ? '✅ 已完成' : '标记完成'}
          </button>

          {!isLastStep ? (
            <button
              onClick={() => { setStep(step + 1); markStepDone(); }}
              className="flex items-center gap-1.5 px-5 py-2.5 min-h-[44px] bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition-all"
            >
              下一步 <ArrowRight size={16} />
            </button>
          ) : (
            <div className="text-sm text-muted">✅ 模块1完成！进入下一个模块</div>
          )}
        </div>
      </div>
    </div>
  );
}
