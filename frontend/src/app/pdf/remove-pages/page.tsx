'use client';

import { useState } from 'react';
import ToolShell from '@/components/ToolShell';
import { MAX_PDF } from '@/lib/tools';

export default function RemovePagesPage() {
  const [pages, setPages] = useState('');

  return (
    <ToolShell
      tool="remove_pdf_pages" title="Remove Pages" description="Delete unwanted pages from your PDF."
      accept=".pdf" maxSize={MAX_PDF}
      resultTitle="Pages removed successfully" processLabel="Remove Selected"
      buildOptions={() => ({ pages: pages.split(/[,;.\s]+/).map(Number).filter(Boolean) })}
      settings={
        <div>
          <label className="text-sm font-medium text-neutral-700">Pages to remove</label>
          <input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="e.g. 1, 3, 5-7" className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
          <p className="mt-1 text-xs text-neutral-500">Separate page numbers with commas</p>
        </div>
      }
    />
  );
}