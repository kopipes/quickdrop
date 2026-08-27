'use client';

import ToolShell from '@/components/ToolShell';
import { MAX_PPTX } from '@/lib/tools';

export default function PPTXToPDFPage() {
  return (
    <ToolShell
      tool="pptx_to_pdf" title="PPT → PDF" description="Convert your PowerPoint presentation to PDF in one click."
      accept=".pptx" maxSize={MAX_PPTX}
      resultTitle="Conversion complete" processLabel="Convert to PDF"
    />
  );
}