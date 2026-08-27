'use client';

import { useState } from 'react';
import ToolShell from '@/components/ToolShell';
import { MAX_PDF } from '@/lib/tools';

const PRESETS = [
  { value: 'maximum', label: 'Maximum Compression', desc: 'Smallest file size, lower quality' },
  { value: 'balanced', label: 'Balanced', desc: 'Good balance between quality and size' },
  { value: 'best', label: 'Best Quality', desc: 'Light compression, preserves visual quality' },
];

export default function CompressPDFPage() {
  const [preset, setPreset] = useState('balanced');
  return (
    <ToolShell
      tool="compress_pdf" title="Compress PDF" description="Reduce your PDF file size while keeping it clear."
      accept=".pdf" maxSize={MAX_PDF}
      resultTitle="Compression complete" processLabel="Compress PDF"
      options={{ preset }}
      settings={
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Compression</label>
          {PRESETS.map((p) => (
            <label key={p.value} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${preset === p.value ? 'border-primary/40 bg-primary/5' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}>
              <input type="radio" name="preset" value={p.value} checked={preset === p.value} onChange={() => setPreset(p.value)} className="h-4 w-4 accent-primary" />
              <div>
                <div className="text-sm font-medium text-neutral-800">{p.label}</div>
                <div className="text-xs text-neutral-500">{p.desc}</div>
              </div>
            </label>
          ))}
        </div>
      }
    />
  );
}