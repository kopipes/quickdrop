'use client';

import { useState } from 'react';
import ToolShell from '@/components/ToolShell';
import { MAX_IMAGE } from '@/lib/tools';

const SIZES = [
  { value: 'original', label: 'Original' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const FORMATS = [
  { value: 'original', label: 'Original' },
  { value: '.jpg', label: 'JPG' },
  { value: '.png', label: 'PNG' },
  { value: '.webp', label: 'WebP' },
];

export default function ResizeImagePage() {
  const [mode, setMode] = useState<'percentage' | 'dimension' | 'max'>('percentage');
  const [percentage, setPercentage] = useState(50);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [maxDimension, setMaxDimension] = useState(1200);
  const [quality, setQuality] = useState(85);
  const [format, setFormat] = useState('original');

  return (
    <ToolShell
      tool="resize_image" title="Resize Image" description="Resize, scale, or convert your images."
      accept=".jpg,.jpeg,.png,.webp" maxSize={MAX_IMAGE}
      resultTitle="Image resized" processLabel="Resize Image"
      buildOptions={() => ({
        width: mode === 'dimension' ? width : 0,
        height: mode === 'dimension' ? height : 0,
        percentage: mode === 'percentage' ? percentage : 0,
        max_dimension: mode === 'max' ? maxDimension : 0,
        quality,
        format,
      })}
      settings={
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Mode</label>
            <div className="flex gap-2">
              {([['percentage', 'Scale %'], ['dimension', 'Exact Size'], ['max', 'Max Dimension']] as const).map(([val, lab]) => (
                <button key={val} onClick={() => setMode(val)} className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${mode === val ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'}`}>{lab}</button>
              ))}
            </div>
          </div>

          {mode === 'percentage' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-700">Scale</label>
                <span className="text-xs text-neutral-500">{percentage}%</span>
              </div>
              <input type="range" min={1} max={200} value={percentage} onChange={(e) => setPercentage(Number(e.target.value))} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-neutral-400"><span>1%</span><span>200%</span></div>
            </div>
          )}

          {mode === 'dimension' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-neutral-700">Width (px)</label>
                <input type="number" value={width} onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">Height (px)</label>
                <input type="number" value={height} onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          )}

          {mode === 'max' && (
            <div>
              <label className="text-sm font-medium text-neutral-700">Max Dimension (px)</label>
              <div className="flex gap-1 mt-1 rounded-xl bg-neutral-100 p-1">
                {[800, 1200, 1600, 2000, 3000].map((v) => (
                  <button key={v} onClick={() => setMaxDimension(v)} className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${maxDimension === v ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>{v}</button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-700">Quality</label>
              <span className="text-xs text-neutral-500">{quality}%</span>
            </div>
            <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-primary" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Output Format</label>
            <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
              {FORMATS.map((f) => (
                <button key={f.value} onClick={() => setFormat(f.value)} className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${format === f.value ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>{f.label}</button>
              ))}
            </div>
          </div>
        </div>
      }
    />
  );
}