'use client';

import { useCallback, useMemo, useState } from 'react';
import DropZone from './DropZone';
import FileList, { type SelectedFile } from './FileList';
import ProcessingState from './ProcessingState';
import ResultCard from './ResultCard';
import ErrorCard from './ErrorCard';
import { useProcess, formatBytes } from '@/lib/useProcess';
import { getDownloadUrl } from '@/lib/api';

interface ToolShellProps {
  tool: string;
  title: string;
  description: string;
  accept: string;
  multiple?: boolean;
  maxSize: number;
  maxFiles?: number;
  reorderable?: boolean;
  settings?: React.ReactNode;
  processLabel?: string;
  processingLabel?: string;
  resultTitle: string;
  options?: Record<string, unknown>;
  buildOptions?: () => Record<string, unknown>;
  onValidate?: (files: File[]) => string | null;
  autoProcess?: boolean;
}

let idCounter = 0;

export default function ToolShell({
  tool,
  title,
  description,
  accept,
  multiple = false,
  maxSize,
  maxFiles = 20,
  reorderable = false,
  settings,
  processLabel,
  processingLabel,
  resultTitle,
  options = {},
  buildOptions,
  onValidate,
  autoProcess = false,
}: ToolShellProps) {
  const { state, run, reset } = useProcess(tool);
  const [selected, setSelected] = useState<SelectedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(
    (files: File[]) => {
      setError(null);
      const existing = new Set(selected.map((f) => f.file.name + f.file.size));
      const valid = files.filter((f) => f.size <= maxSize);
      const invalid = files.filter((f) => f.size > maxSize);
      if (invalid.length > 0) {
        setError(`"${invalid[0].name}" exceeds the maximum allowed size.`);
      }
      const toAdd = valid
        .filter((f) => !existing.has(f.name + f.size))
        .slice(0, maxFiles - selected.length)
        .map((f) => ({
          file: f,
          id: `f${idCounter++}-${f.name}`,
          preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
        }));
      setSelected((prev) => [...prev, ...toAdd]);
      if (autoProcess && toAdd.length > 0) {
        const next = [...selected, ...toAdd].map((s) => s.file);
        const validation = onValidate?.(next) ?? null;
        if (validation) setError(validation);
        else run(next, buildOptions ? buildOptions() : options);
      }
    },
    [selected, maxSize, maxFiles, autoProcess, onValidate, run, buildOptions, options],
  );

  const removeFile = useCallback((id: string) => {
    setSelected((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const reorder = useCallback((from: number, to: number) => {
    setSelected((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const totalSize = useMemo(() => selected.reduce((sum, f) => sum + f.file.size, 0), [selected]);

  const handleProcess = useCallback(() => {
    if (selected.length === 0) return;
    const validation = onValidate?.(selected.map((s) => s.file)) ?? null;
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    run(selected.map((s) => s.file), buildOptions ? buildOptions() : options);
  }, [selected, run, buildOptions, options, onValidate]);

  const handleReset = useCallback(() => {
    reset();
    setSelected([]);
    setError(null);
  }, [reset]);

  if (state.stage === 'processing') {
    return (
      <PageLayout title={title} description={description}>
        <ProcessingState message={processingLabel || state.message} />
      </PageLayout>
    );
  }

  if (state.stage === 'completed' && state.job) {
    const job = state.job;
    const first = job.output_files[0];
    return (
      <PageLayout title={title} description={description}>
        <ResultCard
          title={resultTitle}
          initialSize={totalSize}
          finalSize={job.output_size || first?.size || 0}
          downloadUrl={getDownloadUrl(job.id, first?.name || 'result')}
          filename={first?.name || 'result'}
          onReset={handleReset}
        />
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
        {selected.length === 0 ? (
          <DropZone accept={accept} multiple={multiple} onFiles={addFiles} maxSize={maxSize} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">
                {selected.length} file{selected.length > 1 ? 's' : ''} selected
              </span>
              <span className="text-xs text-neutral-500">{formatBytes(totalSize)}</span>
            </div>
            <FileList files={selected} onRemove={removeFile} onReorder={reorder} reorderable={reorderable} />
            {selected.length < maxFiles && (
              <button
                onClick={() => document.getElementById(`drop-${tool}`)?.click()}
                className="w-full rounded-xl border border-dashed border-neutral-300 py-2 text-xs font-medium text-neutral-500 transition-colors hover:border-primary/50 hover:text-primary"
              >
                + Add another file
              </button>
            )}
          </div>
        )}

        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}

        {settings}

        {selected.length > 0 && (
          <button
            onClick={handleProcess}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800 active:scale-[0.99]"
          >
            {processLabel || title}
          </button>
        )}
      </div>
    </PageLayout>
  );
}

export function PageLayout({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">{title}</h1>
        <p className="mt-1.5 text-sm text-neutral-500">{description}</p>
      </div>
      {children}
    </div>
  );
}