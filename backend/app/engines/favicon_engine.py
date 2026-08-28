import zipfile
from pathlib import Path

from PIL import Image

from app.engines.pdf_engine import EngineError

FAVICON_SIZES = [16, 32, 48, 64, 128, 192, 512]
ICO_SIZES = [16, 32, 48, 64]


def generate_favicon(input_path: Path, output_dir: Path) -> Path:
    try:
        with Image.open(input_path) as im:
            # Convert to RGBA for transparency support
            if im.mode != 'RGBA':
                im = im.convert('RGBA')
            orig_w, orig_h = im.size

        # Crop to square (center crop) if not square
        with Image.open(input_path) as im:
            if im.mode != 'RGBA':
                im = im.convert('RGBA')
            w, h = im.size
            if w != h:
                size = min(w, h)
                left = (w - size) // 2
                top = (h - size) // 2
                im = im.crop((left, top, left + size, top + size))

            png_files = []
            for sz in FAVICON_SIZES:
                resized = im.resize((sz, sz), Image.LANCZOS)
                fname = f"favicon-{sz}x{sz}.png"
                out = output_dir / fname
                resized.save(out, format="PNG", optimize=True)
                png_files.append(out)

            # Build .ico from multiple sizes
            ico_images = []
            for sz in ICO_SIZES:
                ico_images.append(im.resize((sz, sz), Image.LANCZOS))
            ico_path = output_dir / "favicon.ico"
            ico_images[0].save(
                ico_path,
                format="ICO",
                sizes=[(sz, sz) for sz in ICO_SIZES],
                append_images=ico_images[1:],
            )

            # ZIP everything together
            zip_path = output_dir / "favicon-pack.zip"
            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
                zf.write(ico_path, arcname="favicon.ico")
                for f in png_files:
                    zf.write(f, arcname=f.name)
            return zip_path

    except Exception as e:
        raise EngineError(
            f"Could not generate favicon from this image: {e}",
            "QD-FAVICON",
        ) from e