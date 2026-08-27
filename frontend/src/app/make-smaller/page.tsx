'use client';

import { useState } from 'react';
import ToolShell from '@/components/ToolShell';
import { MAX_PPTX } from '@/lib/tools';

const TARGETS = [
  { value: '2mb', label: 'Under 2 MB', desc: 'Minimal size for quick sharing' },
  { value: '5mb', label: 'Under 5 MB', desc: 'Good for email attachments' },
  { value: '10mb', label: 'Under 10 MB', desc: 'Balanced quality' },
  { value: 'whatsapp', label: 'WhatsApp Friendly', desc: 'Under 16 MB for easy sharing' },
];

export default function MakeItSmallerPage() {
  const [target, setTarget] = useState('5mb');
  return (
    <ToolShell
      tool="make_it_smaller" title="Make It Smaller" description="Upload any file — PDF, PPTX, or image — and tell us how small you need it. We'll handle the rest."
      accept=".pdf,.pptx,.jpg,.jpeg,.png,.webp" maxSize={MAX_PPTX}
      resultTitle="File optimized" processLabel="Make It Smaller"
      options={{ target }}
      settings={
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">How small do you need it?</label>
          {TARGETS.map((t) => (
            <label key={t.value} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${target === t.value ? 'border-primary/40 bg-primary/5' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}>
              <input type="radio" name="target" value={t.value} checked={target === t.value} onChange={() => setTarget(t.value)} className="h-4 w-4 accent-primary" />
              <div>
                <div className="text-sm font-medium text-neutral-800">{t.label}</div>
                <div className="text-xs text-neutral-500">{t.desc}</div>
              </div>
            </label>
          ))}
        </div>
      }
    />
  );
}