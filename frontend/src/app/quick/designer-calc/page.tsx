'use client';

import { useCallback, useMemo, useState } from 'react';
import { PageLayout } from '@/components/ToolShell';

// ─── helpers ──────────────────────────────────────────────────────────────────
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const fmt = (n: number, dec = 2) => parseFloat(n.toFixed(dec)).toLocaleString();
const num = (v: string) => parseFloat(v) || 0;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 space-y-4">
      <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value, unit, mono = true }: { label: string; value: string; unit?: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-neutral-500 shrink-0">{label}</span>
      <span className={`text-sm font-medium text-neutral-900 ${mono ? 'font-mono' : ''}`}>{value}{unit ? <span className="text-neutral-400 ml-1 font-sans">{unit}</span> : null}</span>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, unit, type = 'number' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; unit?: string; type?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-neutral-600">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-mono outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        />
        {unit && <span className="text-xs text-neutral-400 shrink-0 w-10">{unit}</span>}
      </div>
    </div>
  );
}

function Seg({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} className={`flex-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${value === o ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>{o}</button>
      ))}
    </div>
  );
}

// ─── TAB 1: Aspect Ratio ──────────────────────────────────────────────────────
function AspectRatioCalc() {
  const [w, setW] = useState('1920');
  const [h, setH] = useState('1080');
  const [lockW, setLockW] = useState('1440');
  const [lockH, setLockH] = useState('');
  const [mode, setMode] = useState<'lock-w' | 'lock-h'>('lock-w');

  const ratio = useMemo(() => {
    const wn = num(w); const hn = num(h);
    if (!wn || !hn) return '';
    const d = gcd(Math.round(wn), Math.round(hn));
    return `${Math.round(wn / d)}:${Math.round(hn / d)}`;
  }, [w, h]);

  const derived = useMemo(() => {
    const wn = num(w); const hn = num(h);
    if (!wn || !hn) return null;
    if (mode === 'lock-w') {
      const lw = num(lockW);
      if (!lw) return null;
      return { result: (lw * hn / wn).toFixed(0), label: 'height' };
    } else {
      const lh = num(lockH);
      if (!lh) return null;
      return { result: (lh * wn / hn).toFixed(0), label: 'width' };
    }
  }, [w, h, lockW, lockH, mode]);

  const PRESETS = [
    ['1920', '1080'], ['1280', '720'], ['3840', '2160'],
    ['1080', '1080'], ['1080', '1920'], ['2560', '1440'],
    ['800', '600'], ['1024', '768'],
  ];

  return (
    <div className="space-y-4">
      <Section title="Reference Dimensions">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(([pw, ph]) => (
            <button key={`${pw}x${ph}`} onClick={() => { setW(pw); setH(ph); }} className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:border-primary/40 hover:text-primary transition-colors">{pw}×{ph}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Width" value={w} onChange={setW} placeholder="1920" unit="px" />
          <Input label="Height" value={h} onChange={setH} placeholder="1080" unit="px" />
        </div>
        {ratio && <div className="flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3"><span className="text-sm text-neutral-600">Aspect ratio</span><span className="font-mono text-xl font-bold text-primary">{ratio}</span></div>}
      </Section>
      <Section title="Scale to New Dimension">
        <Seg options={['lock-w', 'lock-h']} value={mode} onChange={v => setMode(v as 'lock-w' | 'lock-h')} />
        {mode === 'lock-w' ? (
          <Input label="Enter width" value={lockW} onChange={setLockW} placeholder="1440" unit="px" />
        ) : (
          <Input label="Enter height" value={lockH} onChange={setLockH} placeholder="810" unit="px" />
        )}
        {derived && (
          <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3">
            <span className="text-sm text-neutral-600 capitalize">Calculated {derived.label}</span>
            <span className="font-mono text-xl font-bold text-neutral-900">{derived.result} px</span>
          </div>
        )}
      </Section>
    </div>
  );
}

// ─── TAB 2: Unit Converter ────────────────────────────────────────────────────
const DPI_PRESETS = ['72', '96', '150', '300', '600'];

function UnitConverter() {
  const [dpi, setDpi] = useState('96');
  const [customDpi, setCustomDpi] = useState('');
  const [px, setPx] = useState('100');

  const d = num(customDpi) || num(dpi);
  const pxn = num(px);
  const mm = pxn / (d / 25.4);
  const cm = mm / 10;
  const inch = pxn / d;
  const pt = inch * 72;

  const fromMm = (v: string) => {
    const n = num(v);
    setPx(String(Math.round(n * (d / 25.4))));
  };
  const fromCm = (v: string) => {
    const n = num(v);
    setPx(String(Math.round(n * 10 * (d / 25.4))));
  };
  const fromInch = (v: string) => {
    const n = num(v);
    setPx(String(Math.round(n * d)));
  };

  return (
    <div className="space-y-4">
      <Section title="DPI / Resolution">
        <Seg options={DPI_PRESETS} value={DPI_PRESETS.includes(dpi) ? dpi : 'custom'} onChange={v => { if (v !== 'custom') { setDpi(v); setCustomDpi(''); } }} />
        <Input label="Custom DPI" value={customDpi} onChange={v => { setCustomDpi(v); }} placeholder="96" unit="dpi" />
      </Section>
      <Section title="Enter Any Value to Convert">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Pixels (px)" value={px} onChange={setPx} placeholder="100" />
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-neutral-600">Millimeters (mm)</label>
              <input type="number" value={fmt(mm, 3)} onChange={e => fromMm(e.target.value)} className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm font-mono outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-neutral-600">Centimeters (cm)</label>
              <input type="number" value={fmt(cm, 3)} onChange={e => fromCm(e.target.value)} className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm font-mono outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-neutral-600">Inches (in)</label>
              <input type="number" value={fmt(inch, 4)} onChange={e => fromInch(e.target.value)} className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm font-mono outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
        </div>
        <Row label="Points (pt)" value={fmt(pt, 2)} />
        <Row label="Picas (pc)" value={fmt(pt / 12, 3)} />
        <Row label="1px equals" value={`${fmt(25.4 / d, 4)} mm / ${fmt(1 / d, 5)} in`} mono={false} />
      </Section>
    </div>
  );
}

// ─── TAB 3: Paper Size Calculator ────────────────────────────────────────────
const PAPER_SIZES: Record<string, [number, number]> = {
  'A3': [297, 420], 'A4': [210, 297], 'A5': [148, 210], 'A6': [105, 148],
  'Letter': [215.9, 279.4], 'Legal': [215.9, 355.6], 'Tabloid': [279.4, 431.8],
  'Business Card': [85, 55], 'Postcard': [148, 100],
  '4R (4×6in)': [101.6, 152.4], '5R (5×7in)': [127, 177.8],
  'Facebook Cover': [820, 312], 'Instagram Post': [1080, 1080],
  'Twitter Header': [1500, 500],
};

function PaperCalc() {
  const [size, setSize] = useState('A4');
  const [dpi, setDpi] = useState('300');
  const [orient, setOrient] = useState('portrait');

  let [wMm, hMm] = PAPER_SIZES[size] || [210, 297];
  if (orient === 'landscape' && wMm < hMm) [wMm, hMm] = [hMm, wMm];

  const d = num(dpi);
  const wIn = wMm / 25.4;
  const hIn = hMm / 25.4;
  const wPx = Math.round(wIn * d);
  const hPx = Math.round(hIn * d);
  const megapx = (wPx * hPx / 1_000_000).toFixed(1);

  return (
    <div className="space-y-4">
      <Section title="Paper Size">
        <div className="flex flex-wrap gap-2">
          {Object.keys(PAPER_SIZES).map(s => (
            <button key={s} onClick={() => setSize(s)} className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${size === s ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}>{s}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-600">DPI</label>
            <Seg options={['72', '96', '150', '300']} value={['72','96','150','300'].includes(dpi) ? dpi : '300'} onChange={setDpi} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-600">Orientation</label>
            <Seg options={['portrait', 'landscape']} value={orient} onChange={setOrient} />
          </div>
        </div>
      </Section>
      <Section title={`${size} at ${dpi} DPI`}>
        <Row label="Size (mm)" value={`${wMm} × ${hMm}`} unit="mm" />
        <Row label="Size (inches)" value={`${fmt(wIn, 2)} × ${fmt(hIn, 2)}`} unit="in" />
        <Row label="Size (pixels)" value={`${wPx.toLocaleString()} × ${hPx.toLocaleString()}`} unit="px" />
        <Row label="Megapixels" value={megapx} unit="MP" />
        <Row label="Total pixels" value={(wPx * hPx).toLocaleString()} />
      </Section>
    </div>
  );
}

// ─── TAB 4: Scale Calculator ──────────────────────────────────────────────────
function ScaleCalc() {
  const [actual, setActual] = useState('4000');
  const [scaleStr, setScaleStr] = useState('1:10');
  const [unit, setUnit] = useState('mm');
  const [mode, setMode] = useState<'actual-to-art' | 'art-to-actual'>('actual-to-art');

  const scaleFactor = useMemo(() => {
    const parts = scaleStr.split(':');
    if (parts.length === 2) {
      const [a, b] = parts.map(s => parseFloat(s.trim()));
      return a / b;
    }
    return 1;
  }, [scaleStr]);

  const artwork = useMemo(() => {
    const a = num(actual);
    if (!a || !scaleFactor) return '';
    return fmt(a * scaleFactor, 2);
  }, [actual, scaleFactor]);

  const actualFromArt = useMemo(() => {
    const a = num(actual);
    if (!a || !scaleFactor) return '';
    return fmt(a / scaleFactor, 2);
  }, [actual, scaleFactor]);

  const COMMON_SCALES = ['1:1', '1:2', '1:5', '1:10', '1:20', '1:50', '1:100', '1:200', '1:500', '1:1000', '2:1', '5:1'];

  return (
    <div className="space-y-4">
      <Section title="Scale Calculator">
        <div className="flex flex-wrap gap-2">
          {COMMON_SCALES.map(s => (
            <button key={s} onClick={() => setScaleStr(s)} className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${scaleStr === s ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}>{s}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Scale Ratio" value={scaleStr} onChange={setScaleStr} placeholder="1:10" type="text" />
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-600">Unit</label>
            <Seg options={['mm', 'cm', 'm', 'in', 'ft', 'px']} value={unit} onChange={setUnit} />
          </div>
        </div>
        <Seg options={['actual-to-art', 'art-to-actual']} value={mode} onChange={v => setMode(v as 'actual-to-art' | 'art-to-actual')} />
        {mode === 'actual-to-art' ? (
          <>
            <Input label="Actual Size" value={actual} onChange={setActual} placeholder="4000" unit={unit} />
            {artwork && (
              <div className="flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
                <span className="text-sm text-neutral-600">Artwork size</span>
                <span className="font-mono text-xl font-bold text-primary">{artwork} {unit}</span>
              </div>
            )}
          </>
        ) : (
          <>
            <Input label="Artwork Size" value={actual} onChange={setActual} placeholder="400" unit={unit} />
            {actualFromArt && (
              <div className="flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
                <span className="text-sm text-neutral-600">Actual size</span>
                <span className="font-mono text-xl font-bold text-primary">{actualFromArt} {unit}</span>
              </div>
            )}
          </>
        )}
        {scaleFactor > 0 && <Row label="1 unit in artwork = " value={`${fmt(1 / scaleFactor, 3)} ${unit} actual`} mono={false} />}
      </Section>
    </div>
  );
}

// ─── TAB 5: File Size Estimator ───────────────────────────────────────────────
const FORMAT_PRESETS: Record<string, { bpp: number; label: string; compressed?: number }> = {
  'RAW / TIFF (24-bit)': { bpp: 24, label: 'Uncompressed' },
  'RAW / TIFF (48-bit)': { bpp: 48, label: 'Uncompressed 16-bit' },
  'PNG (24-bit)': { bpp: 24, label: 'Lossless ~50% compress', compressed: 0.5 },
  'PNG (32-bit RGBA)': { bpp: 32, label: 'With alpha ~50%', compressed: 0.5 },
  'JPEG Low (q60)': { bpp: 24, label: 'Lossy', compressed: 0.08 },
  'JPEG Med (q80)': { bpp: 24, label: 'Lossy', compressed: 0.12 },
  'JPEG High (q95)': { bpp: 24, label: 'Lossy', compressed: 0.22 },
  'WebP Lossy': { bpp: 24, label: 'Lossy', compressed: 0.07 },
  'WebP Lossless': { bpp: 24, label: 'Lossless', compressed: 0.35 },
  'GIF (8-bit)': { bpp: 8, label: '256 colors', compressed: 0.4 },
};

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function FileSizeCalc() {
  const [w, setW] = useState('3840');
  const [h, setH] = useState('2160');
  const [fmt2, setFmt2] = useState('JPEG Med (q80)');

  const preset = FORMAT_PRESETS[fmt2];
  const pixels = num(w) * num(h);
  const rawBytes = pixels * preset.bpp / 8;
  const finalBytes = preset.compressed ? rawBytes * preset.compressed : rawBytes;

  const SIZE_PRESETS = [
    ['1920', '1080', 'FHD'], ['3840', '2160', '4K'], ['7680', '4320', '8K'],
    ['1080', '1080', 'IG sq'], ['1080', '1920', 'IG story'], ['2480', '3508', 'A4 300dpi'],
  ];

  return (
    <div className="space-y-4">
      <Section title="Image Dimensions">
        <div className="flex flex-wrap gap-2">
          {SIZE_PRESETS.map(([pw, ph, label]) => (
            <button key={label} onClick={() => { setW(pw); setH(ph); }} className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:border-primary/40 hover:text-primary transition-colors">{label} ({pw}×{ph})</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Width" value={w} onChange={setW} placeholder="3840" unit="px" />
          <Input label="Height" value={h} onChange={setH} placeholder="2160" unit="px" />
        </div>
      </Section>
      <Section title="Format">
        <div className="flex flex-wrap gap-2">
          {Object.keys(FORMAT_PRESETS).map(f => (
            <button key={f} onClick={() => setFmt2(f)} className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${fmt2 === f ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}>{f}</button>
          ))}
        </div>
      </Section>
      <Section title="Estimated File Size">
        <Row label="Total pixels" value={pixels.toLocaleString()} />
        <Row label="Megapixels" value={`${(pixels / 1_000_000).toFixed(1)} MP`} />
        <Row label="Bit depth" value={`${preset.bpp} bpp`} />
        <Row label="Raw uncompressed" value={fmtSize(rawBytes)} />
        <div className="flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
          <span className="text-sm text-neutral-600">Estimated {fmt2}</span>
          <span className="font-mono text-xl font-bold text-primary">{fmtSize(finalBytes)}</span>
        </div>
        <p className="text-xs text-neutral-400">File size is an estimate. Actual size varies with image content.</p>
      </Section>
    </div>
  );
}

// ─── TAB 6: Typography Scale ──────────────────────────────────────────────────
const TYPE_SCALES: Record<string, number> = {
  'Minor Second (1.067)': 1.067,
  'Major Second (1.125)': 1.125,
  'Minor Third (1.200)': 1.200,
  'Major Third (1.250)': 1.250,
  'Perfect Fourth (1.333)': 1.333,
  'Augmented Fourth (1.414)': 1.414,
  'Perfect Fifth (1.500)': 1.500,
  'Golden Ratio (1.618)': 1.618,
};

const STEP_LABELS = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];

function TypographyScale() {
  const [base, setBase] = useState('16');
  const [scale, setScale] = useState('Perfect Fourth (1.333)');
  const [unit, setUnit] = useState('px');

  const ratio = TYPE_SCALES[scale] || 1.333;
  const baseNum = num(base);

  const sizes = useMemo(() => {
    return STEP_LABELS.map((label, i) => {
      const offset = i - 2; // base is at index 2 (xs, sm, BASE, lg, ...)
      const px = baseNum * Math.pow(ratio, offset);
      const rem = px / baseNum;
      const pt = px * 0.75;
      return { label, px, rem, pt };
    });
  }, [baseNum, ratio]);

  return (
    <div className="space-y-4">
      <Section title="Settings">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Base font size" value={base} onChange={setBase} placeholder="16" unit="px" />
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-600">Unit</label>
            <Seg options={['px', 'rem', 'pt']} value={unit} onChange={setUnit} />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-600">Scale</label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(TYPE_SCALES).map(s => (
              <button key={s} onClick={() => setScale(s)} className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${scale === s ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}>{s}</button>
            ))}
          </div>
        </div>
      </Section>
      <Section title="Type Scale">
        <div className="space-y-2">
          {sizes.map(({ label, px, rem, pt }) => {
            const displayVal = unit === 'px' ? fmt(px, 2) + ' px' : unit === 'rem' ? fmt(rem, 4) + ' rem' : fmt(pt, 2) + ' pt';
            const isBase = label === 'base';
            return (
              <div key={label} className={`flex items-baseline gap-4 rounded-xl px-3 py-2 ${isBase ? 'bg-primary/5 border border-primary/20' : 'hover:bg-neutral-50'}`}>
                <span className="w-10 text-xs font-medium text-neutral-400 shrink-0">{label}</span>
                <span className="font-mono text-xs text-neutral-500 w-24 shrink-0">{displayVal}</span>
                <span className="text-neutral-800 truncate" style={{ fontSize: `${Math.min(px, 48)}px`, lineHeight: 1.2 }}>The quick fox</span>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'aspect', label: 'Aspect Ratio', component: AspectRatioCalc },
  { id: 'units', label: 'Unit Converter', component: UnitConverter },
  { id: 'paper', label: 'Paper Sizes', component: PaperCalc },
  { id: 'scale', label: 'Scale', component: ScaleCalc },
  { id: 'filesize', label: 'File Size', component: FileSizeCalc },
  { id: 'type', label: 'Typography', component: TypographyScale },
];

export default function DesignerCalcPage() {
  const [tab, setTab] = useState('aspect');
  const ActiveTab = TABS.find(t => t.id === tab)?.component ?? AspectRatioCalc;

  return (
    <PageLayout title="Designer Calculator" description="Aspect ratio, unit conversion, paper sizes, scale, file size, and typography — all in one place.">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex flex-wrap gap-2">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${tab === t.id ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <ActiveTab />
      </div>
    </PageLayout>
  );
}