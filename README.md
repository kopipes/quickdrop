# QuikDrop

**Fast office file utilities in one place.** Choose → Drop → Process → Download → Gone.

A privacy-conscious web app for everyday file tasks: compress PDFs, shrink presentations, merge/split PDFs, add watermarks, and generate QR codes. No account. No permanent storage. Files are processed temporarily and automatically deleted (within 30 minutes).

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS v4 |
| Backend | Python + FastAPI |
| Database | SQLite (WAL) — job metadata only, no file blobs |
| PDF engine | PyMuPDF, pypdf |
| Presentation engine | python-pptx + Pillow (LibreOffice headless for PPTX→PDF/Images) |
| QR | client-side only (browser) |

## Project Structure

```
backend/
  app/
    db/          # SQLite schema & access
    engines/     # PDF / presentation / watermark processing
    jobs/        # SQLite-backed job queue + worker
    routes/      # upload, status, download, health APIs
    services/    # temp storage + cleanup loop
    main.py      # FastAPI entrypoint
frontend/
  src/app/       # pages (each tool has its own route)
  src/components # shared UI (DropZone, ResultCard, ToolShell…)
  src/lib/       # API client, tools registry, hooks
scripts/
  install.sh     # one-time setup
  dev.sh         # start backend + frontend
```

## Quick Start

```bash
./scripts/install.sh
./scripts/dev.sh
```

- Frontend: http://localhost:3000
- API: http://localhost:8000/api
- Health: http://localhost:8000/api/health
- Internal stats dashboard: http://localhost:8000/api/stats

## Tools (MVP)

**PDF** — Compress, Merge, Split, Remove Pages, Rotate, Reorder, Image → PDF, PDF → Images
**Presentation** — Shrink Presentation (hero), PPT → PDF, PPT → Images
**Watermark** — PDF + PowerPoint (text or image, position/opacity/size/rotation)
**Quick** — QR Generator (fully client-side, PNG/SVG)

## Notes

- PPTX → PDF / PPTX → Images require LibreOffice (`soffice`) on the server. Everything else runs without external binaries.
- Files are untrusted: MIME/extension validation, randomized temp names, no macro support (`.pptx` only).
- Limits: PDF 100 MB / 300 pages, PPTX 150 MB / 200 slides, images 30 MB each, 2 active jobs per IP.
- No file content is stored in SQLite — only job metadata and anonymous usage stats.
