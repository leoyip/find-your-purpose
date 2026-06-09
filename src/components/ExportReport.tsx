'use client';

import { useState } from 'react';
import { FileDown, FileText, Loader2, Check } from 'lucide-react';
import { useStore } from '@/store';
import { useUserStore } from '@/userStore';
import { generateMarkdown, generateHtmlReport, type ReportData } from '@/lib/report-generator';

export default function ExportReport() {
  const store = useStore();
  const { currentUserId, users } = useUserStore();
  const [exporting, setExporting] = useState<'md' | 'pdf' | null>(null);
  const [done, setDone] = useState(false);

  const currentUser = users.find(u => u.id === currentUserId);

  const gatherData = (): ReportData => ({
    coreValues: store.coreValues,
    workPurpose: store.workPurpose,
    valueKeywords: store.valueKeywords,
    talents: store.talents,
    flawTransformations: store.flawTransformations,
    passions: store.passions,
    hypotheses: store.hypotheses,
    completedSteps: store.completedSteps,
  });

  const exportMarkdown = async () => {
    setExporting('md');
    try {
      const data = gatherData();
      const md = generateMarkdown(data, currentUser?.name || '我');
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `自我认知报告_${currentUser?.name || '我'}_${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch (e) {
      console.error('导出失败', e);
      alert('导出失败，请重试');
    } finally {
      setExporting(null);
    }
  };

  const exportPdf = async () => {
    setExporting('pdf');
    try {
      const data = gatherData();
      const html = generateHtmlReport(data, currentUser?.name || '我');

      // Open in new window for print-to-PDF
      const win = window.open('', '_blank');
      if (!win) {
        alert('请允许弹出窗口以导出 PDF');
        setExporting(null);
        return;
      }
      win.document.write(html);
      win.document.close();
      win.focus();

      // Wait for rendering then trigger print
      setTimeout(() => {
        win.print();
        setDone(true);
        setTimeout(() => setDone(false), 2000);
        setExporting(null);
      }, 500);
    } catch (e) {
      console.error('导出失败', e);
      alert('导出失败，请重试');
      setExporting(null);
    }
  };

  const hasData = store.coreValues.length > 0 || store.talents.length > 0 || store.passions.length > 0;

  if (!hasData) return null;

  return (
    <div className="bg-surface rounded-2xl border border-border-warm/50 p-5 md:p-6">
      <h2 className="font-semibold text-ink flex items-center gap-2 mb-1">
        <FileDown size={18} className="text-primary" />
        导出报告
      </h2>
      <p className="text-sm text-muted mb-4">将你的自我认知结果导出为可分享的文档</p>

      <div className="flex flex-wrap gap-3">
        {/* Markdown */}
        <button
          onClick={exportMarkdown}
          disabled={exporting !== null}
          className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-primary hover:bg-primary-dark disabled:bg-amber-200 text-white rounded-xl text-sm font-medium transition-all"
        >
          {exporting === 'md' ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FileText size={16} />
          )}
          {exporting === 'md' ? '生成中...' : '导出 Markdown'}
        </button>

        {/* PDF */}
        <button
          onClick={exportPdf}
          disabled={exporting !== null}
          className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-surface border-2 border-primary/30 hover:bg-primary-light text-ink rounded-xl text-sm font-medium transition-all disabled:opacity-50"
        >
          {exporting === 'pdf' ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FileDown size={16} />
          )}
          {exporting === 'pdf' ? '生成中...' : '导出 PDF'}
        </button>

        {done && (
          <span className="flex items-center gap-1 text-sm text-accent animate-fade-in">
            <Check size={16} /> 导出成功
          </span>
        )}
      </div>

      <p className="text-xs text-muted mt-3">
        Markdown 文件可直接用笔记软件打开；PDF 会打开新窗口，选择"另存为 PDF"即可
      </p>
    </div>
  );
}
