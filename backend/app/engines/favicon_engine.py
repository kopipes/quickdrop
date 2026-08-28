import zipfile
import tempfile
from pathlib import Path

from PIL import Image

from app.engines.pdf_engine import EngineError

FAVICON_SIZES = [16, 32, 48, 64, 128, 192, 512]
ICO_SIZES = [16, 32, 48, 64]


def generate_favicon(input_path: Path, output_dir: Path) -> Path:
    try:
        with Image.open(input_path) as im:
            if im.mode != 'RGBA':
                im = im.convert('RGBA')
            w, h = im.size
            # Center-crop to square
            if w != h:
                size = min(w, h)
                left = (w - size) // 2
                top = (h - size) // 2
                im = im.crop((left, top, left + size, top + size))

            # Work in a temp subdir — only the ZIP goes to output_dir
            with tempfile.TemporaryDirectory() as tmpdir:
                tmp = Path(tmpdir)
                png_files = []
                for sz in FAVICON_SIZES:
                    resized = im.resize((sz, sz), Image.LANCZOS)
                    fname = f"favicon-{sz}x{sz}.png"
                    out = tmp / fname
                    resized.save(out, format="PNG", optimize=True)
                    png_files.append(out)

                ico_images = [im.resize((sz, sz), Image.LANCZOS) for sz in ICO_SIZES]
                ico_path = tmp / "favicon.ico"
                ico_images[0].save(
                    ico_path, format="ICO",
                    sizes=[(sz, sz) for sz in ICO_SIZES],
                    append_images=ico_images[1:],
                )

                zip_path = output_dir / "favicon-pack.zip"
                with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
                    zf.write(ico_path, arcname="favicon.ico")
                    for f in png_files:
                        zf.write(f, arcname=f.name)
                return zip_path

    except EngineError:
        raise
    except Exception as e:
        raise EngineError(
            f"Could not generate favicon from this image: {e}",
            "QD-FAVICON",
        ) from e