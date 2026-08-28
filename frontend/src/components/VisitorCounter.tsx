'use client';

import { useEffect, useState } from 'react';
import { API_BASE } from '@/lib/types';

interface VisitorData {
  active: number;
  total: number;
}

export default function VisitorCounter() {
  const [data, setData] = useState<VisitorData | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/visitors`, { credentials: 'include' });
        if (!res.ok) throw new Error();
        const d = (await res.json()) as { active: number; total: number };
        if (!cancelled) setData({ active: d.active ?? 0, total: d.total ?? 0 });
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

  if (!data) return null;

  return (
    <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-neutral-500">
      <span className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        {data.active.toLocaleString()} {data.active === 1 ? 'person' : 'people'} now
      </span>
      <span className="text-neutral-300">·</span>
      <span>{data.total.toLocaleString()} total uses</span>
    </p>
  );
}