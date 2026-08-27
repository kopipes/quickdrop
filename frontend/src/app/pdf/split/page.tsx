'use client';

import { useState } from 'react';
import ToolShell from '@/components/ToolShell';
import { MAX_PDF } from '@/lib/tools';

export default function SplitPDFPage() {
  const [mode, setMode] = useState<'range' | 'every'>('every');
  const [range, setRange] = useState('');

  return (
    <ToolShell
      tool="split_pdf" title="Split PDF" description="Extract page ranges or split every page into individual PDFs."
      accept=".pdf" maxSize={MAX_PDF}
      resultTitle="PDF split successfully" processLabel="Split PDF"
      buildOptions={() => {
        if (mode === 'every') return { every_page: true };
        const ranges = range
          .split(/[,;]/)
          .map((r) => r.trim())
          .filter(Boolean)
          .map((r) => {
            const parts = r.split('-').map(Number);
            return parts.length === 2 ? [parts[0], parts[1]] : [parts[0], parts[0]];
          });
        return { ranges, every_page: false };
      }}
      settings={
        <div className="space-y-3">
          <div className="flex gap-2">
            <button onClick={() => setMode('every')} className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${mode === 'every' ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'}`}>Every Page</button>
            <button onClick={() => setMode('range')} className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${mode === 'range' ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'}`}>Page Range</button>
          </div>
          {mode === 'range' && (
            <div>
              <label className="text-sm font-medium text-neutral-700">Pages</label>
              <input value={range} onChange={(e) => setRange(e.target.value)} placeholder="e.g. 1-4, 5-10, 11-15" className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
              <p className="mt-1 text-xs text-neutral-500">Separate ranges with commas</p>
            </div>
          )}
        </div>
      }
    />
  );
}