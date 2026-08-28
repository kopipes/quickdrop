'use client';

import { useState } from 'react';
import ToolShell from '@/components/ToolShell';
import { MAX_IMAGE } from '@/lib/tools';

export default function FaviconGeneratorPage() {
  return (
    <ToolShell
      tool="favicon_generator" title="Favicon Generator" description="Upload any image or logo and get a ready-to-use favicon pack — .ico + all PNG sizes in one ZIP."
      accept=".jpg,.jpeg,.png,.webp,.svg" maxSize={MAX_IMAGE}
      resultTitle="Favicon pack ready" processLabel="Generate Favicon"
      settings={
        <div className="rounded-xl border border-neutral-200/80 bg-neutral-50 p-3 text-xs text-neutral-500 space-y-1">
          <p className="font-medium text-neutral-700">What you get in the ZIP:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>favicon.ico (16, 32, 48, 64px)</li>
            <li>favicon-16×16.png</li>
            <li>favicon-32×32.png</li>
            <li>favicon-48×48.png</li>
            <li>favicon-64×64.png</li>
            <li>favicon-128×128.png</li>
            <li>favicon-192×192.png (PWA)</li>
            <li>favicon-512×512.png (PWA)</li>
          </ul>
          <p className="mt-2 text-neutral-400">Non-square images are center-cropped automatically.</p>
        </div>
      }
    />
  );
}