'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { ArrowRight, ArrowLeft, Plus, Trash2, Check, AlertTriangle, Lightbulb, Sparkles } from 'lucide-react';
import AIAnalyzer from '@/components/AIAnalyzer';

const PASSION_QUESTIONS = [
  { id: 'pq1', title: '即使花钱也想学习/体验的是什么？', desc: '有没有什么事是你愿意自费投入时间和金钱的？这暴露了你的纯粹兴趣。', placeholder: '例：即使花钱也想学心理学、想体验不同的咖啡文化...' },
  { id: 'pq2', title: '你的书架上摆着什么类型的书？', desc: '去书店看看你会在哪个书架前停留最久？或者回忆你最近买的书是什么类型的。', placeholder: '例：我的书架上有心理学、个人成长、人物传记...' },
  { id: 'pq3', title: '有没有什么事物让你产生"被拯救了"的感觉？', desc: '某本书、某句话、某个人、某个经历——那些给了你强烈能量的事物。', placeholder: '例：《被讨厌的勇气》这本书拯救了我，让我从讨好别人中解脱出来...' },
  { id: 'pq4', title: '迄今为止你想道谢的工作是什么？', desc: '你对哪个职业或哪种工作心怀感激？感恩指向你内心认同的价值。', placeholder: '例：我很感谢老师这个职业，因为我的老师改变了我的人生...' },
  { id: 'pq5', title: '对社会中的什么事情感到愤怒？', desc: '愤怒 = 对现状不满 = 你心中有理想蓝图。你在为什么事情不平？', placeholder: '例：我看到很多人在做自己不喜欢的工作，浪费生命，这让我很愤怒...' },
];

const RATIONALITY_TRAPS = [
  '我经常用"这个有用吗？"来评判一件事',
  '我只做能向别人展示的事',
  '我很少做"纯粹好玩"的事',
  '我的大部分时间都花在"有用"的事情上',
  '我觉得花时间在爱好上是一种浪费',
  '我很难允许自己"什么都不做"',
];

export default function Module3Page() {
  const store = useStore();
  const [step, setStep] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [input, setInput] = useState('');
  const [trapChecks, setTrapChecks] = useState<boolean[]>(new Array(RATIONALITY_TRAPS.length).fill(false));
  const [interestList, setInterestList] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [freeTextAnswers, setFreeTextAnswers] = useState<string[]>(new Array(PASSION_QUESTIONS.length).fill(''));

  const markStepDone = () => {
    const stepIds = ['m3-s1', 'm3-s2', 'm3-s3'];
    store.completeStep('module3', stepIds[step]);
  };

  const addKeyword = () => {
    if (!input.trim()) return;
    store.addPassion({ id: Date.now().toString(), area: input.trim(), questionId: PASSION_QUESTIONS[activeQuestion].id });
    setInput('');
  };

  const addInterest = () => {
    if (!newInterest.trim()) return;
    setInterestList([...interestList, newInterest.trim()]);
    setNewInterest('');
  };

  const trapScore = trapChecks.filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">❤️</span>
        <div>
          <h1 className="text-2xl font-bold text-ink">找到喜欢的事</h1>
          <p className="text-muted text-sm">热情 — What — 你真正好奇的领域</p>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-none -mx-1 px-1">
        {[
          { id: 'm3-s1', label: '热情5问', emoji: '❓' },
          { id: 'm3-s2', label: '合理性陷阱', emoji: '⚠️' },
          { id: 'm3-s3', label: '兴趣清单', emoji: '📝' },
        ].map((s, i) => (
          <button key={s.id} onClick={() => { setStep(i); markStepDone(); }}
            className={`flex items-center gap-1.5 px-3 sm:px-3 py-2.5 sm:py-2 rounded-lg text-sm whitespace-nowrap transition-all flex-shrink-0 min-h-[44px] ${i === step ? 'bg-primary text-white shadow-md' : store.isStepCompleted('module3', s.id) ? 'bg-accent-light/50 text-accent font-medium' : 'bg-surface text-muted hover:bg-amber-50 border border-border-warm/30'}`}>
            <span>{s.emoji}</span>
            <span className="hidden sm:inline">{s.label}</span>
            {store.isStepCompleted('module3', s.id) && <Check size={12} />}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-2xl border border-border-warm/50 p-5 md:p-8 min-h-[400px]">
        {/* Step 0: 热情5问 */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-ink">❓ 5个问题发现你的热情</h2>
              <p className="text-sm text-muted mt-1">区分"因为兴趣所以喜欢"（可以当工作）和"因为有用所以喜欢"（不能当工作）。</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
              {PASSION_QUESTIONS.map((q, i) => (
                <button key={q.id} onClick={() => setActiveQuestion(i)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all flex-shrink-0 ${i === activeQuestion ? 'bg-primary-light text-primary-dark font-medium border border-primary/30' : 'bg-amber-50/50 text-muted border border-transparent hover:border-border-warm'}`}>
                  Q{i + 1}
                </button>
              ))}
            </div>

            <div className="bg-amber-50/70 rounded-xl p-5">
              <h3 className="font-semibold text-ink text-lg">{PASSION_QUESTIONS[activeQuestion].title}</h3>
              <p className="text-sm text-muted mt-1">{PASSION_QUESTIONS[activeQuestion].desc}</p>
            </div>

            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addKeyword(); }}
                placeholder={PASSION_QUESTIONS[activeQuestion].placeholder}
                className="flex-1 px-4 py-3 rounded-xl border border-border-warm bg-warm/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
              />
              <button onClick={addKeyword} disabled={!input.trim()}
                className="px-4 py-3 bg-primary hover:bg-primary-dark disabled:bg-amber-200 text-white rounded-xl transition-all">
                <Plus size={18} />
              </button>
            </div>

            <div className="flex gap-2">
              {activeQuestion > 0 && <button onClick={() => setActiveQuestion(activeQuestion - 1)} className="text-sm text-muted hover:text-ink flex items-center gap-1"><ArrowLeft size={14} /> 上一题</button>}
              {activeQuestion < PASSION_QUESTIONS.length - 1 && <button onClick={() => setActiveQuestion(activeQuestion + 1)} className="text-sm text-muted hover:text-ink flex items-center gap-1">下一题 <ArrowRight size={14} /></button>}
            </div>

            {store.passions.length > 0 && (
              <div className="bg-amber-50/50 rounded-xl p-4">
                <p className="text-sm font-medium text-ink mb-2">已收集的兴趣线索 ({store.passions.length})</p>
                <div className="flex flex-wrap gap-2">
                  {store.passions.map((p) => (
                    <span key={p.id} className="bg-white text-ink px-3 py-1.5 rounded-full text-sm border border-border-warm/50 flex items-center gap-1.5">
                      {p.area}
                      <button onClick={() => store.removePassion(p.id)} className="text-muted hover:text-red-500"><Trash2 size={12} /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI 智能提取兴趣领域 */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-primary" />
                <span className="text-sm font-medium text-ink">🤖 AI 智能提取</span>
              </div>
              <p className="text-xs text-muted mb-3">把你的完整回答写在这里，AI 会自动提取出你的兴趣领域。</p>
              <textarea
                value={freeTextAnswers[activeQuestion]}
                onChange={(e) => {
                  const newAnswers = [...freeTextAnswers];
                  newAnswers[activeQuestion] = e.target.value;
                  setFreeTextAnswers(newAnswers);
                }}
                placeholder={PASSION_QUESTIONS[activeQuestion].placeholder}
                className="w-full px-4 py-3 rounded-xl border border-border-warm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm min-h-[100px] resize-y"
              />
              <div className="mt-2">
                <AIAnalyzer
                  type="extract-passions"
                  text={freeTextAnswers[activeQuestion]}
                  context={{ question: PASSION_QUESTIONS[activeQuestion].title }}
                  onResult={(items) => {
                    items.forEach((item) => {
                      const text = typeof item === 'string' ? item : item.area || item.text || '';
                      if (text.trim() && !store.passions.find(p => p.area === text.trim())) {
                        store.addPassion({ id: Date.now().toString() + Math.random(), area: text.trim(), questionId: PASSION_QUESTIONS[activeQuestion].id });
                      }
                    });
                  }}
                  label="✨ AI 提取兴趣领域"
                  variant="ghost"
                  minTextLength={15}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: 合理性陷阱检测 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-ink">⚠️ 合理性陷阱检测</h2>
              <p className="text-sm text-muted mt-1">
                如果你总是用"这个有用吗？"来判断一切，你就陷入了"合理性陷阱"。
                检查一下你有多严重。
              </p>
            </div>

            <div className="space-y-2">
              {RATIONALITY_TRAPS.map((trap, i) => (
                <label key={i} className="flex items-start gap-3 bg-amber-50/50 rounded-xl p-4 cursor-pointer hover:bg-amber-50 transition-all">
                  <input type="checkbox" checked={trapChecks[i]} onChange={() => {
                    const newChecks = [...trapChecks];
                    newChecks[i] = !newChecks[i];
                    setTrapChecks(newChecks);
                  }} className="mt-1 rounded border-2 border-border-warm text-primary focus:ring-primary/40" />
                  <span className={`text-sm ${trapChecks[i] ? 'text-ink font-medium' : 'text-muted'}`}>{trap}</span>
                </label>
              ))}
            </div>

            {trapScore > 0 && (
              <div className={`rounded-xl p-5 ${trapScore >= 4 ? 'bg-red-50 border border-red-200' : trapScore >= 2 ? 'bg-amber-50 border border-amber-200' : 'bg-accent-light/30 border border-accent/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={18} className={trapScore >= 4 ? 'text-red-500' : 'text-primary'} />
                  <span className={`font-medium ${trapScore >= 4 ? 'text-red-600' : trapScore >= 2 ? 'text-primary-dark' : 'text-accent'}`}>
                    {trapScore >= 4 ? '⚠️ 严重合理性陷阱' : trapScore >= 2 ? '⚡ 中度合理性倾向' : '✅ 合理性观念良好'}
                  </span>
                </div>
                <p className="text-sm text-muted">
                  {trapScore >= 4
                    ? '你严重陷入了"合理性陷阱"。建议立即暂停，去做一件"纯粹因为好奇"的事，不追求任何实用价值。找回你的好奇心。'
                    : trapScore >= 2
                      ? '你有一定的合理性倾向，偶尔会限制自己的好奇心。试着给自己一些"无用的时间"，放任好奇心。'
                      : '你保持了良好的好奇心平衡，继续探索你真正感兴趣的事吧！'}
                </p>
              </div>
            )}

            <div className="bg-amber-50 rounded-xl p-4 text-sm">
              <p className="font-medium text-ink mb-1">💡 如何区分两种喜欢</p>
              <p className="text-muted">
                <strong>"因为兴趣所以喜欢"</strong>→ 可以当工作（比如你喜欢拍照，即使没人付钱你也拍）<br />
                <strong>"因为有用所以喜欢"</strong>→ 不能当工作（比如你觉得学英语有用所以喜欢，但本质上你不享受学英语本身）
              </p>
            </div>
          </div>
        )}

        {/* Step 2: 整理兴趣清单 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-ink">📝 整理你的兴趣清单</h2>
              <p className="text-sm text-muted mt-1">把前面发现的所有兴趣线索归纳为3-6个感兴趣的领域。</p>
            </div>

            {store.passions.length === 0 && interestList.length === 0 && (
              <div className="text-center py-6 text-muted">
                <p>还没有收集兴趣线索，请先完成热情5问。</p>
              </div>
            )}

            {store.passions.length > 0 && (
              <div className="bg-amber-50/50 rounded-xl p-4">
                <p className="text-sm font-medium text-ink mb-2">来自5问的兴趣线索</p>
                <div className="flex flex-wrap gap-1.5">
                  {store.passions.map((p) => (
                    <span key={p.id} className="bg-white text-ink px-2.5 py-1 rounded-full text-xs border border-border-warm/50">{p.area}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="font-medium text-ink">归纳后的兴趣领域</p>
              {interestList.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-amber-50/50 rounded-xl p-3">
                  <span className="text-xs text-muted w-6">{i + 1}.</span>
                  <span className="flex-1 text-ink">{item}</span>
                  <button onClick={() => setInterestList(interestList.filter((_, idx) => idx !== i))} className="text-muted hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              ))}
              <div className="flex gap-2">
                <input value={newInterest} onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addInterest(); }}
                  placeholder="输入一个兴趣领域..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border-warm bg-warm/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
                <button onClick={addInterest} disabled={!newInterest.trim()}
                  className="px-4 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-amber-200 text-white rounded-xl transition-all">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 text-sm">
              <Lightbulb size={16} className="inline text-primary" />
              <span className="text-muted ml-1">从线索中找共同点。比如"心理学、自我认知、人物传记"可以归纳为"对人的深度理解"。</span>
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
            {['m3-s1', 'm3-s2', 'm3-s3'][step] && store.isStepCompleted('module3', ['m3-s1', 'm3-s2', 'm3-s3'][step]) ? '✅ 已完成' : '标记完成'}
          </button>
          {step < 2 ? (
            <button onClick={() => { setStep(step + 1); markStepDone(); }}
              className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition-all">
              下一步 <ArrowRight size={16} />
            </button>
          ) : (
            <div className="text-sm text-muted">✅ 模块3完成！</div>
          )}
        </div>
      </div>
    </div>
  );
}
