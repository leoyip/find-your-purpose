'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { ArrowRight, ArrowLeft, Plus, Trash2, Check, Lightbulb, Sparkles } from 'lucide-react';
import AIAnalyzer from '@/components/AIAnalyzer';

const TALENT_QUESTIONS = [
  { id: 'tq1', title: '迄今为止感到最充实的体验是什么？', desc: '充实 = 做擅长的事时的状态。回想一下什么时候你感觉"时间飞逝"、"完全投入"。', placeholder: '例：大学时组织了一场活动，从策划到执行全身心投入，看到大家玩得开心特别有成就感...' },
  { id: 'tq2', title: '最近让你感到烦躁的是什么？', desc: '烦躁 = 别人做不到但你觉得理所当然的事。那些"为什么这么简单的事他们都做不好"的时刻。', placeholder: '例：看到同事发的PPT排版混乱我很烦躁，我觉得把信息清晰呈现是基本要求...' },
  { id: 'tq3', title: '问身边的人：你觉得我的长处是什么？', desc: '别人比你更清楚你的无意识习惯。现在就发消息问2-3个人。', placeholder: '把你收到的答案记录在这里...' },
  { id: 'tq4', title: '辞职后你会留恋工作的哪部分？', desc: '留恋的部分 = 你擅长且享受的具体内容。', placeholder: '例：即使工作很累，但我会怀念和客户深度交流、帮他们解决问题的时刻...' },
  { id: 'tq5', title: '过去取得过什么成果？怎么做到的？', desc: '想想你做成过的事，不管大小。从8个角度深挖你是怎么做到的。', placeholder: '例：我去年成功减肥10公斤。方法是制定详细计划、每天记录、找朋友互相监督...' },
];

const EIGHT_ANGLES = [
  '在感到充实之前做了哪些事？',
  '当时的环境有什么特点？',
  '具体采取了怎样的行动？',
  '经过怎样的思考才采取行动？',
  '当时意识到了什么？',
  '当时的动力是什么？',
  '什么时候失去了充实感？怎样恢复的？',
  '当时觉得如果这样做会更好的是什么？',
];

const SUCCESS_CASE_EXAMPLE = {
  title: '示例：成功减肥10公斤',
  answers: [
    '先买了体脂秤和健身垫，下载了记录APP',
    '在家办公，可以灵活安排时间；室友也在健身',
    '每天早晨空腹有氧30分钟，晚上力量训练20分钟',
    '"再这样下去健康会出问题"→"先试一周"',
    '意识到自己需要外部约束，所以找了健身搭子',
    '想穿进那件挂在衣柜里的西装',
    '第二周体重没变化有点沮丧，改为关注体脂率而不是体重后坚持下来了',
    '如果提前规划好每周菜单，效果应该会更好',
  ],
};

const TALENT_EXAMPLES = [
  '善于倾听他人的心声',
  '能把复杂的事情讲清楚',
  '做事有条理，喜欢规划',
  '对环境变化敏感',
  '善于发现别人的优点',
  '遇到困难不放弃',
  '喜欢把东西整理得井井有条',
  '善于从不同角度看问题',
];

const FLAW_EXAMPLES = [
  { flaw: '我很认生', pos: '正因为认生，我才能认真对待重要的人' },
  { flaw: '我太敏感', pos: '正因为敏感，我才能注意到别人忽略的细节' },
  { flaw: '我很容易纠结', pos: '正因为纠结，我才能全面考虑问题，做出更周到的决定' },
];

export default function Module2Page() {
  const store = useStore();
  const [step, setStep] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [input, setInput] = useState('');
  const [flawInput, setFlawInput] = useState('');
  const [transformationInput, setTransformationInput] = useState('');
  const [editTalentId, setEditTalentId] = useState<string | null>(null);
  const [freeTextAnswers, setFreeTextAnswers] = useState<string[]>(new Array(TALENT_QUESTIONS.length).fill(''));

  const markStepDone = () => {
    const stepIds = ['m2-s1', 'm2-s2', 'm2-s3', 'm2-s4'];
    store.completeStep('module2', stepIds[step]);
  };

  const addKeyword = () => {
    if (!input.trim()) return;
    store.addTalent({
      id: Date.now().toString(),
      description: input.trim(),
      level: '〇',
      howToUse: '',
    });
    setInput('');
  };

  const addFlaw = () => {
    if (!flawInput.trim() || !transformationInput.trim()) return;
    store.addFlawTransformation({ flaw: flawInput.trim(), transformation: transformationInput.trim() });
    setFlawInput('');
    setTransformationInput('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">⚡</span>
        <div>
          <h1 className="text-2xl font-bold text-ink">找到擅长的事</h1>
          <p className="text-muted text-sm">才能 — How — 你的无意识习惯就是天赋</p>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-none -mx-1 px-1">
        {[
          { id: 'm2-s1', label: '才能5问', emoji: '❓' },
          { id: 'm2-s2', label: '缺点转优点', emoji: '🔄' },
          { id: 'm2-s3', label: '深挖成功经历', emoji: '🔍' },
          { id: 'm2-s4', label: '使用说明书', emoji: '📋' },
        ].map((s, i) => (
          <button
            key={s.id}
            onClick={() => { setStep(i); markStepDone(); }}
            className={`
              flex items-center gap-1.5 px-3 sm:px-3 py-2.5 sm:py-2 rounded-lg text-sm whitespace-nowrap transition-all flex-shrink-0 min-h-[44px]
              ${i === step
                ? 'bg-primary text-white shadow-md'
                : store.isStepCompleted('module2', s.id)
                  ? 'bg-accent-light/50 text-accent font-medium'
                  : 'bg-surface text-muted hover:bg-amber-50 border border-border-warm/30'
              }
            `}
          >
            <span>{s.emoji}</span>
            <span className="hidden sm:inline">{s.label}</span>
            {store.isStepCompleted('module2', s.id) && <Check size={12} />}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-2xl border border-border-warm/50 p-5 md:p-8 min-h-[400px]">
        {/* Step 0: 才能5问 */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-ink">❓ 5个问题发现你的才能</h2>
              <p className="text-sm text-muted mt-1">才能是你的无意识习惯，不是后天学的技能。你天生就会的那些事。</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
              {TALENT_QUESTIONS.map((q, i) => (
                <button key={q.id} onClick={() => setActiveQuestion(i)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all flex-shrink-0 ${i === activeQuestion ? 'bg-primary-light text-primary-dark font-medium border border-primary/30' : 'bg-amber-50/50 text-muted border border-transparent hover:border-border-warm'}`}>
                  Q{i + 1}
                </button>
              ))}
            </div>

            <div className="bg-amber-50/70 rounded-xl p-5">
              <h3 className="font-semibold text-ink text-lg">{TALENT_QUESTIONS[activeQuestion].title}</h3>
              <p className="text-sm text-muted mt-1">{TALENT_QUESTIONS[activeQuestion].desc}</p>
            </div>

            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addKeyword(); }}
                placeholder={TALENT_QUESTIONS[activeQuestion].placeholder}
                className="flex-1 px-4 py-3 rounded-xl border border-border-warm bg-warm/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
              />
              <button onClick={addKeyword} disabled={!input.trim()}
                className="px-4 py-3 bg-primary hover:bg-primary-dark disabled:bg-amber-200 text-white rounded-xl transition-all">
                <Plus size={18} />
              </button>
            </div>

            <div className="flex gap-2">
              {activeQuestion > 0 && <button onClick={() => setActiveQuestion(activeQuestion - 1)} className="text-sm text-muted hover:text-ink flex items-center gap-1"><ArrowLeft size={14} /> 上一题</button>}
              {activeQuestion < TALENT_QUESTIONS.length - 1 && <button onClick={() => setActiveQuestion(activeQuestion + 1)} className="text-sm text-muted hover:text-ink flex items-center gap-1">下一题 <ArrowRight size={14} /></button>}
            </div>

            {store.talents.length > 0 && (
              <div className="bg-amber-50/50 rounded-xl p-4">
                <p className="text-sm font-medium text-ink mb-2">已发现的才能 ({store.talents.length})</p>
                <div className="flex flex-wrap gap-2">
                  {store.talents.map((t) => (
                    <span key={t.id} className="bg-white text-ink px-3 py-1.5 rounded-full text-sm border border-border-warm/50 flex items-center gap-1.5">
                      {t.description}
                      <button onClick={() => store.removeTalent(t.id)} className="text-muted hover:text-red-500"><Trash2 size={12} /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-amber-50/50 rounded-xl p-4">
              <p className="text-xs text-muted mb-2">💡 提示：分不清"努力做到的"和"天然就会的"？天然会的不需要刻意努力，做起来很自然。</p>
              <div className="flex flex-wrap gap-1.5">
                {TALENT_EXAMPLES.map((ex, i) => (
                  <button key={i} onClick={() => { setInput(ex); }}
                    className="text-xs bg-white px-2.5 py-1 rounded-full text-muted hover:text-ink hover:border-primary/30 border border-border-warm/50 transition-all">
                    + {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* AI 智能提取才能 */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-primary" />
                <span className="text-sm font-medium text-ink">🤖 AI 智能提取</span>
              </div>
              <p className="text-xs text-muted mb-3">把你的完整回答写在这里，AI 会自动提取出你的才能/长处。</p>
              <textarea
                value={freeTextAnswers[activeQuestion]}
                onChange={(e) => {
                  const newAnswers = [...freeTextAnswers];
                  newAnswers[activeQuestion] = e.target.value;
                  setFreeTextAnswers(newAnswers);
                }}
                placeholder={TALENT_QUESTIONS[activeQuestion].placeholder}
                className="w-full px-4 py-3 rounded-xl border border-border-warm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm min-h-[100px] resize-y"
              />
              <div className="mt-2">
                <AIAnalyzer
                  type="extract-talents"
                  text={freeTextAnswers[activeQuestion]}
                  context={{ question: TALENT_QUESTIONS[activeQuestion].title }}
                  onResult={(items) => {
                    items.forEach((item) => {
                      const text = typeof item === 'string' ? item : item.description || item.text || '';
                      if (text.trim() && !store.talents.find(t => t.description === text.trim())) {
                        store.addTalent({ id: Date.now().toString() + Math.random(), description: text.trim(), level: '〇', howToUse: '' });
                      }
                    });
                  }}
                  label="✨ AI 提取才能"
                  variant="ghost"
                  minTextLength={15}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: 缺点转优点 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-ink">🔄 缺点转优点</h2>
              <p className="text-sm text-muted mt-1">你的"缺点"只是放错位置的"优点"。把"我……所以……"换成"正因为……我才能……"</p>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {FLAW_EXAMPLES.map((ex, i) => (
                <div key={i} className="bg-amber-50/50 rounded-xl p-4 text-sm">
                  <p className="text-muted line-through text-xs">❌ {ex.flaw}，所以...</p>
                  <p className="text-accent font-medium mt-1">✅ {ex.pos}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-border-warm/50 p-5">
              <h3 className="font-medium text-ink mb-3">写下你的缺点→优点转换</h3>
              <div className="flex gap-2 mb-2">
                <input value={flawInput} onChange={(e) => setFlawInput(e.target.value)}
                  placeholder='你的"缺点"（如：我太固执）'
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border-warm bg-warm/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <input value={transformationInput} onChange={(e) => setTransformationInput(e.target.value)}
                  placeholder='转换后：正因为____，我才能____'
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border-warm bg-warm/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
                <button onClick={addFlaw} disabled={!flawInput.trim() || !transformationInput.trim()}
                  className="px-4 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-amber-200 text-white rounded-xl transition-all">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {store.flawTransformations.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-ink">你的转换记录</p>
                {store.flawTransformations.map((ft, i) => (
                  <div key={i} className="flex items-center justify-between bg-amber-50/50 rounded-xl p-3">
                    <div className="text-sm">
                      <span className="text-muted line-through text-xs">❌ {ft.flaw}</span>
                      <br />
                      <span className="text-accent font-medium">✅ {ft.transformation}</span>
                    </div>
                    <button onClick={() => store.removeFlawTransformation(i)} className="text-muted hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-amber-50 rounded-xl p-4 text-sm">
              <p className="font-medium text-ink mb-1">💡 少女与老妇视错觉</p>
              <p className="text-muted">同一幅画，可以看到少女也可以看到老妇。你的特质也一样——换个角度，缺点就变成了优点。</p>
            </div>
          </div>
        )}

        {/* Step 2: 深挖成功经历 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-ink">🔍 成功经历8角度深挖</h2>
              <p className="text-sm text-muted mt-1">选一个你取得过的成果，从8个角度分析你是怎么做到的。</p>
            </div>

            <details className="bg-amber-50/50 rounded-xl p-4">
              <summary className="cursor-pointer text-sm font-medium text-ink">📖 查看示例：{SUCCESS_CASE_EXAMPLE.title}</summary>
              <div className="mt-3 space-y-1.5">
                {SUCCESS_CASE_EXAMPLE.answers.map((a, i) => (
                  <p key={i} className="text-sm text-muted"><span className="text-primary font-mono">Q{i + 1}.</span> {a}</p>
                ))}
              </div>
            </details>

            <div className="space-y-3">
              {EIGHT_ANGLES.map((q, i) => (
                <div key={i} className="bg-amber-50/30 rounded-xl p-4">
                  <p className="text-sm font-medium text-ink mb-1"><span className="text-primary font-mono">Q{i + 1}.</span> {q}</p>
                  <textarea
                    placeholder="写下你的回答..."
                    className="w-full px-3 py-2 rounded-lg border border-border-warm/50 bg-warm/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[50px] resize-y"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: 使用说明书 */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-ink">📋 制作《自己的使用说明书》</h2>
              <p className="text-sm text-muted mt-1">整理10-20个长处，按◎〇△分级。这是你对自己才能的完整清单。</p>
            </div>

            {store.talents.length === 0 && (
              <div className="text-center py-6 text-muted">
                <p>还没有记录才能，请先完成才能5问。</p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-amber-50/70">
                    <th className="text-left p-3 rounded-l-xl">序号</th>
                    <th className="text-left p-3">长处</th>
                    <th className="text-center p-3">等级</th>
                    <th className="text-left p-3 rounded-r-xl">在工作中如何使用</th>
                  </tr>
                </thead>
                <tbody>
                  {store.talents.map((t, i) => (
                    <tr key={t.id} className="border-t border-border-warm/30">
                      <td className="p-3 text-muted font-mono text-xs">{i + 1}</td>
                      <td className="p-3">
                        <input value={t.description} onChange={(e) => store.updateTalent(t.id, { description: e.target.value })}
                          className="w-full bg-transparent focus:outline-none font-medium text-ink" />
                      </td>
                      <td className="p-3 text-center">
                        <select value={t.level} onChange={(e) => store.updateTalent(t.id, { level: e.target.value as '◎' | '〇' | '△' })}
                          className="bg-amber-50 border border-border-warm/50 rounded-lg px-2 py-1 text-sm focus:outline-none">
                          <option>◎</option>
                          <option>〇</option>
                          <option>△</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input value={t.howToUse} onChange={(e) => store.updateTalent(t.id, { howToUse: e.target.value })}
                          placeholder="如何使用这个长处..."
                          className="w-full bg-transparent focus:outline-none text-sm text-muted" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addKeyword(); }}
                placeholder="添加新的长处..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-border-warm bg-warm/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
              />
              <button onClick={addKeyword} disabled={!input.trim()}
                className="px-4 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-amber-200 text-white rounded-xl transition-all">
                <Plus size={18} />
              </button>
            </div>

            <div className="bg-amber-50/50 rounded-xl p-4 text-sm space-y-1">
              <p className="font-medium text-ink">等级说明</p>
              <p><span className="text-primary font-bold">◎</span> = 有充实感且与成果相关（重点使用）</p>
              <p><span className="text-amber-600 font-bold">〇</span> = 有充实感（辅助使用）</p>
              <p><span className="text-muted font-bold">△</span> = 目前还不确定（继续观察）</p>
            </div>
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
            {['m2-s1', 'm2-s2', 'm2-s3', 'm2-s4'][step] && store.isStepCompleted('module2', ['m2-s1', 'm2-s2', 'm2-s3', 'm2-s4'][step]) ? '✅ 已完成' : '标记完成'}
          </button>
          {step < 3 ? (
            <button onClick={() => { setStep(step + 1); markStepDone(); }}
              className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition-all">
              下一步 <ArrowRight size={16} />
            </button>
          ) : (
            <div className="text-sm text-muted">✅ 模块2完成！</div>
          )}
        </div>
      </div>
    </div>
  );
}
