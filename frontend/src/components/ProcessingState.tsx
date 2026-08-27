'use client';

interface ProcessingStateProps {
  message?: string;
  subMessage?: string;
}

const MESSAGES = ['Uploading', 'Processing', 'Preparing download'];

export default function ProcessingState({ message, subMessage }: ProcessingStateProps) {
  return (
    <div className="mx-auto max-w-sm space-y-4 text-center">
      <div className="flex items-center justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-3 w-3 rounded-full bg-neutral-900 animate-pulse"
            style={{ animationDelay: `${i * 200}ms`, animationDuration: '1.5s' }}
          />
        ))}
      </div>
      <div className="text-sm font-medium text-neutral-700">{message || 'Processing your file…'}</div>
      <div className="text-xs text-neutral-500">{subMessage || 'This usually takes a few seconds.'}</div>
    </div>
  );
}