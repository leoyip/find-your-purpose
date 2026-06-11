/**
 * CSV utility for importing/exporting Q&A data
 */

export interface CsvTemplate {
  filename: string;
  headers: string[];
  sampleRows: string[][];
}

/**
 * Download content as a file in the browser
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Escape a single CSV field (handle commas, quotes, newlines)
 */
export function escapeCsvField(field: string | number | boolean): string {
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Download a CSV template with BOM (for Excel UTF-8 compatibility)
 */
export function downloadCsvTemplate(
  filename: string,
  headers: string[],
  sampleRows?: string[][]
): void {
  const bom = '﻿';
  const headerLine = headers.join(',');
  const dataLines = sampleRows
    ? sampleRows.map(row => row.map(escapeCsvField).join(','))
    : [];
  const csv = bom + headerLine + '\n' + dataLines.join('\n');
  downloadFile(csv, filename, 'text/csv');
}

/**
 * Parse a single CSV line into fields, handling quoted values
 */
export function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Parse CSV text content into an array of record objects
 */
export function parseCsvContent(content: string): Record<string, string>[] {
  // Strip BOM if present
  const text = content.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  if (lines.length < 2) return []; // need at least header + 1 data row

  const headers = parseCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length === 0 || (fields.length === 1 && fields[0] === '')) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = fields[idx] ?? '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Read a File object and return its text content
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
}
