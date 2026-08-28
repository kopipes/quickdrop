'use client';

import { useState } from 'react';
import ToolShell from '@/components/ToolShell';
import { MAX_IMAGE } from '@/lib/tools';

const PAGE_SIZES = [
  { value: 'a4', label: 'A4' },
  { value: 'letter', label: 'Letter' },
];

const GRID_OPTIONS = [
  { cols: 2, rows: 4, label: '2 × 4' },
  { cols: 3, rows: 4, label: '3 × 4' },
  { cols: 4, rows: 5, label: '4 × 5' },
  { cols: 5, rows: 6, label: '5 × 6' },
];

export default function ContactSheetPage() {
  const [pg, setPg] = useState('a4');
  const [grid, setGrid] = useState(GRID_OPTIONS[1]);

  return (
    <ToolShell
      tool="contact_sheet" title="Contact Sheet" description="Arrange multiple images into a printable PDF grid."
      accept=".jpg,.jpeg,.png,.webp" multiple maxSize={MAX_IMAGE} maxFiles={500}
      resultTitle="Contact sheet ready" processLabel="Create Contact Sheet"
      buildOptions={() => ({ columns: grid.cols, rows: grid.rows, spacing: 8, labels: true, page_size: pg })}
      settings={
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Page Size</label>
            <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
              {PAGE_SIZES.map((s) => (
                <button key={s.value} onClick={() => setPg(s.value)} className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${pg === s.value ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>{s.label}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Grid (columns × rows per page)</label>
            <div className="flex flex-wrap gap-2">
              {GRID_OPTIONS.map((g) => (
                <button
                  key={g.label}
                  onClick={() => setGrid(g)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${grid.cols === g.cols && grid.rows === g.rows ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50 p-3 text-xs text-neutral-500">
            Images labeled with filename. Up to {grid.cols * grid.rows} images per page; overflows to additional pages.
          </div>
        </div>
      }
    />
  );
}