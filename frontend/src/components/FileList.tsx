'use client';

import { useState } from 'react';
import { formatBytes } from '@/lib/api';

export interface SelectedFile {
  file: File;
  preview?: string;
  id: string;
}

interface FileListProps {
  files: SelectedFile[];
  onRemove: (id: string) => void;
  onReorder?: (from: number, to: number) => void;
  reorderable?: boolean;
}

export default function FileList({ files, onRemove, onReorder, reorderable = false }: FileListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDrop = (targetIndex: number) => {
    if (dragIndex !== null && dragIndex !== targetIndex && onReorder) {
      onReorder(dragIndex, targetIndex);
    }
    setDragIndex(null);
  };

  return (
    <div className="space-y-2">
      {files.map((f, index) => (
        <div
          key={f.id}
          draggable={reorderable}
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(index)}
          className={`flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5 transition-shadow ${dragIndex === index ? 'opacity-50' : ''} ${
            reorderable ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
        >
          {reorderable && (
            <span className="text-neutral-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>
            </span>
          )}
          {f.preview ? (
            <img src={f.preview} alt="" className="h-9 w-9 rounded-md object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-50 text-red-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-neutral-800">{f.file.name}</div>
            <div className="text-xs text-neutral-500">{formatBytes(f.file.size)}</div>
          </div>
          <button
            onClick={() => onRemove(f.id)}
            className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Remove file"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      ))}
    </div>
  );
}