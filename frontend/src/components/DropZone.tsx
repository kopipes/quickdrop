'use client';

import { useCallback, useRef, useState } from 'react';

interface DropZoneProps {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label?: string;
  hint?: string;
  maxSize?: number;
}

export default function DropZone({ accept, multiple = false, onFiles, label = 'Drop your file here', hint, maxSize }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      onFiles(files);
    },
    [onFiles]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`group relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all duration-200 ${
        dragging
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : 'border-neutral-300 bg-white hover:border-primary/60 hover:bg-neutral-50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(Array.from(e.target.files));
        }}
      />
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 16V4m0 0 4 4m-4-4-4 4" />
          <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </svg>
      </div>
      <div className="text-sm font-medium text-neutral-800">{label}</div>
      <div className="text-xs text-neutral-500">
        or click to browse
      </div>
      {hint && <div className="mt-1 text-xs text-neutral-400">{hint}</div>}
      {maxSize ? <div className="mt-1 text-xs text-neutral-400">Max {Math.round(maxSize / 1024 / 1024)} MB</div> : null}
    </div>
  );
}