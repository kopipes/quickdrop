from typing import Optional, List, Tuple
import io
import zipfile
from pathlib import Path

import fitz  # PyMuPDF

from app.config import MAX_PDF_PAGES


class EngineError(Exception):
    def __init__(self, message: str, code: str = "QD-ERR"):
        super().__init__(message)
        self.message = message
        self.code = code


def _open(path: Path):
    try:
        return fitz.open(path)
    except Exception as e:
        raise EngineError(
            "We couldn't read this PDF. The file may be encrypted, damaged, or not a valid PDF.",
            "QD-PDF-READ",
        ) from e


def _compress_params(preset: str):
    if preset == "maximum":
        return {"garbage": 4, "deflate": True, "clean": True, "linear": True}
    if preset == "best":
        return {"garbage": 3, "deflate": True}
    return {"garbage": 4, "deflate": True}


def compress_pdf(input_path: Path, output_path: Path, preset: str = "balanced"):
    doc = _open(input_path)
    if doc.page_count > MAX_PDF_PAGES:
        raise EngineError(
            f"This PDF has more than {MAX_PDF_PAGES} pages. Please split it first.",
            "QD-PDF-PAGES",
        )
    try:
        max_dimension = 2400 if preset == "maximum" else (1600 if preset == "balanced" else None)
        quality = 60 if preset == "maximum" else (72 if preset == "balanced" else 88)
        changed = 0
        for page in doc:
            for img in page.get_images(full=True):
                try:
                    xref = img[0]
                    pix = fitz.Pixmap(doc, xref)
                    if max_dimension:
                        scale = min(1.0, max_dimension / max(pix.width, pix.height))
                        if scale < 1.0:
                            new_w = max(1, int(pix.width * scale))
                            new_h = max(1, int(pix.height * scale))
                            pix = fitz.Pixmap(pix, new_w, new_h)
                    new_pix = pix
                    if new_pix.colorspace and new_pix.colorspace.n > 3:
                        new_pix = fitz.Pixmap(fitz.csRGB, pix)
                    data = new_pix.tobytes("jpeg", jpg_quality=quality)
                    doc.update_stream(xref, data)
                    doc.xref_set_key(xref, "Filter", fitz.pdfobject.Name("DCTDecode"))
                    doc.xref_set_key(xref, "ColorSpace", fitz.pdfobject.Name("DeviceRGB"))
                    changed += 1
                except Exception:
                    continue
                finally:
                    try:
                        pix = None
                    except Exception:
                        pass
        opts = _compress_params(preset)
        if not opts.get("linear"):
            opts["use_objstms"] = 1
        doc.save(output_path, **opts)
    finally:
        doc.close()
    if output_path.stat().st_size == 0:
        raise EngineError("Compression failed to produce a valid PDF.", "QD-PDF-COMPRESS")


def merge_pdfs(input_paths: list[Path], output_path: Path):
    merged = fitz.open()
    try:
        for path in input_paths:
            doc = _open(path)
            merged.insert_pdf(doc)
            doc.close()
        if merged.page_count == 0:
            raise EngineError("No pages were found to merge.", "QD-PDF-MERGE")
        merged.save(output_path, garbage=4, deflate=True)
    finally:
        merged.close()


def split_pdf(input_path: Path, output_dir: Path, ranges: Optional[List[Tuple[int, int]]] = None, every_page: bool = False):
    doc = _open(input_path)
    try:
        n = doc.page_count
        if every_page:
            for i in range(n):
                single = fitz.open()
                single.insert_pdf(doc, from_page=i, to_page=i)
                single.save(output_dir / f"page-{i + 1:03d}.pdf", garbage=3, deflate=True)
                single.close()
            return
        if not ranges:
            raise EngineError("No page range was specified.", "QD-PDF-SPLIT")
        for idx, (start, end) in enumerate(ranges):
            start = max(1, min(start, n))
            end = max(1, min(end, n))
            if start > end:
                start, end = end, start
            part = fitz.open()
            part.insert_pdf(doc, from_page=start - 1, to_page=end - 1)
            fname = f"pages-{start}-{end}.pdf" if len(ranges) > 1 else f"split-{start}-{end}.pdf"
            part.save(output_dir / fname, garbage=3, deflate=True)
            part.close()
    finally:
        doc.close()


def remove_pages(input_path: Path, output_path: Path, pages_to_remove: List[int]):
    doc = _open(input_path)
    try:
        pages_to_remove = sorted({p - 1 for p in pages_to_remove if 1 <= p <= doc.page_count}, reverse=True)
        if not pages_to_remove:
            raise EngineError("No pages were selected for removal.", "QD-PDF-REMOVE")
        for p in pages_to_remove:
            doc.delete_page(p)
        if doc.page_count == 0:
            raise EngineError("Removing these pages would leave an empty document.", "QD-PDF-REMOVE")
        doc.save(output_path, garbage=4, deflate=True)
    finally:
        doc.close()


def rotate_pdf(input_path: Path, output_path: Path, pages: List[int], rotation: int):
    doc = _open(input_path)
    try:
        valid_rotations = {90, 180, 270}
        if rotation not in valid_rotations:
            raise EngineError("Invalid rotation value.", "QD-PDF-ROTATE")
        target_pages = pages if pages else list(range(1, doc.page_count + 1))
        for p in target_pages:
            if 1 <= p <= doc.page_count:
                page = doc[p - 1]
                page.set_rotation((page.rotation + rotation) % 360)
        doc.save(output_path, garbage=4, deflate=True)
    finally:
        doc.close()


def reorder_pdf(input_path: Path, output_path: Path, new_order: List[int]):
    doc = _open(input_path)
    try:
        n = doc.page_count
        if not new_order or set(new_order) != set(range(1, n + 1)):
            raise EngineError("The page order is invalid.", "QD-PDF-REORDER")
        new_doc = fitz.open()
        for p in new_order:
            new_doc.insert_pdf(doc, from_page=p - 1, to_page=p - 1)
        new_doc.save(output_path, garbage=4, deflate=True)
        new_doc.close()
    finally:
        doc.close()


def image_to_pdf(image_paths: list[Path], output_path: Path, page_size: str = "auto",
                 orientation: str = "auto", margin: str = "none"):
    from PIL import Image

    doc = fitz.open()
    margin_pt = {"none": 0, "small": 12, "normal": 36}.get(margin, 0)
    try:
        for path in image_paths:
            with Image.open(path) as im:
                im = im.convert("RGB")
                w, h = im.size
            if page_size == "a4":
                target = (595.0, 842.0)
            elif page_size == "letter":
                target = (612.0, 792.0)
            else:
                target = None
            img_w = w * 72 / 96 if target is None else 0
            img_h = h * 72 / 96 if target is None else 0
            if target:
                scale = min((target[0] - 2 * margin_pt) / w, (target[1] - 2 * margin_pt) / h)
                img_w = w * scale
                img_h = h * scale
            if orientation == "landscape":
                if (target and target[1] > target[0]) or (not target and img_h > img_w):
                    if target:
                        target = (target[1], target[0])
                    else:
                        img_w, img_h = img_h, img_w
            elif orientation == "portrait":
                if (target and target[0] > target[1]) or (not target and img_w > img_h):
                    if target:
                        target = (target[1], target[0])
                    else:
                        img_w, img_h = img_h, img_w
            if target:
                page = doc.new_page(width=target[0], height=target[1])
                x = (target[0] - img_w) / 2
                y = (target[1] - img_h) / 2
            else:
                page = doc.new_page(width=img_w + 2 * margin_pt, height=img_h + 2 * margin_pt)
                x = margin_pt
                y = margin_pt
            page.insert_image(fitz.Rect(x, y, x + img_w, y + img_h), filename=str(path))
        doc.save(output_path, garbage=4, deflate=True)
    finally:
        doc.close()


def pdf_to_images(input_path: Path, output_dir: Path, fmt: str = "png", resolution: str = "standard"):
    doc = _open(input_path)
    try:
        zoom = {"standard": 2.0, "high": 3.0, "print": 4.0}.get(resolution, 2.0)
        mat = fitz.Matrix(zoom, zoom)
        ext = "png" if fmt == "png" else "jpg"
        for i, page in enumerate(doc):
            pix = page.get_pixmap(matrix=mat, alpha=False)
            out = output_dir / f"page-{i + 1:03d}.{ext}"
            if fmt == "png":
                pix.save(out)
            else:
                pix.pil_save(out, quality=88)
    finally:
        doc.close()


def make_zip(files: list[Path], zip_path: Path):
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in files:
            zf.write(f, arcname=f.name)