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