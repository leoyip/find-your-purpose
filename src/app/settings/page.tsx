'use client';

import { useState } from 'react';
import { useUserStore } from '@/userStore';
import { AI_PROVIDERS, getProvider } from '@/lib/ai-providers';
import { Check, ExternalLink, Eye, EyeOff, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const { users, currentUserId, setAiProvider, setAiApiKey, setAiModel, clearAiSettings } = useUserStore();
  const user = users.find((u) => u.id === currentUserId);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const selectedProvider = getProvider(user?.aiProvider || '');

  const handleTest = async () => {
    if (!user?.aiApiKey || !user?.aiProvider) return;
    setTesting(true);
    setTestResult(null);

    const provider = getProvider(user.aiProvider);
    if (!provider) return;

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'extract-values' as const,
          text: '测试连接',
          userConfig: {
            apiBase: provider.baseUrl,
            apiKey: user.aiApiKey,
            model: user.aiModel || provider.models[0].id,
          },
        }),
      });
      const data = await res.json();
      setTestResult(data.success ? '✅ 连接成功，API Key 有效' : `❌ ${data.error || '连接失败'}`);
    } catch {
      setTestResult('❌ 网络请求失败');
    } finally {
      setTesting(false);
    }
  };

  const markSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const usingCustom = !!(user?.aiApiKey);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">⚙️</span>
        <div>
          <h1 className="text-2xl font-bold text-ink">AI 设置</h1>
          <p className="text-muted text-sm">配置你自己的 AI 模型，用于智能分析功能</p>
        </div>
      </div>

      {/* 说明 */}
      <div className="bg-amber-50/70 rounded-xl p-5 text-sm text-muted space-y-2">
        <p className="font-medium text-ink">💡 为什么需要配置？</p>
        <p>AI 分析功能（关键词提取、组合推荐）需要调用大模型 API。你可以：</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>使用服务器默认 Key</strong>（如果管理员已配置）— 无需任何设置</li>
          <li><strong>使用自己的 Key</strong> — 在下方选择提供商并填入 API Key，数据只保存在你的浏览器中</li>
        </ul>
      </div>

      {/* 提供商选择 */}
      <div className="bg-surface rounded-2xl border border-border-warm/50 p-5 md:p-6 space-y-5">
        <h2 className="font-semibold text-ink">1. 选择 AI 提供商</h2>
        <div className="grid gap-2">
          {AI_PROVIDERS.map((p) => {
            const isSelected = user?.aiProvider === p.id || (!user?.aiProvider && p.id === 'deepseek');
            return (
              <button
                key={p.id}
                onClick={() => { setAiProvider(p.id); markSaved(); }}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary-light/30'
                    : 'border-border-warm/50 bg-amber-50/20 hover:border-primary/30'
                }`}
              >
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'border-primary bg-primary' : 'border-muted'
                }`}>
                  {isSelected && <Check size={12} className="text-white" />}
                </span>
                <div className="flex-1">
                  <span className="font-medium text-ink">{p.name}</span>
                  <span className="text-xs text-muted ml-2">{p.models.length} 个模型</span>
                </div>
                {p.docsUrl && (
                  <a href={p.docsUrl} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-primary hover:text-primary-dark flex items-center gap-0.5"
                  >
                    获取 Key <ExternalLink size={10} />
                  </a>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* API Key */}
      <div className="bg-surface rounded-2xl border border-border-warm/50 p-5 md:p-6 space-y-4">
        <h2 className="font-semibold text-ink">2. 填写 API Key</h2>
        <p className="text-sm text-muted">
          从{selectedProvider ? ` ${selectedProvider.name}` : ' AI 提供商'}获取 API Key 后粘贴到下方。
          {selectedProvider?.docsUrl && (
            <a href={selectedProvider.docsUrl} target="_blank" rel="noopener noreferrer"
              className="text-primary hover:text-primary-dark ml-1 inline-flex items-center gap-0.5"
            >
              去申请 <ExternalLink size={10} />
            </a>
          )}
        </p>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={user?.aiApiKey || ''}
              onChange={(e) => { setAiApiKey(e.target.value); markSaved(); }}
              placeholder={selectedProvider ? `输入 ${selectedProvider.name} API Key` : '先选择 AI 提供商'}
              className="w-full px-4 py-3 pr-10 rounded-xl border border-border-warm bg-warm/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm font-mono"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {saved && (
          <span className="text-xs text-accent flex items-center gap-1"><Check size={12} /> 已保存</span>
        )}
      </div>

      {/* 模型选择 */}
      {selectedProvider && selectedProvider.models.length > 1 && (
        <div className="bg-surface rounded-2xl border border-border-warm/50 p-5 md:p-6 space-y-3">
          <h2 className="font-semibold text-ink">3. 选择模型</h2>
          <div className="grid md:grid-cols-2 gap-2">
            {selectedProvider.models.map((m) => {
              const isSelected = user?.aiModel === m.id || (!user?.aiModel && m.id === selectedProvider.models[0].id);
              return (
                <button
                  key={m.id}
                  onClick={() => { setAiModel(m.id); markSaved(); }}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary-light/30'
                      : 'border-border-warm/50 bg-amber-50/20 hover:border-primary/30'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected ? 'border-primary bg-primary' : 'border-muted'
                  }`}>
                    {isSelected && <Check size={12} className="text-white" />}
                  </span>
                  <div>
                    <div className="font-medium text-ink text-sm">{m.label}</div>
                    {m.description && <div className="text-xs text-muted">{m.description}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 测试 + 操作 */}
      <div className="bg-surface rounded-2xl border border-border-warm/50 p-5 md:p-6 space-y-4">
        <h2 className="font-semibold text-ink">4. 测试连接</h2>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleTest}
            disabled={!user?.aiApiKey || testing}
            className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-primary hover:bg-primary-dark disabled:bg-amber-200 text-white rounded-xl text-sm font-medium transition-all"
          >
            {testing ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            {testing ? '测试中...' : '测试连接'}
          </button>

          {usingCustom && (
            <button
              onClick={() => { clearAiSettings(); markSaved(); }}
              className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-white border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-all"
            >
              清除自定义设置
            </button>
          )}
        </div>

        {testResult && (
          <div className={`p-3 rounded-xl text-sm ${
            testResult.startsWith('✅') ? 'bg-accent-light/30 text-accent' : 'bg-red-50 text-red-600'
          }`}>
            {testResult}
          </div>
        )}

        {!user?.aiApiKey && !process.env.NEXT_PUBLIC_HAS_SERVER_KEY && (
          <div className="bg-amber-50 rounded-xl p-3 text-sm text-muted">
            <p className="font-medium text-ink">⚠️ 当前状态</p>
            <p>尚未配置 API Key。请在上方选择提供商并填入 Key，或联系服务器管理员配置服务器默认 Key。</p>
          </div>
        )}
      </div>

      {/* 隐私说明 */}
      <div className="text-center text-xs text-muted/60">
        <p>🔒 你的 API Key 仅保存在本地浏览器中，发送到 AI 服务时通过服务器中转，不会被记录</p>
      </div>
    </div>
  );
}
