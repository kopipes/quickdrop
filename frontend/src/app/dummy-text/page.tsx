'use client';

import { useCallback, useMemo, useState } from 'react';
import { PageLayout } from '@/components/ToolShell';

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
  'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
  'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip',
  'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat',
  'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id',
];

const DICTIONARY = [
  'apple', 'mountain', 'river', 'ocean', 'forest', 'cloud', 'stone', 'breeze', 'sunlight', 'shadow',
  'house', 'window', 'garden', 'bridge', 'journey', 'moment', 'silence', 'whisper', 'echo', 'horizon',
  'morning', 'evening', 'winter', 'spring', 'harvest', 'market', 'village', 'city', 'street', 'corner',
  'letter', 'message', 'story', 'memory', 'dream', 'thought', 'idea', 'question', 'answer', 'reason',
  'circle', 'square', 'pattern', 'color', 'sound', 'voice', 'motion', 'rhythm', 'balance', 'space',
  'digital', 'cloud', 'code', 'data', 'signal', 'network', 'frame', 'pixel', 'stream', 'switch',
];

const FIRST_NAMES = ['Amelia', 'Liam', 'Olivia', 'Noah', 'Emma', 'Ethan', 'Ava', 'Lucas', 'Mia', 'Mason', 'Isabella', 'James', 'Sophia', 'Benjamin', 'Charlotte', 'Daniel', 'Harper', 'Henry', 'Evelyn', 'Alexander'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'];
const STREETS = ['Main', 'Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Washington', 'Lake', 'Hill', 'Park', 'Sunset', 'Riverside', 'Broadway', 'Highland', 'Church', 'Market', 'School', 'Center', 'Union', 'Spring'];
const CITIES = ['Springfield', 'Riverside', 'Franklin', 'Greenville', 'Bristol', 'Clinton', 'Fairview', 'Salem', 'Madison', 'Georgetown', 'Arlington', 'Ashland', 'Burlington', 'Manchester', 'Newport', 'Chester', 'Clayton', 'Milford', 'Dover', 'Kingston'];

type Mode = 'lorem' | 'words' | 'names' | 'emails' | 'phones' | 'addresses' | 'dates' | 'uuids' | 'numbers';

const MODES: { value: Mode; label: string }[] = [
  { value: 'lorem', label: 'Lorem Ipsum' },
  { value: 'words', label: 'Random Words' },
  { value: 'names', label: 'Names' },
  { value: 'emails', label: 'Emails' },
  { value: 'phones', label: 'Phone Numbers' },
  { value: 'addresses', label: 'Addresses' },
  { value: 'dates', label: 'Dates' },
  { value: 'uuids', label: 'UUIDs' },
  { value: 'numbers', label: 'Numbers' },
];

const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(arr: T[]): T => arr[rand(arr.length)];
const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function makeSentence(): string {
  const len = randInt(6, 14);
  const words = Array.from({ length: len }, () => pick(DICTIONARY));
  return cap(words.join(' ')) + '.';
}

function makeLoremSentence(): string {
  const len = randInt(7, 16);
  const words = Array.from({ length: len }, () => pick(LOREM_WORDS));
  return cap(words.join(' ')) + '.';
}

function makeParagraph(lorem: boolean): string {
  const sentences = randInt(3, 6);
  const maker = lorem ? makeLoremSentence : makeSentence;
  return Array.from({ length: sentences }, () => maker()).join(' ');
}

function makeEmail(): string {
  const first = pick(FIRST_NAMES).toLowerCase();
  const last = pick(LAST_NAMES).toLowerCase();
  const domains = ['example.com', 'mail.com', 'test.org', 'sample.net', 'demo.io'];
  return `${first}.${last}${randInt(1, 99)}@${pick(domains)}`;
}

function makePhone(): string {
  const area = randInt(200, 999);
  const mid = randInt(200, 999);
  const last = randInt(1000, 9999);
  return `(${area}) ${mid}-${last}`;
}

function makeAddress(): string {
  const num = randInt(1, 9999);
  const street = pick(STREETS);
  const suffix = pick(['St', 'Ave', 'Rd', 'Blvd', 'Ln', 'Dr', 'Ct', 'Way']);
  return `${num} ${street} ${suffix}, ${pick(CITIES)}, ${pick(['CA', 'NY', 'TX', 'FL', 'WA', 'IL', 'MA', 'CO'])} ${randInt(10000, 99999)}`;
}

function makeDate(): string {
  const y = randInt(1990, 2030);
  const m = randInt(1, 12);
  const d = randInt(1, 28);
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function makeUuid(): string {
  const hex = '0123456789abcdef';
  const seg = (n: number) => Array.from({ length: n }, () => hex[rand(16)]).join('');
  return `${seg(8)}-${seg(4)}-${seg(4)}-${seg(4)}-${seg(12)}`;
}

function makeNumber(): string {
  const decimals = randInt(0, 2);
  return (Math.random() * Math.pow(10, randInt(1, 6))).toFixed(decimals);
}

function generate(mode: Mode, count: number, paragraphs: number): string {
  if (mode === 'lorem' || mode === 'words') {
    const paras = Math.max(1, Math.min(paragraphs, 20));
    return Array.from({ length: paras }, () => makeParagraph(mode === 'lorem')).join('\n\n');
  }
  const makers: Record<Mode, () => string> = {
    lorem: makeLoremSentence,
    words: makeSentence,
    names: () => `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    emails: makeEmail,
    phones: makePhone,
    addresses: makeAddress,
    dates: makeDate,
    uuids: makeUuid,
    numbers: makeNumber,
  };
  const n = Math.max(1, Math.min(count, 1000));
  return Array.from({ length: n }, () => makers[mode]()).join('\n');
}

export default function DummyTextPage() {
  const [mode, setMode] = useState<Mode>('lorem');
  const [count, setCount] = useState(5);
  const [paragraphs, setParagraphs] = useState(3);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => generate(mode, count, paragraphs), [mode, count, paragraphs]);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [output]);

  const download = useCallback(() => {
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quikdrop-${mode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, mode]);

  return (
    <PageLayout title="Lorem / Dummy Generator" description="Generate placeholder text and dummy data — fully in your browser, nothing is uploaded.">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button key={m.value} onClick={() => setMode(m.value)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${mode === m.value ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'}`}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-neutral-700">{mode === 'lorem' || mode === 'words' ? 'Words per paragraph' : 'Entries'}</label>
            <input type="number" value={count} onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value))))} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
          </div>
          {(mode === 'lorem' || mode === 'words') && (
            <div>
              <label className="text-sm font-medium text-neutral-700">Paragraphs</label>
              <input type="number" value={paragraphs} onChange={(e) => setParagraphs(Math.max(1, Math.min(20, Number(e.target.value))))} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
          <textarea readOnly value={output} rows={10} className="w-full resize-y rounded-xl bg-neutral-50 p-3 text-sm leading-relaxed text-neutral-700 outline-none" />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button onClick={copy} className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={download} className="rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
              Download .txt
            </button>
            <span className="ml-auto text-xs text-neutral-400">{output.length.toLocaleString()} chars</span>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}