'use client';

interface ErrorCardProps {
  message: string;
  code?: string | null;
  onRetry: () => void;
}

export default function ErrorCard({ message, code, onRetry }: ErrorCardProps) {
  return (
    <div className="mx-auto max-w-md space-y-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M15 9l-6 6M9 9l6 6" />
        </svg>
      </div>
      <div className="text-sm font-medium text-neutral-800">{message}</div>
      {code && <div className="text-xs text-neutral-400">Reference: {code}</div>}
      <button
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
      >
        Try Again
      </button>
    </div>
  );
}