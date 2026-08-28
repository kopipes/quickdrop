'use client';

import { useEffect, useState } from 'react';
import { API_BASE } from '@/lib/types';

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/visitors`, { credentials: 'include' });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) setCount(data.active as number);
      } catch {
        // ignore network errors; show nothing
      } finally {
        if (!cancelled) timer = setTimeout(tick, 15000);
      }
    };
    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (count === null) return null;

  return (
    <p className="flex items-center gap-1.5 text-xs text-neutral-500">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      {count.toLocaleString()} {count === 1 ? 'person' : 'people'} using this site now
    </p>
  );
}