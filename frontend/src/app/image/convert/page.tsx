'use client';

import { useState } from 'react';
import ToolShell from '@/components/ToolShell';
import { MAX_IMAGE } from '@/lib/tools';

const FORMATS = [
  { value: 'jpg', label: 'JPG', lossy: true },
  { value: 'png', label: 'PNG', lossy: false },
  { value: 'webp', label: 'WebP', lossy: true },
  { value: 'gif', label: 'GIF', lossy: false },
  { value: 'bmp', label: 'BMP', lossy: false },
  { value: 'tiff', label: 'TIFF', lossy: false },
];

export default function ImageConvertPage() {
  const [format, setFormat] = useState('jpg');
  const [quality, setQuality] = useState(85);
  const selectedFmt = FORMATS.find(f => f.value === format);

  return (
    <ToolShell
      tool="image_convert" title="Image Converter" description="Convert images between JPG, PNG, WebP, GIF, BMP, and TIFF. Batch convert multiple files at once."
      accept=".jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.tif" multiple maxSize={MAX_IMAGE} maxFiles={20}
      resultTitle="Conversion complete" processLabel="Convert Images"
      options={{ format, quality }}
      settings={
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Output Format</label>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map(f => (
                <button key={f.value} onClick={() => setFormat(f.value)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${format === f.value ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          {selectedFmt?.lossy && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-700">Quality</label>
                <span className="text-xs text-neutral-500">{quality}%</span>
              </div>
              <input type="range" min={10} max={100} value={quality}
                onChange={e => setQuality(Number(e.target.value))}
                className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Smaller file</span><span>Higher quality</span>
              </div>
            </div>
          )}
          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50 p-3 text-xs text-neutral-500">
            Multiple files are returned as a ZIP. Single file downloads directly.
          </div>
        </div>
      }
    />
  );
}