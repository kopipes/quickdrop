'use client';

import { useCallback, useRef, useState } from 'react';
import { PageLayout } from '@/components/ToolShell';
import { MAX_IMAGE } from '@/lib/tools';
import DropZone from '@/components/DropZone';
import ProcessingState from '@/components/ProcessingState';
import ErrorCard from '@/components/ErrorCard';
import { formatBytes } from '@/lib/api';

interface PendingFile {
  file: File;
  preview: string;
}

interface BgRemovalModule {
  removeBackground: (img: Blob, cfg?: object) => Promise<Blob>;
  preload: (cfg?: object) => Promise<unknown>;
}

export default function RemoveBackgroundPage() {
  const [source, setSource] = useState<PendingFile | null>(null);
  const [stage, setStage] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<{ url: string; name: string; size: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [modelProgress, setModelProgress] = useState(0);
  const [loadingModel, setLoadingModel] = useState(false);
  const moduleRef = useRef<BgRemovalModule | null>(null);

  const preloadModel = useCallback(async () => {
    if (moduleRef.current) return;
    setLoadingModel(true);
    try {
      const mod = (await import('@imgly/background-removal')) as BgRemovalModule;
      moduleRef.current = mod;
      await mod.preload({
        progress: (_key: string, current: number, total: number) => {
          setModelProgress(total > 0 ? Math.round((current / total) * 100) : 0);
        },
      });
    } catch {
      setMessage('Failed to load the AI model. Check your connection and try again.');
    } finally {
      setLoadingModel(false);
    }
  }, []);

  const handleFile = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setSource({ file, preview: URL.createObjectURL(file) });
      setStage('idle');
      setResult(null);
      setMessage(null);
      preloadModel();
    },
    [preloadModel]
  );

  const handleRemove = useCallback(async () => {
    if (!source || !moduleRef.current) return;
    setStage('processing');
    setMessage(null);
    try {
      const resultBlob = await moduleRef.current.removeBackground(source.file, {
        progress: (_key: string, current: number, total: number) => {
          setModelProgress(total > 0 ? Math.round((current / total) * 100) : 0);
        },
      });
      const url = URL.createObjectURL(resultBlob);
      setResult({ url, name: `${source.file.name.replace(/\.[^.]+$/, '')}-no-bg.png`, size: resultBlob.size });
      setStage('done');
    } catch {
      setStage('error');
      setMessage('Could not remove the background from this image. Try a clear, well-lit photo.');
    }
  }, [source]);

  const handleReset = useCallback(() => {
    if (source) URL.revokeObjectURL(source.preview);
    if (result) URL.revokeObjectURL(result.url);
    setSource(null);
    setResult(null);
    setStage('idle');
    setMessage(null);
    setModelProgress(0);
  }, [source, result]);

  return (
    <PageLayout title="Remove Background" description="Erase the background from any image — done entirely in your browser, nothing is uploaded.">
      <div className="mx-auto max-w-lg space-y-5">
        {stage === 'processing' && (
          <ProcessingState
            message={loadingModel ? 'Downloading AI model…' : 'Removing background…'}
            subMessage={modelProgress > 0 ? `${modelProgress}%` : 'First use downloads the model (~30 MB), then it is cached.'}
          />
        )}

        {!source && stage === 'idle' && (
          <>
            <DropZone accept=".jpg,.jpeg,.png,.webp" onFiles={handleFile} maxSize={MAX_IMAGE} label="Drop your image here" />
            <p className="text-center text-xs text-neutral-400">Works best with photos where the subject is clearly separated from the background.</p>
          </>
        )}

        {source && stage !== 'processing' && (
          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={source.preview} alt="Preview" className="h-14 w-14 rounded-lg object-cover" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-neutral-800">{source.file.name}</div>
                  <div className="text-xs text-neutral-500">{formatBytes(source.file.size)}</div>
                </div>
              </div>
              <button onClick={handleReset} className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {stage === 'done' && result && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 text-xs font-medium text-neutral-500">Before</div>
                  <img src={source.preview} alt="Original" className="h-40 w-full rounded-xl bg-neutral-100 object-cover" />
                </div>
                <div>
                  <div className="mb-1 text-xs font-medium text-neutral-500">Result</div>
                  <img src={result.url} alt="Background removed" className="h-40 w-full rounded-xl border border-neutral-200 object-cover" style={{ backgroundImage: 'linear-gradient(45deg,#f0f0f0 25%,transparent 25%),linear-gradient(-45deg,#f0f0f0 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#f0f0f0 75%),linear-gradient(-45deg,transparent 75%,#f0f0f0 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0,0 10px,10px -10px,-10px 0' }} />
                </div>
              </div>
            )}

            {stage === 'error' && (
              <ErrorCard message={message || 'Something went wrong.'} onRetry={() => { setStage('idle'); setMessage(null); }} />
            )}

            {stage === 'idle' || stage === 'error' ? (
              <button onClick={handleRemove} disabled={loadingModel} className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800 disabled:opacity-50">
                {loadingModel ? `Loading model… ${modelProgress}%` : 'Remove Background'}
              </button>
            ) : (
              stage === 'done' && result && (
                <div className="space-y-2">
                  <a href={result.url} download={result.name} className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4m0 0 4 4m-4-4-4 4"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>
                    Download PNG
                  </a>
                  <button onClick={handleReset} className="w-full rounded-xl border border-neutral-200 px-6 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50">
                    Process Another Image
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}