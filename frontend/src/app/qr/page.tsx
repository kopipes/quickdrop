'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { PageLayout } from '@/components/ToolShell';

type QRType = 'url' | 'text' | 'email' | 'phone' | 'whatsapp' | 'wifi';

const TYPES: { value: QRType; label: string }[] = [
  { value: 'url', label: 'URL' },
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'wifi', label: 'Wi-Fi' },
];

const SIZES = [
  { value: 512, label: '512px' },
  { value: 1024, label: '1024px' },
  { value: 2048, label: '2048px' },
];

interface Fields {
  url: string;
  text: string;
  email: string;
  subject: string;
  phone: string;
  whatsapp: string;
  wifiName: string;
  wifiPass: string;
  wifiSec: string;
}

export default function QRPage() {
  const [type, setType] = useState<QRType>('url');
  const [fields, setFields] = useState<Fields>({
    url: 'https://example.com',
    text: '',
    email: '',
    subject: '',
    phone: '',
    whatsapp: '',
    wifiName: '',
    wifiPass: '',
    wifiSec: 'WPA',
  });
  const [size, setSize] = useState(512);
  const [fg, setFg] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [svgDataUrl, setSvgDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [copied, setCopied] = useState(false);

  const content = useMemo(() => {
    switch (type) {
      case 'url':
        return fields.url.trim();
      case 'text':
        return fields.text.trim();
      case 'email':
        return fields.email.trim() ? `mailto:${fields.email.trim()}${fields.subject.trim() ? `?subject=${encodeURIComponent(fields.subject.trim())}` : ''}` : '';
      case 'phone':
        return fields.phone.trim() ? `tel:${fields.phone.trim()}` : '';
      case 'whatsapp': {
        const num = fields.whatsapp.trim().replace(/\D/g, '');
        return num ? `https://wa.me/${num}` : '';
      }
      case 'wifi':
        return fields.wifiName.trim()
          ? `WIFI:T:${fields.wifiSec};S:${fields.wifiName.trim()};P:${fields.wifiPass};;`
          : '';
      default:
        return '';
    }
  }, [type, fields]);

  useEffect(() => {
    if (!content) {
      setSvgDataUrl('');
      return;
    }
    QRCode.toDataURL(content, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: fg, light: bg },
    }).then((url) => setSvgDataUrl(url));
  }, [content, size, fg, bg]);

  useEffect(() => {
    if (canvasRef.current && content) {
      QRCode.toCanvas(canvasRef.current, content, {
        width: size,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: fg, light: bg },
      });
    }
  }, [content, size, fg, bg]);

  const downloadPNG = () => {
    if (!svgDataUrl) return;
    const a = document.createElement('a');
    a.href = svgDataUrl;
    a.download = 'quikdrop-qr.png';
    a.click();
  };

  const downloadSVG = () => {
    if (!content) return;
    const svg = QRCode.toString(content, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: fg, light: bg } });
    svg.then((str) => {
      const blob = new Blob([str], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quikdrop-qr.svg';
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const copy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const setField = (key: keyof Fields, value: string) => setFields((f) => ({ ...f, [key]: value }));

  const setSvgColor = (color: string, dark: boolean) => {
    (dark ? setFg : setBg)(color);
  };

  return (
    <PageLayout title="QR Generator" description="Create QR codes instantly — no uploads, processed entirely in your browser.">
      <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Type</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button key={t.value} onClick={() => setType(t.value)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${type === t.value ? 'border-primary/40 bg-primary/5 text-primary' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'}`}>{t.label}</button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {type === 'url' && (
              <Field label="URL" value={fields.url} onChange={(v) => setField('url', v)} placeholder="https://example.com" />
            )}
            {type === 'text' && (
              <Field label="Text" value={fields.text} onChange={(v) => setField('text', v)} placeholder="Enter text" textarea />
            )}
            {type === 'email' && (
              <>
                <Field label="Email" value={fields.email} onChange={(v) => setField('email', v)} placeholder="name@example.com" />
                <Field label="Subject (optional)" value={fields.subject} onChange={(v) => setField('subject', v)} placeholder="Subject line" />
              </>
            )}
            {type === 'phone' && (
              <Field label="Phone Number" value={fields.phone} onChange={(v) => setField('phone', v)} placeholder="+1 555 123 4567" />
            )}
            {type === 'whatsapp' && (
              <Field label="WhatsApp Number" value={fields.whatsapp} onChange={(v) => setField('whatsapp', v)} placeholder="+1 555 123 4567" />
            )}
            {type === 'wifi' && (
              <>
                <Field label="Network (SSID)" value={fields.wifiName} onChange={(v) => setField('wifiName', v)} placeholder="Network name" />
                <Field label="Password" value={fields.wifiPass} onChange={(v) => setField('wifiPass', v)} placeholder="Password" />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Security</label>
                  <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
                    {['WPA', 'WEP', 'nopass'].map((s) => (
                      <button key={s} onClick={() => setField('wifiSec', s)} className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${fields.wifiSec === s ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>{s === 'nopass' ? 'None' : s}</button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Size</label>
              <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
                {SIZES.map((s) => (
                  <button key={s.value} onClick={() => setSize(s.value)} className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${size === s.value ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>{s.label}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Error Correction</label>
              <div className="flex h-9 items-center justify-center rounded-xl bg-neutral-100 text-xs font-medium text-neutral-500">Automatic</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Foreground</label>
              <div className="flex items-center gap-2">
                <input type="color" value={fg} onChange={(e) => setSvgColor(e.target.value, true)} className="h-9 w-12 cursor-pointer rounded-lg border border-neutral-200" />
                <span className="text-xs text-neutral-500">{fg}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Background</label>
              <div className="flex items-center gap-2">
                <input type="color" value={bg} onChange={(e) => setSvgColor(e.target.value, false)} className="h-9 w-12 cursor-pointer rounded-lg border border-neutral-200" />
                <span className="text-xs text-neutral-500">{bg}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
            {svgDataUrl ? (
              <img src={svgDataUrl} alt="QR code preview" style={{ width: size > 1024 ? 256 : 240, height: size > 1024 ? 256 : 240 }} className="h-56 w-56" />
            ) : (
              <div className="flex h-56 w-56 items-center justify-center text-sm text-neutral-400">Enter details to generate</div>
            )}
          </div>
          <div className="grid w-full max-w-xs grid-cols-3 gap-2">
            <button onClick={downloadPNG} disabled={!svgDataUrl} className="rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-40">PNG</button>
            <button onClick={downloadSVG} disabled={!content} className="rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-40">SVG</button>
            <button onClick={copy} disabled={!content} className="rounded-xl bg-neutral-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-40">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <p className="text-xs text-neutral-400">Your QR code is generated entirely in your browser. Nothing is uploaded.</p>
        </div>
      </div>
    </PageLayout>
  );
}

function Field({ label, value, onChange, placeholder, textarea }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean }) {
  const cls = "mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20";
  return (
    <div>
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className={`${cls} resize-none`} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}