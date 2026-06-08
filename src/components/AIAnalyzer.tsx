'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Check, X, AlertCircle } from 'lucide-react';
import type { AnalysisType } from '@/lib/ai';

interface AIAnalyzerProps {
  /** 分析类型 */
  type: AnalysisType;
  /** 要分析的文本 */
  text: string;
  /** 附加上下文 */
  context?: Record<string, unknown>;
  /** 当 AI 返回结果时回调 (可能是字符串数组或对象数组) */
  onResult: (items: any[]) => void;
  /** 按钮显示文字 */
  label?: string;
  /** 按钮变体 */
  variant?: 'primary' | 'ghost' | 'inline';
  /** 禁用 */
  disabled?: boolean;
  /** 输入是否过短 */
  minTextLength?: number;
}

export default function AIAnalyzer({
  type,
  text,
  context,
  onResult,
  label = 'AI 分析',
  variant = 'primary',
  disabled = false,
  minTextLength = 10,
}: AIAnalyzerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string[] | null>(null);

  const isTooShort = text.trim().length < minTextLength;

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, text, context }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || '分析失败');
        return;
      }

      if (data.data && data.data.length > 0) {
        setResult(data.data);
        onResult(data.data);
      } else {
        setError('AI 没有返回有效结果，请补充更多内容后重试');
      }
    } catch {
      setError('网络请求失败，请检查 API 配置');
    } finally {
      setLoading(false);
    }
  };

  // Inline variant (just a text button)
  if (variant === 'inline') {
    return (
      <button
        onClick={handleAnalyze}
        disabled={loading || disabled || isTooShort}
        className="text-xs text-primary hover:text-primary-dark disabled:text-muted/50 transition-all flex items-center gap-1"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
        {loading ? '分析中...' : label}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {/* Main button */}
      {variant === 'primary' && (
        <button
          onClick={handleAnalyze}
          disabled={loading || disabled || isTooShort}
          className="w-full py-3 bg-gradient-to-r from-primary to-orange-400 hover:from-primary-dark hover:to-orange-500
                     disabled:from-amber-200 disabled:to-amber-200 text-white rounded-xl font-medium transition-all
                     flex items-center justify-center gap-2 shadow-md shadow-primary/20
                     disabled:shadow-none disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          {loading ? 'AI 正在分析...' : isTooShort ? '内容太少，多写一些再分析' : label}
        </button>
      )}

      {variant === 'ghost' && (
        <button
          onClick={handleAnalyze}
          disabled={loading || disabled || isTooShort}
          className="px-4 py-2 border border-primary/30 text-primary hover:bg-primary-light rounded-xl text-sm
                     font-medium transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading ? '分析中...' : label}
        </button>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 text-red-600 rounded-xl p-3 text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Result preview */}
      {result && (
        <div className="bg-accent-light/30 border border-accent/30 rounded-xl p-3 animate-fade-in">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-accent flex items-center gap-1">
              <Check size={12} /> AI 分析完成
            </span>
            <button onClick={() => setResult(null)} className="text-muted hover:text-ink">
              <X size={14} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.map((item: any, i: number) => {
              const displayText = typeof item === 'string'
                ? item
                : item.description
                  ? `✨ ${item.description}`
                  : JSON.stringify(item);
              return (
                <span
                  key={i}
                  className="bg-white text-ink px-2.5 py-1 rounded-full text-xs border border-accent/30"
                >
                  {displayText}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
