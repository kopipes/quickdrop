'use client';

import { useCallback, useEffect, useState } from 'react';
import { getToolClickCounts, recordToolClick } from '@/lib/api';

export function useToolAnalytics() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      getToolClickCounts().then((c) => {
        if (!cancelled) setCounts(c);
      });
    };
    load();
    const timer = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const fireView = useCallback((toolIds: string[]) => {
    // Only record each tool click once (keyed by tool) to avoid double-counting
    recordToolClick(toolIds[0]);
  }, []);

  return { counts, fireView };
}