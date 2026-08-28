import io
import zipfile
import subprocess
import shutil
from pathlib import Path

from PIL import Image

from app.engines.pdf_engine import EngineError, fitz


def _libreoffice_available() -> bool:
    return shutil.which("soffice") is not None


def shrink_presentation(input_path: Path, output_path: Path, preset: str = "balanced"):
    size_settings = {
        "smallest": {"max_dim": 1200, "quality": 55},
        "balanced": {"max_dim": 2000, "quality": 72},
        "best": {"max_dim": None, "quality": 88},
    }
    settings = size_settings.get(preset, size_settings["balanced"])
    max_dim = settings["max_dim"]
    quality = settings["quality"]

    MAX_ENTRY_SIZE = 60 * 1024 * 1024
    MAX_TOTAL_SIZE = 350 * 1024 * 1024

    with zipfile.ZipFile(input_path, "r") as z:
        names = z.namelist()
        media_names = [n for n in names if n.startswith("ppt/media/") and not n.endswith("/")]
        data = {}
        total = 0
        for name in names:
            entry = z.getinfo(name)
            if entry.file_size > MAX_ENTRY_SIZE:
                raise EngineError(
                    "This presentation contains an unusually large embedded file and cannot be processed safely.",
                    "QD-PPTX-BOMB",
                )
            total += entry.file_size
            if total > MAX_TOTAL_SIZE:
                raise EngineError(
                    "This presentation decompresses to an unsafe size. Please split it into smaller files.",
                    "QD-PPTX-BOMB",
                )
            data[name] = z.read(name)

    changed = 0
    for name in media_names:
        raw = data[name]
        ext = Path(name).suffix.lower()
        if ext not in (".jpg", ".jpeg", ".png", ".webp", ".gif", ".tiff", ".bmp"):
            continue
        try:
            img = Image.open(io.BytesIO(raw))
            img = img.convert("RGB")
            w, h = img.size
            if max_dim and max(w, h) > max_dim:
                scale = max_dim / max(w, h)
                new_w = max(1, int(w * scale))
                new_h = max(1, int(h * scale))
                img = img.resize((new_w, new_h), Image.LANCZOS)
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=quality, optimize=True)
            data[name] = buf.getvalue()
            changed += 1
        except Exception:
            continue

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for name, content in data.items():
            zf.writestr(name, content)


def pptx_to_pdf(input_path: Path, output_path: Path):
    if not _libreoffice_available():
        raise EngineError(
            "PPTX → PDF conversion requires LibreOffice which is not installed on this server.",
            "QD-LIBRE",
        )
    try:
        subprocess.run(
            ["soffice", "--headless", "--convert-to", "pdf", "--outdir", str(output_path.parent), str(input_path)],
            check=True, capture_output=True, timeout=120,
        )
        expected = output_path.parent / f"{input_path.stem}.pdf"
        if expected.exists():
            import shutil
            shutil.move(str(expected), str(output_path))
    except subprocess.TimeoutExpired:
        raise EngineError("Conversion timed out.", "QD-PPTX-TIMEOUT")
    except subprocess.CalledProcessError as e:
        raise EngineError(f"Conversion failed: {e.stderr.decode()[:200]}", "QD-PPTX-CONVERT")


def pptx_to_images(input_path: Path, output_dir: Path, fmt: str = "png", resolution: str = "standard"):
    pdf_path = output_dir / "_temp.pdf"
    try:
        pptx_to_pdf(input_path, pdf_path)
        doc = fitz.open(pdf_path)
        try:
            zoom = {"standard": 2.0, "high": 3.0}.get(resolution, 2.0)
            mat = fitz.Matrix(zoom, zoom)
            ext = "png" if fmt == "png" else "jpg"
            for i, page in enumerate(doc):
                pix = page.get_pixmap(matrix=mat, alpha=False)
                out = output_dir / f"slide-{i + 1:03d}.{ext}"
                if fmt == "png":
                    pix.save(out)
                else:
                    pix.pil_save(out, quality=88)
        finally:
            doc.close()
    finally:
        if pdf_path.exists():
            pdf_path.unlink()