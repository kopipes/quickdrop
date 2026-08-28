'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageLayout } from '@/components/ToolShell';
import { MAX_PDF } from '@/lib/tools';
import { useProcess } from '@/lib/useProcess';
import { getDownloadUrl } from '@/lib/api';
import ProcessingState from '@/components/ProcessingState';
import ResultCard from '@/components/ResultCard';
import ErrorCard from '@/components/ErrorCard';
import DropZone from '@/components/DropZone';

export default function ReorderPDFPage() {
  const { state, run, reset } = useProcess('reorder_pdf');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [pages, setPages] = useState<number[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!docFile) return;
    setLoadingPages(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const doc = await pdfjs.getDocument({ data }).promise;
        const n = doc.numPages;
        setPages(Array.from({ length: n }, (_, i) => i + 1));
        await doc.cleanup();
      } catch (e) {
        console.error('Failed to parse PDF', e);
        setPages([1, 2, 3, 4, 5]);
      }
      setLoadingPages(false);
    };
    reader.readAsArrayBuffer(docFile);
  }, [docFile]);

  const movePage = (from: number, to: number) => {
    setPages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const handleProcess = useCallback(() => {
    if (!docFile) return;
    run([docFile], { order: pages });
  }, [docFile, pages, run]);

  const handleReset = () => {
    reset();
    setDocFile(null);
    setPages([]);
  };

  if (state.stage === 'processing') {
    return (
      <PageLayout title="Reorder PDF" description="Rearrange PDF pages by dragging them into order.">
        <ProcessingState message="Reordering pages…" />
      </PageLayout>
    );
  }

  if (state.stage === 'completed' && state.job) {
    const first = state.job.output_files[0];
    const url = getDownloadUrl(state.job.id, first?.name || 'result');
    return (
      <PageLayout title="Reorder PDF" description="Rearrange PDF pages by dragging them into order.">
        <ResultCard title="Pages reordered" initialSize={docFile?.size || 0} finalSize={state.job.output_size || 0} downloadUrl={url} filename={first?.name || 'result'} onReset={handleReset} />
      </PageLayout>
    );
  }

  if (state.stage === 'error') {
    return (
      <PageLayout title="Reorder PDF" description="Rearrange PDF pages by dragging them into order.">
        <ErrorCard message={state.message || 'Something went wrong.'} code={state.code} onRetry={handleReset} />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Reorder PDF" description="Drag pages to rearrange them in the order you want.">
      <div className="mx-auto max-w-lg space-y-5">
        {!docFile ? (
          <DropZone accept=".pdf" onFiles={(f) => f[0] && setDocFile(f[0])} maxSize={MAX_PDF} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-50 text-red-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-neutral-800">{docFile.name}</div>
                  <div className="text-xs text-neutral-500">{Math.round(docFile.size / 1024 / 1024 * 10) / 10} MB</div>
                </div>
              </div>
              <button onClick={() => setDocFile(null)} className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600">✕</button>
            </div>

            {loadingPages ? (
              <div className="text-center text-sm text-neutral-500 py-4">Reading page count…</div>
            ) : pages.length > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-700">Page Order ({pages.length} pages)</label>
                  <span className="text-xs text-neutral-400">Drag to reorder</span>
                </div>
                <div className="space-y-1">
                  {pages.map((pageNum, idx) => (
                    <div
                      key={`${pageNum}-${idx}`}
                      draggable
                      onDragStart={() => setDragIdx(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragIdx !== null && dragIdx !== idx) movePage(dragIdx, idx);
                        setDragIdx(null);
                      }}
                      className={`flex cursor-grab items-center gap-3 rounded-xl border bg-white px-3 py-2.5 transition-shadow active:cursor-grabbing ${dragIdx === idx ? 'opacity-50' : ''}`}
                    >
                      <span className="text-neutral-300">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>
                      </span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-100 text-xs font-semibold text-neutral-600">{pageNum}</div>
                      <span className="text-sm font-medium text-neutral-700">Page {pageNum}</span>
                      <span className="ml-auto text-xs text-neutral-400">#{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-neutral-500 py-4">Could not read PDF page count.</div>
            )}

            {pages.length > 0 && (
              <button onClick={handleProcess} className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800">
                Save PDF
              </button>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}