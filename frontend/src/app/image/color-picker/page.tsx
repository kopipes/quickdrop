'use client';

import { useCallback, useRef, useState } from 'react';
import { PageLayout } from '@/components/ToolShell';
import { MAX_IMAGE } from '@/lib/tools';
import DropZone from '@/components/DropZone';
import { formatBytes } from '@/lib/api';

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
  return `#${h(r)}${h(g)}${h(b)}`;
}

export default function ColorPickerPage() {
  const [source, setSource] = useState<{ file: File; url: string } | null>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [color, setColor] = useState<string | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx?.drawImage(img, 0, 0);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
    setSource({ file, url });
    setColor(null);
    setCursor(null);
  }, []);

  const handleMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const data = ctx.getImageData(x, y, 1, 1).data;
    setColor(rgbToHex(data[0], data[1], data[2]));
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleReset = useCallback(() => {
    if (source) URL.revokeObjectURL(source.url);
    setSource(null);
    setColor(null);
    setCursor(null);
  }, [source]);

  const copy = useCallback((s: string) => {
    navigator.clipboard.writeText(s).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }, []);

  return (
    <PageLayout title="Image → Color Picker" description="Hover over any pixel of your image to read its exact color — everything happens in your browser.">
      <div className="mx-auto max-w-3xl space-y-5">
        {!source ? (
          <DropZone accept=".jpg,.jpeg,.png,.webp" onFiles={handleFile} maxSize={MAX_IMAGE} label="Drop an image here" />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <img src={source.url} alt="Preview" className="h-10 w-10 rounded-lg object-cover" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-neutral-800">{source.file.name}</div>
                  <div className="text-xs text-neutral-500">{formatBytes(source.file.size)} · {imgSize.w}×{imgSize.h}px</div>
                </div>
              </div>
              <button onClick={handleReset} className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600">✕</button>
            </div>

            <div ref={containerRef} className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <canvas
                ref={canvasRef}
                onMouseMove={handleMove}
                className="h-auto max-h-[480px] w-full cursor-crosshair object-contain"
              />
              {cursor && (
                <div
                  className="pointer-events-none absolute z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                  style={{ left: cursor.x, top: cursor.y, backgroundColor: color || '#000' }}
                />
              )}
            </div>

            {color && (
              <div className="flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5">
                <div className="h-16 w-16 shrink-0 rounded-xl border border-neutral-200" style={{ backgroundColor: color }} />
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-xl font-semibold text-neutral-900">{color}</div>
                  <div className="text-sm text-neutral-500">
                    RGB {parseInt(color.slice(1, 3), 16)}, {parseInt(color.slice(3, 5), 16)}, {parseInt(color.slice(5, 7), 16)}
                  </div>
                </div>
                <button onClick={() => copy(color)} className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50">
                  {copied ? 'Copied!' : 'Copy Hex'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}