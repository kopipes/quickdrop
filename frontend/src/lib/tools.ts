export interface ToolDef {
  id: string;
  path: string;
  name: string;
  description: string;
  category: string;
  keywords: string[];
  accept: string;
  multiple?: boolean;
  maxSize: number;
}

export const MAX_PDF = 100 * 1024 * 1024;
export const MAX_PPTX = 150 * 1024 * 1024;
export const MAX_IMAGE = 30 * 1024 * 1024;

export const TOOLS: ToolDef[] = [
  { id: 'make_it_smaller', path: '/make-smaller', name: 'Make It Smaller', description: 'Tell us the target size — we optimize your PDF, PPTX, or image automatically.', category: 'Make It Smaller', keywords: ['smaller', 'compress', 'shrink', 'reduce', 'optimize', 'email', 'whatsapp', 'size', 'pdf', 'pptx', 'image'], accept: '.pdf,.pptx,.jpg,.jpeg,.png,.webp', maxSize: MAX_PPTX },
  { id: 'compress_pdf', path: '/pdf/compress', name: 'Compress PDF', description: 'Reduce PDF file size without the hassle.', category: 'PDF', keywords: ['compress', 'shrink', 'reduce', 'pdf', 'smaller', 'size'], accept: '.pdf', maxSize: MAX_PDF },
  { id: 'merge_pdf', path: '/pdf/merge', name: 'Merge PDF', description: 'Combine multiple PDFs into one document.', category: 'PDF', keywords: ['merge', 'combine', 'join', 'pdf', 'unite'], accept: '.pdf', multiple: true, maxSize: MAX_PDF },
  { id: 'split_pdf', path: '/pdf/split', name: 'Split PDF', description: 'Extract page ranges or split every page.', category: 'PDF', keywords: ['split', 'extract', 'separate', 'pdf', 'pages'], accept: '.pdf', maxSize: MAX_PDF },
  { id: 'remove_pdf_pages', path: '/pdf/remove-pages', name: 'Remove Pages', description: 'Delete unwanted pages from your PDF.', category: 'PDF', keywords: ['remove', 'delete', 'pages', 'pdf'], accept: '.pdf', maxSize: MAX_PDF },
  { id: 'rotate_pdf', path: '/pdf/rotate', name: 'Rotate PDF', description: 'Rotate pages to fix orientation.', category: 'PDF', keywords: ['rotate', 'turn', 'orientation', 'pdf'], accept: '.pdf', maxSize: MAX_PDF },
  { id: 'image_to_pdf', path: '/pdf/image-to-pdf', name: 'Image → PDF', description: 'Turn your images into a single PDF.', category: 'PDF', keywords: ['image', 'jpg', 'png', 'convert', 'pdf'], accept: '.jpg,.jpeg,.png,.webp', multiple: true, maxSize: MAX_IMAGE },
  { id: 'pdf_to_images', path: '/pdf/pdf-to-images', name: 'PDF → Images', description: 'Export PDF pages as JPG or PNG.', category: 'PDF', keywords: ['pdf', 'image', 'convert', 'export', 'jpg', 'png'], accept: '.pdf', maxSize: MAX_PDF },
  { id: 'reorder_pdf', path: '/pdf/reorder', name: 'Reorder PDF', description: 'Rearrange PDF pages by dragging.', category: 'PDF', keywords: ['reorder', 'arrange', 'sort', 'pages', 'pdf'], accept: '.pdf', maxSize: MAX_PDF },
  { id: 'shrink_presentation', path: '/presentation/shrink', name: 'Shrink Presentation', description: 'Make your PPTX email-friendly fast.', category: 'Presentation', keywords: ['shrink', 'compress', 'reduce', 'pptx', 'powerpoint', 'slides'], accept: '.pptx', maxSize: MAX_PPTX },
  { id: 'pptx_to_pdf', path: '/presentation/to-pdf', name: 'PPT → PDF', description: 'Convert PowerPoint to PDF in one click.', category: 'Presentation', keywords: ['pptx', 'powerpoint', 'convert', 'pdf', 'slides'], accept: '.pptx', maxSize: MAX_PPTX },
  { id: 'pptx_to_images', path: '/presentation/to-images', name: 'PPT → Images', description: 'Export slides as JPG or PNG images.', category: 'Presentation', keywords: ['pptx', 'powerpoint', 'convert', 'image', 'slides', 'export'], accept: '.pptx', maxSize: MAX_PPTX },
  { id: 'watermark_pdf', path: '/watermark/pdf', name: 'Watermark PDF', description: 'Add a text or image watermark to PDF.', category: 'Watermark', keywords: ['watermark', 'pdf', 'draft', 'confidential', 'stamp'], accept: '.pdf', maxSize: MAX_PDF },
  { id: 'watermark_presentation', path: '/watermark/presentation', name: 'Watermark Presentation', description: 'Add a watermark to every slide.', category: 'Watermark', keywords: ['watermark', 'pptx', 'powerpoint', 'draft', 'confidential'], accept: '.pptx', maxSize: MAX_PPTX },
  { id: 'resize_image', path: '/image/resize', name: 'Resize Image', description: 'Resize, scale, or convert your images.', category: 'Image', keywords: ['resize', 'scale', 'image', 'photo', 'convert', 'jpg', 'png', 'webp'], accept: '.jpg,.jpeg,.png,.webp', multiple: true, maxSize: MAX_IMAGE },
  { id: 'remove_background', path: '/image/remove-bg', name: 'Remove Background', description: 'Erase the background from any image with AI — in your browser.', category: 'Image', keywords: ['remove', 'background', 'erase', 'ai', 'image', 'photo', 'transparent', 'cutout'], accept: '.jpg,.jpeg,.png,.webp', maxSize: MAX_IMAGE },
  { id: 'contact_sheet', path: '/image/contact-sheet', name: 'Contact Sheet', description: 'Arrange many images into a printable PDF grid.', category: 'Image', keywords: ['contact', 'sheet', 'grid', 'proof', 'photos', 'thumbnails', 'layout', 'pdf'], accept: '.jpg,.jpeg,.png,.webp', multiple: true, maxSize: MAX_IMAGE },
  { id: 'qr_generator', path: '/qr', name: 'QR Generator', description: 'Create QR codes from URLs and text.', category: 'Quick', keywords: ['qr', 'code', 'generate', 'url', 'barcode'], accept: '', maxSize: 0 },
  { id: 'dummy_text', path: '/dummy-text', name: 'Lorem / Dummy Generator', description: 'Generate placeholder text, names, emails, and dummy data.', category: 'Quick', keywords: ['lorem', 'ipsum', 'dummy', 'placeholder', 'text', 'fake', 'data', 'random', 'names', 'emails'], accept: '', maxSize: 0 },
];

export const CATEGORY_ORDER = ['Make It Smaller', 'PDF', 'Presentation', 'Watermark', 'Image', 'Quick'];

export function getTool(id: string): ToolDef | undefined {
  return TOOLS.find((t) => t.id === id);
}

export function getToolByPath(path: string): ToolDef | undefined {
  return TOOLS.find((t) => t.path === path);
}

export function searchTools(query: string): ToolDef[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const words = q.split(/\s+/).filter(Boolean);
  return TOOLS.filter((t) => {
    const haystack = `${t.name} ${t.description} ${t.keywords.join(' ')}`.toLowerCase();
    return words.every((w) => haystack.includes(w));
  });
}