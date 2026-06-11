'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Download, FileText, X, Check, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { downloadCsvTemplate, parseCsvContent, readFileAsText, type CsvTemplate } from '@/lib/csv';

export interface CsvImportProps {
  /** Title displayed above the import section */
  title: string;
  /** Description explaining what this import does */
  description: string;
  /** Template definition (headers + sample data) */
  template: CsvTemplate;
  /** Called with parsed rows when user confirms import */
  onImport: (rows: Record<string, string>[]) => void;
  /** Optional per-row validation; return error string or null */
  validateRow?: (row: Record<string, string>, index: number) => string | null;
  /** Info/warning message to show below the upload area */
  hint?: string;
  /** Label for the import action button (default: 导入数据) */
  importLabel?: string;
  /** Label for the download template button (default: 下载模板) */
  downloadLabel?: string;
}

type ImportStatus = 'idle' | 'parsing' | 'preview' | 'importing' | 'done' | 'error';

export default function CsvImport({
  title,
  description,
  template,
  onImport,
  validateRow,
  hint,
  importLabel = '导入数据',
  downloadLabel = '下载模板',
}: CsvImportProps) {
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [expanded, setExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File | null) => {
    if (!file) return;

    // Validate file extension
    if (!file.name.endsWith('.csv')) {
      setErrors(['请选择 .csv 格式的文件']);
      setStatus('error');
      return;
    }

    setStatus('parsing');
    setFileName(file.name);
    setErrors([]);

    try {
      const content = await readFileAsText(file);
      const rows = parseCsvContent(content);

      if (rows.length === 0) {
        setErrors(['文件为空或格式不正确，请检查后重试']);
        setStatus('error');
        return;
      }

      // Validate headers match expected template
      const fileHeaders = Object.keys(rows[0]);
      const missingHeaders = template.headers.filter(
        h => !fileHeaders.includes(h)
      );
      if (missingHeaders.length > 0) {
        setErrors([
          `缺少必要列：${missingHeaders.join('、')}。请确保 CSV 包含以下列：${template.headers.join('、')}`,
        ]);
        setStatus('error');
        return;
      }

      // Validate each row
      const rowErrors: string[] = [];
      if (validateRow) {
        rows.forEach((row, i) => {
          const err = validateRow(row, i);
          if (err) rowErrors.push(err);
        });
      }

      setParsedRows(rows);
      if (rowErrors.length > 0) {
        setErrors(rowErrors);
      }
      setStatus('preview');
    } catch (e) {
      setErrors([`读取文件失败：${e instanceof Error ? e.message : '未知错误'}`]);
      setStatus('error');
    }
  }, [template.headers, validateRow]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleImport = () => {
    setStatus('importing');
    // Small delay so user sees the loading state
    setTimeout(() => {
      try {
        onImport(parsedRows);
        setStatus('done');
        setExpanded(false);
        setTimeout(() => {
          setStatus('idle');
          setParsedRows([]);
          setFileName('');
          setErrors([]);
        }, 2000);
      } catch (e) {
        setErrors([`导入失败：${e instanceof Error ? e.message : '未知错误'}`]);
        setStatus('error');
      }
    }, 300);
  };

  const reset = () => {
    setStatus('idle');
    setParsedRows([]);
    setErrors([]);
    setFileName('');
    setExpanded(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Count valid vs error rows
  const validRows = parsedRows.filter((_, i) => {
    if (!validateRow) return true;
    return !validateRow(parsedRows[i], i);
  });

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50/70 rounded-xl border border-primary/20 p-5">
      {/* Header - always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Upload size={16} className="text-primary" />
          <span className="text-sm font-medium text-ink">{title}</span>
          {status === 'done' && (
            <span className="flex items-center gap-1 text-xs text-accent">
              <Check size={12} /> 导入成功
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted">{description}</p>

          {/* Template download */}
          <button
            type="button"
            onClick={() => downloadCsvTemplate(template.filename, template.headers, template.sampleRows)}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark transition-all"
          >
            <Download size={12} />
            {downloadLabel}
          </button>

          {/* Upload area */}
          {status === 'idle' || status === 'error' ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center hover:border-primary/60 transition-all cursor-pointer bg-white/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={24} className="mx-auto text-primary/60 mb-2" />
              <p className="text-sm text-muted">点击或拖拽 CSV 文件到此处</p>
              <p className="text-xs text-muted mt-1">支持 .csv 格式</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              />
            </div>
          ) : status === 'parsing' ? (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 size={16} className="animate-spin text-primary" />
              <span className="text-sm text-muted">正在解析文件...</span>
            </div>
          ) : status === 'preview' ? (
            <div className="space-y-3">
              {/* Parsed file info */}
              <div className="flex items-center justify-between bg-white/70 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileText size={14} className="text-primary" />
                  <span className="text-ink">{fileName}</span>
                  <span className="text-muted text-xs">
                    ({parsedRows.length} 行
                    {errors.length > 0 && `，${validRows.length} 行有效`})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="text-muted hover:text-red-500 transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Validation errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-24 overflow-y-auto">
                  {errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-600 flex items-start gap-1">
                      <AlertCircle size={10} className="mt-0.5 flex-shrink-0" />
                      {err}
                    </p>
                  ))}
                </div>
              )}

              {/* Preview table */}
              <div className="bg-white rounded-lg border border-border-warm/50 overflow-x-auto max-h-48 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-amber-50/70">
                      {template.headers.map(h => (
                        <th key={h} className="text-left p-2 text-muted font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-t border-border-warm/20">
                        {template.headers.map(h => (
                          <td key={h} className="p-2 text-ink truncate max-w-[200px]">{row[h] || ''}</td>
                        ))}
                      </tr>
                    ))}
                    {parsedRows.length > 10 && (
                      <tr className="border-t border-border-warm/20">
                        <td colSpan={template.headers.length} className="p-2 text-center text-muted text-xs">
                          ...还有 {parsedRows.length - 10} 行
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Import button */}
              <button
                type="button"
                onClick={handleImport}
                disabled={validRows.length === 0}
                className="w-full py-2.5 bg-primary hover:bg-primary-dark disabled:bg-amber-200 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <Upload size={14} />
                {importLabel}（{validRows.length} 条）
              </button>
            </div>
          ) : status === 'importing' ? (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 size={16} className="animate-spin text-primary" />
              <span className="text-sm text-muted">正在导入...</span>
            </div>
          ) : status === 'done' ? (
            <div className="flex items-center justify-center gap-2 py-4 text-accent">
              <Check size={16} />
              <span className="text-sm font-medium">导入成功！</span>
            </div>
          ) : null}

          {/* Hint */}
          {hint && (
            <p className="text-[11px] text-muted flex items-start gap-1">
              <AlertCircle size={10} className="mt-0.5 flex-shrink-0" />
              {hint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
