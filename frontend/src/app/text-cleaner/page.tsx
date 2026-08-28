'use client';

import { useCallback, useMemo, useState } from 'react';
import { PageLayout } from '@/components/ToolShell';

const CLEANERS = [
  { id: 'trim', label: 'Trim Whitespace',
    fn: (s: string) => s.split('\n').map(l => l.trim()).join('\n').trim() },
  { id: 'dedup', label: 'Remove Empty Lines',
    fn: (s: string) => s.split('\n').filter(l => l.trim()).join('\n') },
  { id: 'collapse', label: 'Collapse Spaces',
    fn: (s: string) => s.replace(/[ \t]+/g, ' ').trim() },
  { id: 'join', label: 'Join Lines',
    fn: (s: string) => s.replace(/\n+/g, ' ').trim() },
  { id: 'html', label: 'Strip HTML Tags',
    fn: (s: string) => s.replace(/<[^>]*>/g, '') },
  { id: 'nonascii', label: 'Remove Non-ASCII',
    fn: (s: string) => s.replace(/[^\x20-\x7E\n]/g, '') },
  { id: 'lower', label: 'Lowercase',
    fn: (s: string) => s.toLowerCase() },
  { id: 'upper', label: 'UPPERCASE',
    fn: (s: string) => s.toUpperCase() },
  { id: 'title', label: 'Title Case',
    fn: (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase()) },
  { id: 'smartquotes', label: 'Smart → Straight Quotes',
    fn: (s: string) => s.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"').replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'") },
  { id: 'straight2smart', label: 'Straight → Smart Quotes',
    fn: (s: string) => s.replace(/"([^"]*)"/g, '\u201C$1\u201D').replace(/'([^']*)'/g, '\u2018$1\u2019') },
  { id: 'numbers', label: 'Keep Only Numbers',
    fn: (s: string) => s.replace(/[^0-9\n]/g, '') },
  { id: 'letters', label: 'Keep Only Letters',
    fn: (s: string) => s.replace(/[^a-zA-Z\n]/g, '') },
];

const PRESETS = [
  { label: 'Minimal Clean', cleaners: ['trim', 'collapse', 'dedup'] },
  { label: 'Email Body', cleaners: ['trim', 'dedup', 'join'] },
  { label: 'Strip Markup', cleaners: ['html', 'trim', 'dedup', 'collapse'] },
  { label: 'ASCII Only', cleaners: ['nonascii', 'trim', 'dedup', 'collapse'] },
];

export default function TextCleanerPage() {
  const [input, setInput] = useState('');
  const [active, setActive] = useState<Set<string>>(new Set(['trim', 'collapse', 'dedup']));
  const [copied, setCopied] = useState(false);

  const toggle = useCallback((id: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const applyPreset = useCallback((preset: typeof PRESETS[number]) => {
    setActive(new Set(preset.cleaners));
  }, []);

  const output = useMemo(() => {
    let s = input;
    for (const c of CLEANERS) {
      if (active.has(c.id)) s = c.fn(s);
    }
    return s;
  }, [input, active]);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [output]);

  return (
    <PageLayout title="Text Cleaner" description="Remove unwanted formatting, tags, and characters from text — fully in your browser.">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.label} onClick={() => applyPreset(p)} className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100">
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {CLEANERS.map((c) => (
            <button key={c.id} onClick={() => toggle(c.id)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${active.has(c.id) ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'}`}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-neutral-700">Before</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste your text here…" rows={12} className="mt-1 w-full resize-y rounded-xl border border-neutral-200 bg-white p-3 text-sm leading-relaxed text-neutral-700 outline-none placeholder-neutral-400 focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700">After</label>
            <textarea readOnly value={output} rows={12} className="mt-1 w-full resize-y rounded-xl bg-neutral-50 p-3 text-sm leading-relaxed text-neutral-700 outline-none" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <span>Input: {input.length.toLocaleString()} chars, {input ? input.split(/\n/).length : 0} lines</span>
          <span className="text-neutral-300">·</span>
          <span>Output: {output.length.toLocaleString()} chars, {output ? output.split(/\n/).length : 0} lines</span>
          <span className="text-neutral-300">·</span>
          <span>{output.length > 0 ? `${(input.length - output.length).toLocaleString()} chars removed (${input.length > 0 ? Math.round((1 - output.length / input.length) * 100) : 0}%)` : '—'}</span>
          <div className="ml-auto flex gap-2">
            <button onClick={copy} disabled={!output} className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-40">
              {copied ? 'Copied!' : 'Copy Result'}
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}