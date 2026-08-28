'use client';

import { useCallback, useState } from 'react';
import { PageLayout } from '@/components/ToolShell';
import DropZone from '@/components/DropZone';
import { MAX_IMAGE } from '@/lib/tools';
import { API_BASE } from '@/lib/types';
import { formatBytes } from '@/lib/api';

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function ColorCard({ color }: { color: Color }) {
  const [copied, setCopied] = useState<string | null>(null);
  const fg = luminance(color.hex) > 0.6 ? '#1c1917' : '#ffffff';
  const { r, g, b } = color.rgb;
  const { c, m, y, k } = color.cmyk;
  const copy = (s: string, key: string) => {
    navigator.clipboard.writeText(s).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    });
  };
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
      <div className="flex h-24 w-full items-center justify-center" style={{ backgroundColor: color.hex }}>
        <span className="font-mono text-lg font-semibold" style={{ color: fg }}>{color.hex}</span>
      </div>
      <div className="space-y-1 p-3">
        {[
          { key: 'hex', label: 'HEX', value: color.hex },
          { key: 'rgb', label: 'RGB', value: `rgb(${r}, ${g}, ${b})` },
          { key: 'cmyk', label: 'CMYK', value: `cmyk(${c}%, ${m}%, ${y}%, ${k}%)` },
        ].map(({ key, label, value }) => (
          <button
            key={key}
            onClick={() => copy(value, key)}
            className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-neutral-50"
          >
            <span className="font-medium text-neutral-500 w-10 shrink-0">{label}</span>
            <span className="font-mono text-neutral-700 min-w-0 truncate">{value}</span>
            <span className="shrink-0 text-neutral-400">{copied === key ? '✓' : 'copy'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PaletteExtractorPage() {
  const [source, setSource] = useState<{ file: File; url: string } | null>(null);
  const [colors, setColors] = useState<Color[]>([]);
  const [count, setCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extract = useCallback(async (file: File, n: number) => {
    setLoading(true);
    setError(null);
    setColors([]);
    try {
      const form = new FormData();
      form.append('files', file);
      const res = await fetch(`${API_BASE}/api/palette?count=${n}`, { method: 'POST', body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to extract palette.' }));
        throw new Error(err.detail || 'Failed to extract palette.');
      }
      const data = await res.json();
      setColors(data.colors || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFile = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSource({ file, url });
    setColors([]);
    setError(null);
    extract(file, count);
  }, [count, extract]);

  const handleReset = useCallback(() => {
    if (source) URL.revokeObjectURL(source.url);
    setSource(null);
    setColors([]);
    setError(null);
  }, [source]);

  const [allCopied, setAllCopied] = useState(false);
  const copyAll = () => {
    const text = colors.map(c => `${c.hex}  rgb(${c.rgb.r},${c.rgb.g},${c.rgb.b})  cmyk(${c.cmyk.c}%,${c.cmyk.m}%,${c.cmyk.y}%,${c.cmyk.k}%)`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 1500);
    });
  };

  return (
    <PageLayout title="Palette Extractor" description="Upload any image to extract its dominant colors as HEX, RGB, and CMYK.">
      <div className="mx-auto max-w-4xl space-y-6">
        {!source ? (
          <div className="max-w-lg mx-auto">
            <DropZone accept=".jpg,.jpeg,.png,.webp" onFiles={handleFile} maxSize={MAX_IMAGE} label="Drop your image here" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-2xl border border-neutral-200/80 bg-white px-4 py-3">
              <img src={source.url} alt="Preview" className="h-14 w-14 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-neutral-800">{source.file.name}</div>
                <div className="text-xs text-neutral-500">{formatBytes(source.file.size)}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-neutral-500">Colors</label>
                  <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
                    {[5, 6, 8, 10].map((n) => (
                      <button key={n} onClick={() => { setCount(n); extract(source.file, n); }} className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${count === n ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>{n}</button>
                    ))}
                  </div>
                </div>
                <button onClick={handleReset} className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600">✕</button>
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-neutral-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-primary" />
                Extracting colors…
              </div>
            )}

            {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

            {colors.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
                  {colors.map((color) => (
                    <ColorCard key={color.hex} color={color} />
                  ))}
                </div>
                <div className="flex justify-center">
                  <button onClick={copyAll} className="rounded-xl border border-neutral-200 px-5 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50">
                    {allCopied ? 'Copied!' : 'Copy All Colors'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}