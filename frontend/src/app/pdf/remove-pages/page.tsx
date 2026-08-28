'use client';

import { useMemo, useState } from 'react';
import ToolShell from '@/components/ToolShell';
import { MAX_PDF } from '@/lib/tools';

function parsePages(input: string): number[] {
  const out: number[] = [];
  for (const part of input.split(/[,;]/)) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const m = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const start = Math.max(1, Number(m[1]));
      const end = Math.max(1, Number(m[2]));
      for (let p = Math.min(start, end); p <= Math.max(start, end); p++) out.push(p);
    } else if (/^\d+$/.test(trimmed)) {
      out.push(Number(trimmed));
    }
  }
  return [...new Set(out)].sort((a, b) => a - b);
}

export default function RemovePagesPage() {
  const [pages, setPages] = useState('');
  const parsed = useMemo(() => parsePages(pages), [pages]);

  return (
    <ToolShell
      tool="remove_pdf_pages" title="Remove Pages" description="Delete unwanted pages from your PDF."
      accept=".pdf" maxSize={MAX_PDF}
      resultTitle="Pages removed successfully" processLabel="Remove Selected"
      buildOptions={() => ({ pages: parsed })}
      onValidate={() => (parsed.length ? null : 'Enter at least one page number, e.g. 1, 3, 5-7.')}
      settings={
        <div>
          <label className="text-sm font-medium text-neutral-700">Pages to remove</label>
          <input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="e.g. 1, 3, 5-7" className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
          <p className="mt-1 text-xs text-neutral-500">
            {parsed.length > 0 ? `${parsed.length} page${parsed.length > 1 ? 's' : ''} selected: ${parsed.join(', ')}` : 'Separate page numbers with commas; ranges like 5-7 work too.'}
          </p>
        </div>
      }
    />
  );
}