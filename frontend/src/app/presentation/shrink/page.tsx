'use client';

import { useState } from 'react';
import ToolShell from '@/components/ToolShell';
import { MAX_PPTX } from '@/lib/tools';

const PRESETS = [
  { value: 'smallest', label: 'Smallest File', desc: 'Aggressive optimization — great for email & WhatsApp' },
  { value: 'balanced', label: 'Balanced', desc: 'Good for normal presentations and client review' },
  { value: 'best', label: 'Best Quality', desc: 'Minimal visual reduction — for screen & archive' },
];

export default function ShrinkPresentationPage() {
  const [preset, setPreset] = useState('balanced');
  return (
    <ToolShell
      tool="shrink_presentation" title="Shrink Presentation" description="Reduce PowerPoint file size without ruining the layout."
      accept=".pptx" maxSize={MAX_PPTX}
      resultTitle="Presentation optimized" processLabel="Shrink Presentation"
      options={{ preset }}
      settings={
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Optimization</label>
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