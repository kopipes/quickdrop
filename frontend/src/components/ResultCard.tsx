'use client';

import { formatBytes, getDownloadUrl } from '@/lib/api';

interface ResultCardProps {
  title: string;
  initialSize: number;
  finalSize: number;
  downloadUrl: string;
  filename: string;
  onReset: () => void;
}

export default function ResultCard({ title, initialSize, finalSize, downloadUrl, filename, onReset }: ResultCardProps) {
  const pct = initialSize > 0 ? Math.round((1 - finalSize / initialSize) * 100) : 0;
  const reduced = pct > 0;

  return (
    <div className="mx-auto max-w-md space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      </div>
      {initialSize > 0 && (
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="text-neutral-500 line-through">{formatBytes(initialSize)}</div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          <div className="text-lg font-semibold text-neutral-900">{formatBytes(finalSize)}</div>
        </div>
      )}
      {reduced && (
        <div className="text-sm font-medium text-green-600">{pct}% smaller</div>
      )}
      <div className="flex flex-col gap-2">
        <a
          href={downloadUrl}
          download={filename}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4m0 0 4 4m-4-4-4 4" />
            <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
          </svg>
          Download {filename}
        </a>
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-6 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
        >
          Process Another File
        </button>
      </div>
    </div>
  );
}