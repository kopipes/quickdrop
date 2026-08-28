import io
import zipfile
from pathlib import Path

from PIL import Image

from app.engines.pdf_engine import EngineError


def resize_image(input_path: Path, output_path: Path, width: int = 0, height: int = 0,
                 percentage: int = 0, max_dimension: int = 0, quality: int = 85):
    with Image.open(input_path) as im:
        im = im.convert("RGB") if im.mode in ("RGBA", "P", "LA") else im
        orig_w, orig_h = im.size
        new_w, new_h = orig_w, orig_h
        if percentage:
            factor = percentage / 100.0
            new_w = max(1, int(orig_w * factor))
            new_h = max(1, int(orig_h * factor))
        elif width and height:
            new_w, new_h = width, height
        elif width:
            ratio = width / orig_w
            new_w = width
            new_h = max(1, int(orig_h * ratio))
        elif height:
            ratio = height / orig_h
            new_h = height
            new_w = max(1, int(orig_w * ratio))
        elif max_dimension:
            scale = min(1.0, max_dimension / max(orig_w, orig_h))
            new_w = max(1, int(orig_w * scale))
            new_h = max(1, int(orig_h * scale))
        if (new_w, new_h) != (orig_w, orig_h):
            im = im.resize((new_w, new_h), Image.LANCZOS)

        ext = output_path.suffix.lower()
        fmt = "JPEG" if ext in (".jpg", ".jpeg") else ("PNG" if ext == ".png" else "WEBP")
        if fmt == "JPEG":
            im = im.convert("RGB")
            im.save(output_path, format="JPEG", quality=quality, optimize=True)
        elif fmt == "WEBP":
            im.save(output_path, format="WEBP", quality=quality, method=6)
        else:
            im.save(output_path, format="PNG", optimize=True)


def compress_image(input_path: Path, output_path: Path, quality: int = 70, max_dimension: int = 0):
    with Image.open(input_path) as im:
        orig_w, orig_h = im.size
        if max_dimension:
            scale = min(1.0, max_dimension / max(orig_w, orig_h))
            if scale < 1.0:
                im = im.resize((max(1, int(orig_w * scale)), max(1, int(orig_h * scale))), Image.LANCZOS)
        ext = output_path.suffix.lower()
        fmt = "JPEG" if ext in (".jpg", ".jpeg") else ("PNG" if ext == ".png" else "WEBP")
        if fmt == "JPEG":
            im = im.convert("RGB")
            im.save(output_path, format="JPEG", quality=quality, optimize=True)
        elif fmt == "WEBP":
            im.save(output_path, format="WEBP", quality=quality, method=6)
        else:
            im.save(output_path, format="PNG", optimize=True)


def make_zip(files: list[Path], zip_path: Path):
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in files:
            zf.write(f, arcname=f.name)


def contact_sheet(image_paths: list[Path], output_path: Path, columns: int = 3,
                  rows: int = 4, spacing: int = 8, labels: bool = True,
                  page_size: str = "a4", orientation: str = "portrait"):
    """Arrange images into a grid on one or more PDF pages (contact sheet)."""
    import fitz

    if columns < 1 or rows < 1:
        raise EngineError("Columns and rows must be at least 1.", "QD-SHEET-GRID")
    if not image_paths:
        raise EngineError("No images to arrange.", "QD-SHEET-NONE")

    sizes = {
        "a4": (595.0, 842.0),
        "letter": (612.0, 792.0),
    }
    page_w, page_h = sizes.get(page_size, sizes["a4"])
    if orientation == "landscape":
        page_w, page_h = page_h, page_w
    margin = 40
    spacing_pt = max(0, int(spacing)) * 72 / 96
    label_h = 14 if labels else 0

    doc = fitz.open()
    per_page = columns * rows
    total_pages = (len(image_paths) + per_page - 1) // per_page

    for p in range(total_pages):
        page = doc.new_page(width=page_w, height=page_h)
        if labels:
            page.draw_rect(
                fitz.Rect(0, 0, page_w, page_h),
                color=(0, 0, 0), width=0, fill=(1, 1, 1),
            )
        batch = image_paths[p * per_page:(p + 1) * per_page]
        usable_w = page_w - 2 * margin
        usable_h = page_h - 2 * margin - (rows * label_h)
        cell_w = (usable_w - (columns - 1) * spacing_pt) / columns
        cell_h = (usable_h - (rows - 1) * spacing_pt) / rows

        for idx, path in enumerate(batch):
            row, col = divmod(idx, columns)
            try:
                with Image.open(path) as im:
                    im = im.convert("RGB")
                    img_w, img_h = im.size
                scale = min(cell_w / img_w, (cell_h - label_h) / img_h)
                draw_w = img_w * scale
                draw_h = img_h * scale
                x = margin + col * (cell_w + spacing_pt) + (cell_w - draw_w) / 2
                y = margin + row * (cell_h + spacing_pt + label_h) + (cell_h - label_h - draw_h) / 2
                page.insert_image(
                    fitz.Rect(x, y, x + draw_w, y + draw_h),
                    filename=str(path),
                )
                if labels:
                    page.insert_text(
                        fitz.Point(margin + col * (cell_w + spacing_pt), y + draw_h + 10),
                        path.stem[:40],
                        fontsize=8,
                        color=(0.25, 0.25, 0.25),
                    )
            except Exception:
                continue
    doc.save(output_path, garbage=4, deflate=True)
    doc.close()
    if output_path.stat().st_size == 0:
        raise EngineError("Failed to build the contact sheet.", "QD-SHEET-OUT")