'use client';

import { useState } from 'react';
import ToolShell from '@/components/ToolShell';
import { MAX_IMAGE } from '@/lib/tools';

const PAGE_SIZES = [
  { value: 'auto', label: 'Auto' },
  { value: 'a4', label: 'A4' },
  { value: 'letter', label: 'Letter' },
];

const ORIENTATIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
];

const MARGINS = [
  { value: 'none', label: 'None' },
  { value: 'small', label: 'Small' },
  { value: 'normal', label: 'Normal' },
];

function SegmentedControl({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${value === o.value ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>{o.label}</button>
      ))}
    </div>
  );
}

export default function ImageToPDFPage() {
  const [pageSize, setPageSize] = useState('auto');
  const [orientation, setOrientation] = useState('auto');
  const [margin, setMargin] = useState('none');

  return (
    <ToolShell
      tool="image_to_pdf" title="Image → PDF" description="Turn your images into a single PDF document."
      accept=".jpg,.jpeg,.png,.webp" multiple maxSize={MAX_IMAGE}
      resultTitle="PDF created successfully" processLabel="Create PDF"
      options={{ page_size: pageSize, orientation, margin }}
      settings={
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Page Size</label>
            <SegmentedControl options={PAGE_SIZES} value={pageSize} onChange={setPageSize} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Orientation</label>
            <SegmentedControl options={ORIENTATIONS} value={orientation} onChange={setOrientation} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Margin</label>
            <SegmentedControl options={MARGINS} value={margin} onChange={setMargin} />
          </div>
        </div>
      }
    />
  );
}