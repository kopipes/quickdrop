'use client';

import { useState } from 'react';
import ToolShell from '@/components/ToolShell';
import { MAX_PDF } from '@/lib/tools';

const ROTATIONS = [
  { value: 90, label: '90°' },
  { value: 180, label: '180°' },
  { value: 270, label: '270°' },
];

export default function RotatePDFPage() {
  const [rotation, setRotation] = useState(90);
  const [pageMode, setPageMode] = useState<'all' | 'custom'>('all');
  const [pages, setPages] = useState('');

  return (
    <ToolShell
      tool="rotate_pdf" title="Rotate PDF" description="Rotate pages to fix their orientation."
      accept=".pdf" maxSize={MAX_PDF}
      resultTitle="PDF rotated successfully" processLabel="Rotate PDF"
      buildOptions={() => ({
        rotation,
        pages: pageMode === 'all' ? [] : pages.split(/[,.\s]+/).map(Number).filter(Boolean),
      })}
      settings={
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-neutral-700">Rotation</label>
            <div className="mt-1 flex gap-2">
              {ROTATIONS.map((r) => (
                <button key={r.value} onClick={() => setRotation(r.value)} className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${rotation === r.value ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'}`}>{r.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700">Apply to</label>
            <div className="mt-1 flex gap-2">
              <button onClick={() => setPageMode('all')} className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${pageMode === 'all' ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'}`}>All Pages</button>
              <button onClick={() => setPageMode('custom')} className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${pageMode === 'custom' ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'}`}>Selected Pages</button>
            </div>
            {pageMode === 'custom' && (
              <input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="e.g. 1, 3, 5" className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
            )}
          </div>
        </div>
      }
    />
  );
}