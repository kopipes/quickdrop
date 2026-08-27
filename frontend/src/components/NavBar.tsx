'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ToolSearch from './ToolSearch';
import { getToolByPath } from '@/lib/tools';

const NAV = [
  { label: 'PDF', href: '/pdf/compress' },
  { label: 'Presentation', href: '/presentation/shrink' },
  { label: 'Watermark', href: '/watermark/pdf' },
  { label: 'QR', href: '/qr' },
];

export default function NavBar() {
  const pathname = usePathname();
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('quikdrop_recent') || '[]');
      setRecent(Array.isArray(stored) ? stored : []);
    } catch {
      setRecent([]);
    }
  }, [pathname]);

  useEffect(() => {
    const tool = getToolByPath(pathname);
    if (!tool) return;
    try {
      const stored = JSON.parse(localStorage.getItem('quikdrop_recent') || '[]');
      const next = [tool.id, ...(Array.isArray(stored) ? stored : [])].filter(
        (x, i, arr) => arr.indexOf(x) === i
      ).slice(0, 6);
      localStorage.setItem('quikdrop_recent', JSON.stringify(next));
      setRecent(next);
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-[#fafaf9]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-white">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
              </svg>
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-neutral-900">QuikDrop</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const isActive = pathname.startsWith(item.href.split('/')[1]) && item.label !== 'PDF'
                ? pathname.includes(`/${item.label.toLowerCase()}`)
                : item.label === 'PDF' && pathname.startsWith('/pdf');
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="hidden sm:block">
          <ToolSearch />
        </div>
      </div>
    </header>
  );
}