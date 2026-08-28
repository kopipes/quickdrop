'use client';

import { useCallback, useState } from 'react';
import ToolShell, { PageLayout } from '@/components/ToolShell';
import { MAX_PDF, MAX_IMAGE } from '@/lib/tools';
import DropZone from '@/components/DropZone';
import { useProcess } from '@/lib/useProcess';
import { getDownloadUrl } from '@/lib/api';
import ProcessingState from '@/components/ProcessingState';
import ResultCard from '@/components/ResultCard';
import ErrorCard from '@/components/ErrorCard';

const POSITIONS = [
  'top-left', 'top-center', 'top-right',
  'center',
  'bottom-left', 'bottom-center', 'bottom-right',
] as const;

const POS_LABELS: Record<string, string> = {
  'top-left': 'Top Left', 'top-center': 'Top Center', 'top-right': 'Top Right',
  center: 'Center',
  'bottom-left': 'Bottom Left', 'bottom-center': 'Bottom Center', 'bottom-right': 'Bottom Right',
};

const SIZES = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const ROTATIONS = [0, 45, -45, 90];

export default function WatermarkPDFPage() {
  return <WatermarkPage kind="pdf" />;
}

function WatermarkPage({ kind }: { kind: 'pdf' | 'presentation' }) {
  const tool = kind === 'pdf' ? 'watermark_pdf' : 'watermark_presentation';
  const accept = kind === 'pdf' ? '.pdf' : '.pptx';
  const maxSize = kind === 'pdf' ? MAX_PDF : 150 * 1024 * 1024;
  const title = kind === 'pdf' ? 'Watermark PDF' : 'Watermark Presentation';
  const description = kind === 'pdf' ? 'Add a text or image watermark to your PDF.' : 'Add a text or image watermark to every slide.';

  const { state, run, reset } = useProcess(tool);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [wmType, setWmType] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('DRAFT');
  const [wmImage, setWmImage] = useState<File | null>(null);
  const [position, setPosition] = useState<string>('center');
  const [opacity, setOpacity] = useState(0.3);
  const [size, setSize] = useState('medium');
  const [rotation, setRotation] = useState(0);
  const [applyTo, setApplyTo] = useState<'all' | 'selected'>('all');
  const [pages, setPages] = useState('');

  const handleProcess = useCallback(() => {
    if (!docFile) return;
    if (wmType === 'text' && !text.trim()) return;
    if (wmType === 'image' && !wmImage) return;
    const files = [docFile];
    if (wmImage) files.push(wmImage);
    const options: Record<string, unknown> = {
      watermark_type: wmType,
      text: text.trim(),
      position,
      opacity,
      size,
      rotation,
      apply_to: applyTo,
    };
    if (applyTo === 'selected') {
      options.selected_pages = pages.split(/[,.\s]+/).map(Number).filter(Boolean);
    }
    run(files, options);
  }, [docFile, wmType, text, wmImage, position, opacity, size, rotation, applyTo, pages, run]);

  const handleReset = () => {
    reset();
    setDocFile(null);
    setWmImage(null);
    setPages('');
  };

  if (state.stage === 'processing') {
    return (
      <PageLayout title={title} description={description}>
        <ProcessingState message="Adding watermark…" />
      </PageLayout>
    );
  }

  if (state.stage === 'completed' && state.job) {
    const first = state.job.output_files[0];
    const url = getDownloadUrl(state.job.id, first?.name || 'result');
    return (
      <PageLayout title={title} description={description}>
        <ResultCard title="Watermark applied" initialSize={docFile?.size || 0} finalSize={state.job.output_size || 0} downloadUrl={url} filename={first?.name || 'result'} onReset={handleReset} />
      </PageLayout>
    );
  }

  if (state.stage === 'error') {
    return (
      <PageLayout title={title} description={description}>
        <ErrorCard message={state.message || 'Something went wrong.'} code={state.code} onRetry={handleReset} />
      </PageLayout>
    );
  }

  return (
    <PageLayout title={title} description={description}>
      <div className="mx-auto max-w-lg space-y-5">
        {!docFile ? (
          <DropZone accept={accept} onFiles={(f) => f[0] && setDocFile(f[0])} maxSize={maxSize} />
        ) : (
          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-50 text-red-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-neutral-800">{docFile.name}</div>
                  <div className="text-xs text-neutral-500">{Math.round(docFile.size / 1024 / 1024 * 10) / 10} MB</div>
                </div>
              </div>
              <button onClick={() => setDocFile(null)} className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Watermark type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Watermark Type</label>
              <div className="flex gap-2">
                <button onClick={() => setWmType('text')} className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${wmType === 'text' ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'}`}>Text</button>
                <button onClick={() => setWmType('image')} className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${wmType === 'image' ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'}`}>Image / Logo</button>
              </div>
            </div>

            {wmType === 'text' ? (
              <div>
                <label className="text-sm font-medium text-neutral-700">Text</label>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. DRAFT, CONFIDENTIAL" className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Watermark Image</label>
                {wmImage ? (
                  <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                    <span className="text-sm text-neutral-700">{wmImage.name}</span>
                    <button onClick={() => setWmImage(null)} className="text-neutral-400 hover:text-neutral-600">✕</button>
                  </div>
                ) : (
                  <DropZone accept=".png,.jpg,.jpeg" onFiles={(f) => f[0] && setWmImage(f[0])} maxSize={MAX_IMAGE} label="Drop watermark image" />
                )}
              </div>
            )}

            {/* Position */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Position</label>
              <div className="grid grid-cols-3 gap-1.5">
                {POSITIONS.map((p) => (
                  <button key={p} onClick={() => setPosition(p)} className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${position === p ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'}`}>{POS_LABELS[p]}</button>
                ))}
              </div>
            </div>

            {/* Opacity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-700">Opacity</label>
                <span className="text-xs text-neutral-500">{Math.round(opacity * 100)}%</span>
              </div>
              <input type="range" min={0.1} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full accent-primary" />
            </div>

            {/* Size + Rotation */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700">Size</label>
                <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
                  {SIZES.map((s) => (
                    <button key={s.value} onClick={() => setSize(s.value)} className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${size === s.value ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>{s.label}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700">Rotation</label>
                <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
                  {ROTATIONS.map((r) => (
                    <button key={r} onClick={() => setRotation(r)} className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${rotation === r ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>{r === 0 ? '0°' : `${r}°`}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Apply to */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Apply To</label>
              <div className="flex gap-2">
                <button onClick={() => setApplyTo('all')} className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${applyTo === 'all' ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'}`}>All Pages</button>
                <button onClick={() => setApplyTo('selected')} className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${applyTo === 'selected' ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'}`}>Selected Pages</button>
              </div>
              {applyTo === 'selected' && (
                <input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="e.g. 1, 3, 5" className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
              )}
            </div>

            <button onClick={handleProcess} className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800">
              Apply Watermark
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}