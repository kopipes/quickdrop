'use client';

import { useState } from 'react';
import ToolShell from '@/components/ToolShell';
import { MAX_PDF } from '@/lib/tools';

const FORMATS = [
  { value: 'png', label: 'PNG' },
  { value: 'jpg', label: 'JPG' },
];

const RESOLUTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'high', label: 'High' },
  { value: 'print', label: 'Print' },
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

export default function PDFToImagesPage() {
  const [format, setFormat] = useState('png');
  const [resolution, setResolution] = useState('standard');

  return (
    <ToolShell
      tool="pdf_to_images" title="PDF → Images" description="Export your PDF pages as JPG or PNG images."
      accept=".pdf" maxSize={MAX_PDF}
      resultTitle="Images exported" processLabel="Export Images"
      options={{ format, resolution }}
      settings={
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Format</label>
            <SegmentedControl options={FORMATS} value={format} onChange={setFormat} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Resolution</label>
            <SegmentedControl options={RESOLUTIONS} value={resolution} onChange={setResolution} />
          </div>
        </div>
      }
    />
  );
}