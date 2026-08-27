'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { searchTools } from '@/lib/tools';

interface ToolSearchProps {
  autoFocus?: boolean;
  placeholder?: string;
  large?: boolean;
  onNavigate?: () => void;
}

export default function ToolSearch({ autoFocus, placeholder = 'Search tools…', large = false, onNavigate }: ToolSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => (query ? searchTools(query) : []), [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => setActive(0), [query]);

  const go = (path: string) => {
    setOpen(false);
    setQuery('');
    onNavigate?.();
    router.push(path);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active].path);
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`relative ${large ? 'w-full max-w-xl' : 'w-full max-w-xs'}`}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-neutral-800 placeholder-neutral-400 outline-none transition-shadow focus:border-primary/50 focus:ring-2 focus:ring-primary/20 ${
            large ? 'py-3.5 text-base' : 'py-2 text-sm'
          }`}
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 sm:block">
          ⌘K
        </kbd>
      </div>

      {open && query && (
        <div
          ref={listRef}
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg"
        >
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-neutral-500">No tools match “{query}”.</div>
          ) : (
            results.map((t, i) => (
              <button
                key={t.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(t.path)}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                  i === active ? 'bg-primary/5 text-primary' : 'text-neutral-700'
                }`}
              >
                <span className="font-medium">{t.name}</span>
                <span className="text-xs text-neutral-400">{t.category}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}