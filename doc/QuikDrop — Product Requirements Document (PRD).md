# QuikDrop
## Product Requirements Document

**Product Type:** Web-based Office File Utility Suite  
**Version:** 1.0 — MVP  
**Product Name:** QuikDrop  
**Core Principle:** **Choose → Drop → Process → Download → Gone**

---

# 1. PRODUCT SUMMARY

QuikDrop adalah webapp kumpulan micro-utilities untuk pekerjaan file yang sering dilakukan sehari-hari tetapi biasanya membutuhkan proses panjang:

- membuka aplikasi tertentu,
- mencari menu,
- membuka website,
- upload file,
- memilih pengaturan,
- process,
- download kembali,
- membersihkan file hasil download.

QuikDrop menggabungkan kebutuhan tersebut ke dalam satu webapp yang:

- sangat cepat dibuka,
- mudah digunakan,
- tidak membutuhkan learning curve,
- tidak membutuhkan account untuk penggunaan dasar,
- tidak menyimpan file user,
- memiliki UI modern dan professional,
- optimized untuk desktop office workflow,
- dan mempunyai workflow sesingkat mungkin.

QuikDrop bukan document management system.

QuikDrop bukan cloud storage.

QuikDrop bukan full PDF/PPT editor.

QuikDrop adalah:

> **Fast office file utilities in one place.**

Core experience:

> **Choose a Tool → Drop a File → Process → Download**

---

# 2. PRODUCT VISION

QuikDrop ingin menjadi website yang secara natural dibuka oleh user setiap kali muncul masalah sederhana seperti:

> “PDF ini terlalu besar.”

> “Gabung PDF ini gimana ya?”

> “Slide ini 80 MB, harus dikirim email.”

> “Kasih watermark DRAFT ke proposal ini.”

> “Saya perlu bikin QR dari link ini.”

User tidak perlu berpikir:

> “Website apa yang saya pakai?”

Mereka cukup membuka:

**QuikDrop.**

---

# 3. PRODUCT POSITIONING

QuikDrop bukan competitor langsung Adobe Acrobat atau PowerPoint.

Positioning QuikDrop adalah:

### Quick Utility Layer

Untuk pekerjaan kecil yang terlalu sederhana untuk membuka aplikasi besar, tetapi cukup merepotkan jika dilakukan manual.

Brand promise:

> **One task. One result. Done.**

Alternative tagline:

> **Drop it. Done.**

atau:

> **Quick tools for everyday files.**

---

# 4. PRODUCT PRINCIPLES

Semua fitur QuikDrop wajib mengikuti prinsip berikut.

## 4.1 Fast

User harus bisa mulai melakukan pekerjaan dalam hitungan detik setelah website dibuka.

Tidak boleh ada:

- intro berlebihan,
- animation panjang,
- onboarding wajib,
- popup newsletter,
- login wall,
- iklan mengganggu workflow.

---

## 4.2 Simple

Satu page mempunyai satu tujuan utama.

Contoh:

**Compress PDF**

Page tersebut hanya fokus pada proses compress PDF.

Bukan menampilkan puluhan opsi lain saat user sedang bekerja.

---

## 4.3 One Job at a Time

QuikDrop tidak dirancang sebagai batch-processing platform.

Normal flow:

```text
Select Tool
↓
Upload
↓
Process
↓
Download
↓
Done
```

Satu user action menghasilkan satu processing job.

Beberapa tools seperti:

- Merge PDF
- Image → PDF

secara nature dapat menerima beberapa source files, tetapi tetap dianggap sebagai **satu processing job**.

---

## 4.4 Temporary by Design

QuikDrop tidak berfungsi sebagai file storage.

Uploaded files dan generated files hanya berada di server selama processing berlangsung dan untuk waktu singkat setelah hasil tersedia.

File tidak masuk ke:

- permanent user library,
- database blob,
- archive,
- backup file repository.

---

## 4.5 Privacy First

User harus mendapatkan pesan yang jelas:

> **Your files are processed temporarily and automatically deleted.**

Tidak ada file user yang digunakan untuk:

- AI training,
- analytics content inspection,
- permanent storage.

---

## 4.6 Professional Design

UI QuikDrop harus terlihat seperti dibuat oleh product designer, bukan seperti kumpulan open-source utility yang ditempel menjadi satu website.

Visual character:

- modern,
- clean,
- refined,
- professional,
- premium,
- minimal,
- subtle personality.

---

# 5. TARGET USERS

## Primary

### Office Workers

Kebutuhan:

- compress file sebelum email,
- merge PDF,
- convert file,
- QR generation,
- watermark.

---

### Creative / Design Teams

Kebutuhan:

- compress presentation,
- export PDF,
- watermark proposal,
- convert PDF to image,
- image-related utilities.

---

### Marketing Teams

Kebutuhan:

- QR generator,
- presentation shrinking,
- converting,
- proposal preparation.

---

### Sales / Business Development

Kebutuhan:

- proposal compression,
- watermark,
- PDF manipulation,
- sharing-friendly files.

---

### Management / Administrative Teams

Kebutuhan:

- PDF manipulation,
- scan/image conversion,
- presentation compression.

---

# 6. MVP TOOL CATEGORIES

Initial QuikDrop terdiri dari empat kategori utama.

```text
QuikDrop

PDF Tools
Presentation Tools
Watermark
Quick Tools
```

---

# 7. PDF TOOLS

## 7.1 Compress PDF

### Objective

Mengurangi ukuran PDF dengan minimum visual degradation.

### Input

`.pdf`

### Options

#### Compression presets

**Maximum Compression**

Prioritas ukuran file terkecil.

**Balanced**

Default.

Balance antara quality dan size.

**Best Quality**

Compression ringan untuk menjaga visual.

---

### Future option

**Target File Size**

Contoh:

```text
Make it under:

[ 2 MB ]
[ 5 MB ]
[ 10 MB ]
[ Custom ]
```

---

### Result Screen

Contoh:

```text
Compression complete

Original
24.8 MB

Compressed
6.3 MB

74% smaller

[ Download PDF ]

Process Another
```

---

# 8. MERGE PDF

Menggabungkan beberapa PDF menjadi satu dokumen.

### Flow

```text
Upload PDF
↓
Add PDF
↓
Reorder
↓
Merge
↓
Download
```

User dapat melakukan drag-and-drop untuk mengubah urutan file.

### Maximum initial files

20 PDFs per merge job.

---

# 9. SPLIT PDF

Memecah satu PDF.

Options:

### Extract Page Range

Example:

```text
Pages:
1-4
```

### Multiple ranges

Future:

```text
1-4
5-10
11-15
```

### Every Page

Menghasilkan ZIP berisi PDF individual.

---

# 10. REMOVE PDF PAGES

User upload PDF.

QuikDrop menampilkan thumbnail pages.

Contoh:

```text
1  2  3  4  5  6

       X        X
```

User memilih pages.

Action:

**Remove Selected**

Result:

new PDF.

---

# 11. ROTATE PDF

PDF ditampilkan sebagai page thumbnails.

User dapat:

- Rotate left
- Rotate right
- Rotate individual page
- Rotate all pages

Rotation:

- 90°
- 180°
- 270°

---

# 12. IMAGE → PDF

Supported initial formats:

- JPG
- JPEG
- PNG
- WebP

User dapat memilih beberapa images untuk membentuk satu PDF.

Options:

### Page Size

- Auto
- A4
- Letter

### Orientation

- Auto
- Portrait
- Landscape

### Margin

- None
- Small
- Normal

---

# 13. PDF → IMAGES

Input:

PDF

Output options:

- JPG
- PNG

Resolution presets:

- Standard
- High
- Print

Result:

Jika PDF memiliki banyak pages:

```text
Download All as ZIP
```

atau download individual pages.

---

# 14. REORDER PDF PAGES

Target: optional MVP / early V1.x.

Upload PDF.

Pages ditampilkan sebagai thumbnail cards.

User drag page:

```text
1 2 3 4 5

↓

1 3 2 4 5
```

Save sebagai PDF baru.

---

# 15. PRESENTATION TOOLS

Presentation tools merupakan salah satu key differentiators QuikDrop.

Supported primary format:

`.pptx`

Legacy `.ppt` dapat ditambahkan kemudian melalui LibreOffice conversion.

---

# 16. PRESENTATION SHRINKER

Hero feature QuikDrop.

Objective:

Mengurangi ukuran presentation tanpa merusak slide layout.

User:

```text
Upload Presentation
↓
Choose Optimization
↓
Shrink
↓
Download
```

---

## Compression Modes

### Smallest File

Aggressive image optimization.

Suitable for:

- email,
- WhatsApp,
- quick review.

---

### Balanced

Default.

Suitable for:

- normal presentation,
- office sharing,
- client review.

---

### Best Quality

Minimal visual quality reduction.

Suitable for:

- presentation screen,
- project archive.

---

# 17. PRESENTATION SHRINK PROCESS

Engine dapat melakukan:

- detect embedded images,
- resize oversized images,
- JPEG recompression,
- PNG optimization,
- remove unnecessary image metadata,
- optimize duplicated media when technically safe,
- preserve slide structure,
- preserve text,
- preserve vectors where possible.

QuikDrop **tidak boleh rasterize seluruh PowerPoint** hanya untuk mengurangi file size.

Original PPTX structure harus dipertahankan sebisa mungkin.

---

# 18. PRESENTATION SHRINKER RESULT

Contoh:

```text
Presentation optimized

BEFORE
82.4 MB

AFTER
19.7 MB

76% smaller

Slides
48

[ Download PPTX ]
```

---

# 19. PPTX → PDF

User:

```text
Upload PPTX
↓
Convert
↓
Download PDF
```

Initial conversion engine:

LibreOffice Headless.

Output harus menjaga semaksimal mungkin:

- text,
- images,
- dimensions,
- fonts jika tersedia,
- alignment,
- slide aspect ratio.

---

# 20. PPTX → IMAGES

Presentation slides diexport menjadi:

- JPG
- PNG

Options:

- Standard
- High Resolution

Result:

ZIP.

Use cases:

- WhatsApp sharing,
- presentation previews,
- social sharing,
- client review.

---

# 21. QUICK WATERMARK

Satu watermark module digunakan untuk:

### PDF

dan

### PowerPoint / PPTX

---

# 22. WATERMARK TYPES

## Text Watermark

Contoh:

- DRAFT
- CONFIDENTIAL
- FOR REVIEW
- APPROVED
- INTERNAL ONLY

User juga bisa menulis custom text.

---

## Image Watermark

Upload:

- PNG
- JPG
- transparent PNG logo.

---

# 23. WATERMARK SETTINGS

Initial settings:

### Position

```text
Top Left
Top Center
Top Right

Center

Bottom Left
Bottom Center
Bottom Right
```

### Opacity

Slider:

```text
10% ───────── 100%
```

### Size

Small / Medium / Large

### Rotation

- 0°
- 45°
- -45°
- 90°

### Apply To

For PDF:

- All pages
- Selected pages

For PPT:

- All slides
- Selected slides

---

# 24. WATERMARK PREVIEW

User harus melihat preview sebelum processing.

Preview tidak harus full-resolution.

Goal:

memastikan:

- size,
- position,
- opacity,

sesuai sebelum file diproses.

---

# 25. QR GENERATOR

QR Generator tidak membutuhkan server processing untuk standard QR creation.

Processing dilakukan client-side.

---

# 26. QR TYPES

Initial V1:

### URL

```text
https://example.com
```

### Plain Text

### Email

### Phone Number

### WhatsApp

### Wi-Fi

Fields:

```text
Network
Password
Security
```

---

# 27. QR CUSTOMIZATION

Options:

### Size

- 512px
- 1024px
- 2048px

### Error Correction

Internal automatic/default.

Advanced options dapat disembunyikan.

### Foreground

Color picker.

### Background

Color picker / transparent where supported.

---

# 28. QR OUTPUT

Formats:

- PNG
- SVG

Actions:

```text
Download PNG

Download SVG

Copy
```

QR preview harus berubah secara realtime.

---

# 29. HOME PAGE

Home page tidak boleh terasa seperti dashboard enterprise.

Hero sederhana:

# QuikDrop

**Quick tools for everyday files.**

Search:

```text
What do you want to do?

[ Search tools... ]
```

Di bawahnya:

```text
PDF

Compress PDF
Merge PDF
Split PDF
Remove Pages
Rotate PDF
Image → PDF
PDF → Images
```

```text
PRESENTATION

Shrink Presentation
PPT → PDF
PPT → Images
```

```text
WATERMARK

Watermark PDF
Watermark Presentation
```

```text
QUICK

QR Generator
```

---

# 30. TOOL CARDS

Tool card harus sederhana.

Example:

```text
┌─────────────────────────┐
│                         │
│       Compress PDF      │
│                         │
│ Reduce PDF file size    │
│ without the hassle.     │
│                         │
└─────────────────────────┘
```

Card memiliki:

- small icon,
- tool name,
- one-line explanation.

Tidak perlu tombol besar.

Seluruh card clickable.

---

# 31. SEARCH-FIRST NAVIGATION

Saat QuikDrop memiliki banyak tools, search menjadi bagian penting.

Contoh user mengetik:

```text
compress
```

Results:

```text
Compress PDF
Shrink Presentation
Compress Image
```

Keyboard interaction:

```text
↑ ↓
Enter
```

Future:

`Cmd/Ctrl + K`

untuk Quick Tool Search.

---

# 32. TOOL PAGE STANDARD

Semua tool page memakai pattern yang konsisten.

Example:

# Compress PDF

**Reduce your PDF file size while keeping it clear.**

```text
┌────────────────────────────────────┐
│                                    │
│           Drop PDF here            │
│                                    │
│        or click to browse          │
│                                    │
│              PDF                   │
│          Max 100 MB                │
│                                    │
└────────────────────────────────────┘
```

---

# 33. FILE SELECTED STATE

Setelah file dipilih:

```text
Proposal_Client_Final.pdf

24.8 MB

✓ Ready

Compression
( ) Maximum
(•) Balanced
( ) Best Quality

[ Compress PDF ]
```

User tidak langsung dipaksa process setelah upload.

---

# 34. PROCESSING STATE

Processing state harus terasa responsive.

Example:

```text
Optimizing your PDF...

██████████░░

Preparing pages
```

Status tidak boleh menampilkan fake percentages jika backend tidak mengetahui progress sebenarnya.

Lebih baik gunakan status real seperti:

```text
Uploading
Processing
Preparing download
```

---

# 35. SUCCESS STATE

Example:

```text
✓ Done

24.8 MB
↓
6.3 MB

74% smaller

[ Download ]

Process Another File
```

Download menjadi CTA utama.

---

# 36. ERROR EXPERIENCE

Error harus menggunakan bahasa manusia.

Jangan:

```text
Error 0x4032
```

Gunakan:

```text
We couldn't process this PDF.

The file may be encrypted or damaged.

Try another file.
```

Technical error ID dapat ditampilkan kecil:

```text
Reference: QD-PDF-1038
```

---

# 37. UI / UX DESIGN DIRECTION

QuikDrop harus terasa:

- modern,
- premium,
- light,
- precise,
- calm,
- highly functional.

Inspirasi filosofi visual:

- Linear
- Raycast
- Notion
- Stripe
- modern Apple utility interfaces

Bukan menyalin visual mereka.

---

# 38. DESIGN LANGUAGE

## Background

Soft off-white / very light neutral.

Avoid pure white everywhere.

## Cards

Minimal border.

Very subtle shadow.

Rounded corners.

## Typography

Modern grotesk / sans-serif.

Examples:

- Inter
- Geist
- Manrope

Prefer self-hosted/system-safe implementation.

---

# 39. VISUAL HIERARCHY

Primary hierarchy:

```text
Tool Name

Description

Drop Area

Settings

Primary Action
```

Tidak boleh ada lebih dari satu dominant CTA dalam satu stage.

---

# 40. MICROINTERACTIONS

Use:

- subtle card hover,
- upload drop animation,
- small progress transitions,
- success checkmark,
- smooth page transitions.

Avoid:

- excessive parallax,
- animated background,
- unnecessary 3D,
- long entrance animations.

Performance lebih penting daripada decoration.

---

# 41. RESPONSIVE DESIGN

Primary:

Desktop.

Secondary:

Tablet.

Mobile tetap fully usable untuk:

- QR,
- basic PDF processing,
- upload dari phone.

Desktop experience mendapatkan priority karena QuikDrop primarily office utility.

---

# 42. PRIVACY ARCHITECTURE

QuikDrop tidak menyimpan uploaded documents secara permanent.

File lifecycle:

```text
UPLOAD

↓ temporary directory

PROCESS

↓ generated output

DOWNLOAD AVAILABLE

↓ expiration

DELETE INPUT
DELETE OUTPUT
DELETE TEMPORARY WORK FILES
```

---

# 43. FILE RETENTION

Default:

**Maximum 30 minutes after processing completion.**

Prefer lebih pendek jika memungkinkan.

Example:

```text
Processing complete
22:00

automatic deletion
22:30
```

Jika user download sebelum expiry, file boleh langsung dijadwalkan untuk deletion lebih cepat.

---

# 44. DATABASE POLICY

SQLite **tidak menyimpan file content**.

SQLite hanya digunakan untuk:

- job metadata,
- anonymous usage statistics,
- tool configuration,
- application configuration,
- error reference,
- processing state.

No:

```text
BLOB PDF
BLOB PPTX
BLOB IMAGE
```

---

# 45. SQLITE CONFIGURATION

Database:

```text
SQLite
```

Recommended:

```text
WAL mode
```

Advantages:

- simple deployment,
- low resource requirement,
- robust enough for initial traffic,
- backup easy,
- no external database server required.

---

# 46. DATABASE SCHEMA

## jobs

```text
id
tool
status
input_size
output_size
input_format
output_format
created_at
started_at
completed_at
expires_at
error_code
processing_time_ms
```

No filename required long-term.

If filename temporarily stored:

delete / anonymize when job expires.

---

## tool_usage

```text
id
tool
created_date
total_jobs
successful_jobs
failed_jobs
avg_processing_time
```

Can also be aggregated asynchronously.

---

## system_events

```text
id
event_type
severity
message
created_at
```

No document content.

---

# 47. NO ACCOUNT MVP

V1 tidak membutuhkan:

- login,
- registration,
- password,
- profile.

Reason:

Mengurangi friction.

User membuka QuikDrop dan langsung bekerja.

---

# 48. FUTURE ACCOUNT SYSTEM

Account hanya ditambahkan jika ada value jelas seperti:

- saved watermark presets,
- company branding,
- usage history without file retention,
- premium plan,
- API access,
- team configuration.

Account bukan requirement MVP.

---

# 49. TECHNICAL ARCHITECTURE

Recommended architecture:

```text
                Browser

                   │

            QuikDrop Frontend

                   │

          Processing API

                   │

        SQLite Job Manager

                   │

              Job Queue

                   │

          Processing Workers

       ┌───────────┼───────────┐
       │           │           │
      PDF         PPTX        Image
       │           │           │

           Temporary Storage

                   │

                Result

                   │

                Download

                   │

             Auto Delete
```

---

# 50. RECOMMENDED STACK

## Frontend

**Next.js**

with:

**TypeScript**

UI:

Custom component library / lightweight primitives.

Avoid huge UI frameworks where unnecessary.

---

## Styling

Tailwind CSS or equivalent lightweight system.

Benefits:

- fast development,
- small consistent design system,
- responsive,
- easy custom visual language.

---

# 51. BACKEND

Recommended:

**Python + FastAPI**

Reason:

Strong ecosystem untuk:

- PDF,
- presentations,
- image manipulation,
- document processing.

FastAPI juga ringan untuk API layer.

Alternative:

Node.js.

Tetapi document-processing tooling lebih comfortable jika worker layer menggunakan Python.

---

# 52. PDF ENGINE

Potential internal tools:

### qpdf

Suitable for:

- merge,
- split,
- page operations,
- structural manipulation.

### Ghostscript

Suitable for:

- PDF compression,
- optimization.

### PyMuPDF

Suitable for:

- PDF rendering,
- image extraction,
- watermarking,
- previews.

### pikepdf

Suitable for:

- low-level PDF manipulation.

Tidak semua library harus digunakan sekaligus.

Setiap operation menggunakan engine paling tepat.

---

# 53. PRESENTATION ENGINE

Primary format:

PPTX.

Potential stack:

### Python ZIP/XML processing

Karena `.pptx` secara internal adalah ZIP package.

Useful for:

- replacing optimized images,
- media optimization.

### Pillow

Image recompression/resizing.

### python-pptx

Useful for selected PowerPoint modification tasks.

### LibreOffice Headless

Use primarily for:

```text
PPTX → PDF
```

dan rendering compatibility tasks.

---

# 54. QR ENGINE

QR generation harus dilakukan di browser jika memungkinkan.

Advantages:

- zero server processing,
- instant preview,
- no privacy concerns,
- very low cost.

---

# 55. PROCESSING QUEUE

Walaupun setiap user hanya melakukan satu job pada satu waktu, beberapa user dapat process secara bersamaan.

QuikDrop harus menggunakan controlled job execution.

Example:

```text
USER A ─┐
USER B ─┤
USER C ─┤
USER D ─┤
USER E ─┤
        ↓
     JOB QUEUE

     Worker
```

---

# 56. SQLITE-BACKED JOB QUEUE

MVP tidak membutuhkan Redis.

Jobs dapat disimpan dalam SQLite:

```text
queued
processing
completed
failed
expired
```

Worker mengambil queued job secara aman.

Benefits:

- architecture simple,
- restart resistant,
- fewer moving parts.

Redis dapat ditambahkan setelah scale membutuhkan.

---

# 57. SERVER TARGET

Initial recommended server:

```text
4 vCPU
4 GB RAM
```

Suitable untuk MVP.

---

# 58. CONCURRENCY CONTROL

Approximate initial policy:

### Lightweight PDF jobs

Maximum:

3–4 simultaneous.

### Heavy PDF jobs

Maximum:

2 simultaneous.

### PPTX processing

Maximum:

1–2 simultaneous.

### QR

Client-side.

Worker scheduler dapat mengategorikan job:

```text
LIGHT
MEDIUM
HEAVY
```

---

# 59. RESOURCE PROTECTION

Setiap worker wajib mempunyai:

- execution timeout,
- memory limit where practical,
- file size limits,
- page limits,
- process kill handling.

Tujuan:

Satu corrupted file tidak boleh membuat seluruh service tidak responsive.

---

# 60. INITIAL FILE LIMITS

## PDF

```text
100 MB
```

Recommended page limit:

```text
300 pages
```

---

## PPTX

```text
150 MB
```

Recommended slides:

```text
200 slides
```

---

## Images

```text
30 MB/image
```

Limits dapat dinaikkan berdasarkan usage data.

---

# 61. TEMPORARY STORAGE STRUCTURE

Example:

```text
/tmp/quikdrop/

jobs/

    a8f92d/
        input/
        work/
        output/
```

Setiap job mempunyai random UUID.

Tidak menggunakan user-provided filename sebagai directory identifier.

---

# 62. CLEANUP SERVICE

Background cleanup process berjalan periodically.

Example:

every:

```text
5 minutes
```

Search:

```text
expires_at < current_time
```

Then:

```text
delete input
delete output
delete work files
mark job expired
```

---

# 63. CRASH RECOVERY

Saat server restart:

QuikDrop melakukan startup cleanup.

Jobs dengan status:

```text
processing
```

lebih lama dari threshold dianggap interrupted.

Mark:

```text
failed
```

Temporary working directory dibersihkan.

---

# 64. SECURITY

Uploaded files dianggap untrusted.

Required:

- validate extension,
- validate MIME type,
- inspect file signature,
- randomized temporary filenames,
- never execute uploaded files,
- process isolation,
- disable macros/external execution,
- protect against decompression bombs,
- maximum unpack size,
- sanitize paths,
- no direct arbitrary filesystem path supplied by user.

---

# 65. MACRO-ENABLED POWERPOINT

`.pptm`

tidak didukung di initial MVP.

Initial presentation format:

```text
.pptx
```

This reduces attack surface and complexity.

---

# 66. PASSWORD-PROTECTED FILES

Encrypted/password-protected PDFs:

Initial behavior:

```text
This PDF is password protected.

Please unlock it before uploading.
```

Future:

password entry support.

---

# 67. RATE LIMITING

Anonymous user initial limit:

Reasonable high limit rather than aggressive restriction.

Protection by:

- IP,
- job frequency,
- concurrent job count.

Example:

Maximum:

```text
2 active processing jobs / IP
```

This is different from daily usage limits.

---

# 68. PERFORMANCE REQUIREMENTS

## Home Page

Target:

interactive within approximately:

```text
< 1.5 seconds
```

on normal broadband connection.

---

## Navigation

Tool page transitions should feel:

```text
near instant
```

---

## QR Generation

Target:

```text
< 100 ms perceived response
```

after normal input.

---

## Upload UI

Upload must display immediate feedback.

---

# 69. FRONTEND PERFORMANCE

Avoid:

- giant JavaScript bundles,
- unnecessary analytics scripts,
- background videos,
- heavy animation libraries,
- loading all tool engines on homepage.

Use route/code splitting.

Tool-specific modules loaded only when required.

---

# 70. CLIENT-SIDE PROCESSING

Where practical, use client-side processing.

Potential future tools:

- QR generation,
- image resize,
- image crop,
- basic image conversion.

Advantages:

```text
lower server cost
faster result
more privacy
less bandwidth
```

---

# 71. OBSERVABILITY

Internal health dashboard should show:

```text
Jobs Today

Successful

Failed

Average Processing Time

Current Queue

Active Workers

Storage Used

Available RAM

CPU Load
```

---

# 72. PRIVACY-FRIENDLY ANALYTICS

Track events such as:

```text
tool_opened
upload_started
processing_started
processing_completed
processing_failed
download_clicked
```

Do not track:

- file content,
- document text,
- extracted images,
- sensitive filenames long-term.

---

# 73. TOOL POPULARITY

QuikDrop should learn which utilities are most used.

Example internal dashboard:

```text
Compress PDF      42%
Presentation      21%
Merge PDF         13%
Watermark         11%
QR                 8%
Others             5%
```

This determines roadmap priority.

---

# 74. SEO STRUCTURE

Setiap tool mempunyai dedicated URL.

Examples:

```text
quikdrop.app/pdf/compress

quikdrop.app/pdf/merge

quikdrop.app/pdf/split

quikdrop.app/pdf/rotate

quikdrop.app/pdf/to-images

quikdrop.app/presentation/shrink

quikdrop.app/presentation/to-pdf

quikdrop.app/watermark/pdf

quikdrop.app/qr
```

Benefit:

- shareable,
- bookmarkable,
- searchable,
- good SEO structure.

---

# 75. RECENT TOOLS

QuikDrop dapat menyimpan locally:

```text
recent tool
```

menggunakan browser localStorage.

Tidak memerlukan account.

Homepage optional:

```text
Recently Used

Compress PDF
Shrink Presentation
QR Generator
```

Important:

No file history.

Only tool history.

---

# 76. FAVORITES

Future lightweight feature.

User dapat star:

```text
★ Compress PDF
★ Presentation Shrinker
★ QR Generator
```

Stored in browser localStorage.

Again:

no account required.

---

# 77. KEYBOARD-FIRST UX

Future enhancement:

```text
Cmd/Ctrl + K
```

opens:

**Quick Tool Launcher**

Example:

```text
> comp

Compress PDF
Shrink Presentation
```

Enter opens selected tool.

This gives QuikDrop a premium productivity feel.

---

# 78. DARK MODE

Not required for MVP.

Architecture/design system should support future:

```text
Light
Dark
System
```

Initial priority:

high-quality light interface.

---

# 79. MVP NAVIGATION

Desktop header:

```text
QuikDrop

PDF
Presentation
Watermark
QR

                     Search
```

Logo always returns to home.

---

# 80. FOOTER

Minimal.

Links:

```text
Privacy
Terms
About
Contact
```

Plus:

```text
Files are automatically deleted after processing.
```

---

# 81. PRIVACY PAGE

Privacy messaging harus menjadi feature, bukan legal text tersembunyi.

Explain clearly:

### What QuikDrop stores

Anonymous processing metadata.

### What QuikDrop does not store

Document content after expiration.

### File deletion

Automatically removed.

### AI

MVP processing does not send documents to generative AI services unless a future tool explicitly states otherwise.

---

# 82. MVP FUNCTION MATRIX

| Feature | MVP |
|---|---|
| Compress PDF | Yes |
| Merge PDF | Yes |
| Split PDF | Yes |
| Remove PDF Pages | Yes |
| Rotate PDF | Yes |
| Image → PDF | Yes |
| PDF → Images | Yes |
| Reorder PDF | Optional V1 |
| Presentation Shrinker | Yes |
| PPTX → PDF | Yes |
| PPTX → Images | Yes |
| PDF Watermark | Yes |
| PPTX Watermark | Yes |
| QR Generator | Yes |
| Accounts | No |
| Permanent Storage | No |
| Batch Job System | No |
| Mobile App | No |
| API | No |
| AI Document Processing | No |

---

# 83. MVP PRIORITY

## Priority 0 — Foundation

- application shell,
- responsive UI,
- SQLite,
- temporary storage,
- job queue,
- cleanup service,
- download handling,
- security limits.

---

## Priority 1 — Core PDF

1. Compress PDF
2. Merge PDF
3. Split PDF
4. Remove Pages
5. Rotate
6. Image → PDF
7. PDF → Images

---

## Priority 2 — Presentation

1. Presentation Shrinker
2. PPTX → PDF
3. PPTX → Images

---

## Priority 3 — Watermark

1. PDF Watermark
2. PPTX Watermark

---

## Priority 4 — Quick Utilities

1. QR Generator

---

# 84. FUTURE TOOL ROADMAP

QuikDrop architecture should allow additional cards/modules without redesign.

Potential future tools:

### Image

- Resize Image
- Compress Image
- Convert Image
- Remove Background
- Social Media Resizer

### File

- ZIP
- File converter
- Extract archive

### Document

- Word → PDF
- Excel → PDF

### Office

- Screenshot → Text
- Screenshot → Table
- Presentation Contact Sheet

---

# 85. POTENTIAL HERO FEATURE

## Make It Smaller

Instead of asking user to understand compression.

User uploads:

```text
PDF
PPTX
JPG
PNG
```

Then:

```text
How small do you need it?

[ Under 2 MB ]

[ Under 5 MB ]

[ Under 10 MB ]

[ Email Friendly ]

[ WhatsApp Friendly ]
```

QuikDrop automatically determines optimization strategy.

This can become one of QuikDrop's signature features.

---

# 86. DEVELOPMENT ARCHITECTURE PRINCIPLE

Avoid premature complexity.

MVP should NOT begin with:

- Kubernetes,
- microservices,
- PostgreSQL cluster,
- Redis cluster,
- external worker farm,
- distributed filesystem.

Initial architecture:

```text
ONE SERVER

Next.js
FastAPI
SQLite
Worker
Temporary Storage

4 vCPU
4 GB
```

is acceptable.

---

# 87. SCALE PATH

If traffic increases, QuikDrop can evolve naturally.

### Stage 1

```text
Single Server
4 CPU
4 GB
```

---

### Stage 2

```text
Web

+

Dedicated Worker

+

Object Storage
```

---

### Stage 3

```text
Web Nodes

Job Queue

Worker Pool

Object Storage

Primary Database
```

SQLite can later migrate to PostgreSQL if required.

Database abstraction should therefore avoid unnecessary SQLite-specific application logic.

---

# 88. PRODUCT SUCCESS METRICS

Primary:

## Completion Rate

Percentage users who:

```text
open tool
→ upload
→ process
→ download
```

Target:

**>90% for supported valid files.**

---

## Time to First Action

From tool page open until upload initiation.

Goal:

as short as possible.

---

## Processing Success Rate

Target:

**>97% valid supported files.**

---

## Repeat Usage

Critical signal.

QuikDrop succeeds when people naturally return when they encounter another file task.

---

# 89. UX SUCCESS TEST

A first-time user should understand what to do without instructions.

Test:

Give user:

```text
20 MB PDF
```

Say:

> “Make this smaller.”

Success:

User completes task without assistance.

---

# 90. NON-GOALS

QuikDrop MVP will NOT attempt to become:

- Adobe Acrobat replacement,
- PowerPoint editor,
- Canva competitor,
- cloud drive,
- document collaboration tool,
- file sharing platform,
- project management application,
- digital asset manager.

Keeping this boundary is critical.

---

# 91. MVP DEFINITION OF DONE

QuikDrop MVP is ready when a user can:

1. Open website quickly.
2. Immediately understand available utilities.
3. Select a tool.
4. Upload appropriate file.
5. See clear processing options.
6. Start processing.
7. Receive result.
8. Download result.
9. Understand how much compression occurred where applicable.
10. Process another file without page refresh problems.
11. Trust that files are temporary.
12. Encounter clear errors when files are unsupported.
13. Use the product comfortably on desktop and mobile.
14. Return later without needing an account.

---

# 92. CORE QUikDROP EXPERIENCE

The entire product should ultimately feel like:

```text
OPEN

↓ 

CHOOSE

↓

DROP

↓

DONE
```

No unnecessary workflow.

No unnecessary account.

No unnecessary storage.

No unnecessary complexity.

---

# 93. FINAL PRODUCT STATEMENT

**QuikDrop is a fast, privacy-conscious web utility suite that turns common office file tasks into a few-second workflow.**

Instead of opening large applications or searching different websites for every task, users can use one professional interface for their everyday PDF, PowerPoint, watermark, QR and future file utilities.

The guiding product principle:

# One task. One result. Done.