import tempfile
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.config import MAX_FILE_SIZE_IMAGE

router = APIRouter(prefix="/api", tags=["palette"])

CHUNK_SIZE = 64 * 1024


def _rgb_to_cmyk(r: int, g: int, b: int) -> tuple:
    if r == 0 and g == 0 and b == 0:
        return (0, 0, 0, 100)
    r_, g_, b_ = r / 255, g / 255, b / 255
    k = 1 - max(r_, g_, b_)
    if k == 1:
        return (0, 0, 0, 100)
    c = (1 - r_ - k) / (1 - k)
    m = (1 - g_ - k) / (1 - k)
    y = (1 - b_ - k) / (1 - k)
    return (round(c * 100), round(m * 100), round(y * 100), round(k * 100))


@router.post("/palette")
async def extract_palette(
    files: list[UploadFile] = File(...),
    count: int = 8,
):
    if not files:
        raise HTTPException(status_code=400, detail="No image uploaded.")
    f = files[0]
    total = 0
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(f.filename or "img.jpg").suffix) as tmp:
            tmp_path = Path(tmp.name)
            while True:
                chunk = await f.read(CHUNK_SIZE)
                if not chunk:
                    break
                total += len(chunk)
                if total > MAX_FILE_SIZE_IMAGE:
                    tmp_path.unlink(missing_ok=True)
                    raise HTTPException(status_code=413, detail="Image exceeds the maximum allowed size.")
                tmp.write(chunk)
    finally:
        await f.close()

    try:
        from PIL import Image
        count = max(2, min(count, 16))
        with Image.open(tmp_path) as im:
            im = im.convert("RGB")
            # Resize for faster processing
            thumb = im.copy()
            thumb.thumbnail((256, 256), Image.LANCZOS)
            # Quantize to extract dominant colors
            quantized = thumb.quantize(colors=count, method=Image.Quantize.MEDIANCUT)
            palette_data = quantized.getpalette()
            # Count pixels per color for sorting by frequency
            pixel_counts = quantized.getcolors()
            if not pixel_counts:
                raise HTTPException(status_code=400, detail="Could not extract colors from this image.")
            # Sort by frequency (most dominant first)
            sorted_colors = sorted(pixel_counts, key=lambda x: -x[0])
            colors = []
            seen = set()
            for _, idx in sorted_colors:
                r = palette_data[idx * 3]
                g = palette_data[idx * 3 + 1]
                b = palette_data[idx * 3 + 2]
                hex_val = f"#{r:02X}{g:02X}{b:02X}"
                if hex_val in seen:
                    continue
                seen.add(hex_val)
                c, m, y, k = _rgb_to_cmyk(r, g, b)
                colors.append({
                    "hex": hex_val,
                    "rgb": {"r": r, "g": g, "b": b},
                    "cmyk": {"c": c, "m": m, "y": y, "k": k},
                })
            return {"colors": colors[:count]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not process this image: {e}")
    finally:
        tmp_path.unlink(missing_ok=True)