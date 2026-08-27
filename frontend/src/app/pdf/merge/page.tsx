'use client';

import ToolShell from '@/components/ToolShell';
import { MAX_PDF } from '@/lib/tools';

export default function MergePDFPage() {
  return (
    <ToolShell
      tool="merge_pdf" title="Merge PDF" description="Combine multiple PDFs into one document."
      accept=".pdf" multiple maxSize={MAX_PDF} maxFiles={20} reorderable
      resultTitle="PDFs merged successfully" processLabel="Merge PDF"
    />
  );
}