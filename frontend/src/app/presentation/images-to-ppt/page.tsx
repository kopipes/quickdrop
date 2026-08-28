'use client';

import ToolShell from '@/components/ToolShell';
import { MAX_IMAGE } from '@/lib/tools';

export default function ImagesToPPTXPage() {
  return (
    <ToolShell
      tool="images_to_pptx" title="Images → PPT" description="Turn your images into a PowerPoint presentation — one slide per image."
      accept=".jpg,.jpeg,.png,.webp" multiple maxSize={MAX_IMAGE} maxFiles={200}
      reorderable
      resultTitle="Presentation created" processLabel="Create Presentation"
    />
  );
}