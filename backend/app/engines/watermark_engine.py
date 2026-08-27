from typing import Optional, List, Tuple
import io
from pathlib import Path

import fitz
from PIL import Image

from app.engines.pdf_engine import EngineError


def _add_text_watermark_to_page(page: fitz.Page, text: str, position: str, opacity: float, size: str, rotation: int):
    rect = page.rect
    positions = {
        "top-left": (rect.x0 + 36, rect.y0 + 36),
        "top-center": (rect.x0 + rect.width / 2, rect.y0 + 36),
        "top-right": (rect.x1 - 36, rect.y0 + 36),
        "center": (rect.x0 + rect.width / 2, rect.y0 + rect.height / 2),
        "bottom-left": (rect.x0 + 36, rect.y1 - 36),
        "bottom-center": (rect.x0 + rect.width / 2, rect.y1 - 36),
        "bottom-right": (rect.x1 - 36, rect.y1 - 36),
    }
    font_sizes = {"small": 24, "medium": 48, "large": 72}
    font_size = font_sizes.get(size, 48)
    x, y = positions.get(position, positions["center"])
    shape = page.new_shape()
    morph = None
    if rotation:
        morph = (fitz.Point(x, y), fitz.Matrix(rotation))
    shape.insert_text(
        fitz.Point(x, y),
        text,
        fontsize=font_size,
        color=(0, 0, 0),
        stroke_opacity=opacity,
        fill_opacity=opacity,
        morph=morph,
    )
    shape.commit()


def _add_image_watermark_to_page(page: fitz.Page, img_bytes: bytes, position: str, opacity: float, size: str, rotation: int):
    rect = page.rect
    with Image.open(io.BytesIO(img_bytes)) as im:
        w, h = im.size
    size_factors = {"small": 0.15, "medium": 0.25, "large": 0.4}
    factor = size_factors.get(size, 0.25)
    img_w = rect.width * factor
    img_h = img_w * h / w
    positions = {
        "top-left": (rect.x0 + 36, rect.y0 + 36),
        "top-center": (rect.x0 + rect.width / 2 - img_w / 2, rect.y0 + 36),
        "top-right": (rect.x1 - 36 - img_w, rect.y0 + 36),
        "center": (rect.x0 + rect.width / 2 - img_w / 2, rect.y0 + rect.height / 2 - img_h / 2),
        "bottom-left": (rect.x0 + 36, rect.y1 - 36 - img_h),
        "bottom-center": (rect.x0 + rect.width / 2 - img_w / 2, rect.y1 - 36 - img_h),
        "bottom-right": (rect.x1 - 36 - img_w, rect.y1 - 36 - img_h),
    }
    x, y = positions.get(position, positions["center"])
    try:
        pix = fitz.Pixmap(img_bytes)
        page.insert_image(fitz.Rect(x, y, x + img_w, y + img_h), pixmap=pix, overlay=True, rotate=rotation)
    except Exception:
        page.insert_image(fitz.Rect(x, y, x + img_w, y + img_h), stream=img_bytes, overlay=True, rotate=rotation)


def watermark_pdf(input_path: Path, output_path: Path, watermark_type: str,
                  text: str = "", image_bytes: Optional[bytes] = None,
                  position: str = "center", opacity: float = 0.3,
                  size: str = "medium", rotation: int = 0,
                  apply_to: str = "all", selected_pages: Optional[List[int]] = None):
    doc = fitz.open(input_path)
    try:
        n = doc.page_count
        target_pages = list(range(n)) if apply_to == "all" else [p - 1 for p in (selected_pages or []) if 1 <= p <= n]
        for i in target_pages:
            page = doc[i]
            if watermark_type == "text":
                _add_text_watermark_to_page(page, text, position, opacity, size, rotation)
            else:
                _add_image_watermark_to_page(page, image_bytes, position, opacity, size, rotation)
        doc.save(output_path, garbage=4, deflate=True)
    finally:
        doc.close()


def watermark_presentation(input_path: Path, output_path: Path, watermark_type: str,
                           text: str = "", image_bytes: Optional[bytes] = None,
                           position: str = "center", opacity: float = 0.3,
                           size: str = "medium", rotation: int = 0,
                           apply_to: str = "all", selected_slides: Optional[List[int]] = None):
    from pptx import Presentation
    from pptx.util import Inches, Pt, Emu
    from pptx.dml.color import RGBColor
    from pptx.enum.text import PP_ALIGN

    prs = Presentation(input_path)
    n = len(prs.slides)
    target_indices = list(range(n)) if apply_to == "all" else [i - 1 for i in (selected_slides or []) if 1 <= i <= n]

    size_factors = {"small": 0.15, "medium": 0.25, "large": 0.4}
    factor = size_factors.get(size, 0.25)
    sizes = {"small": 18, "medium": 36, "large": 54}
    font_size = sizes.get(size, 36)
    pos_map = {
        "top-left": (0, 0),
        "top-center": (0.5, 0),
        "top-right": (1, 0),
        "center": (0.5, 0.5),
        "bottom-left": (0, 1),
        "bottom-center": (0.5, 1),
        "bottom-right": (1, 1),
    }

    slide_w = prs.slide_width
    slide_h = prs.slide_height

    for idx in target_indices:
        slide = prs.slides[idx]
        from pptx.util import Emu
        px, py = pos_map.get(position, (0.5, 0.5))
        if watermark_type == "text":
            txBox = slide.shapes.add_textbox(
                Emu(int(slide_w * px - slide_w * factor / 2)),
                Emu(int(slide_h * py - slide_h * factor / 2)),
                Emu(int(slide_w * factor)),
                Emu(int(slide_h * factor)),
            )
            tf = txBox.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = text
            p.font.size = Pt(font_size)
            p.font.bold = True
            p.font.color.rgb = RGBColor(0, 0, 0)
            p.alignment = PP_ALIGN.CENTER
            from pptx.oxml.ns import qn
            for run in p.runs:
                run._r.get_or_add_rPr()
                solidFill = run._r.rPr.makeelement(qn("a:solidFill"), {})
                srgb = solidFill.makeelement(qn("a:srgbClr"), {"val": "000000"})
                solidFill.append(srgb)
                run._r.rPr.append(solidFill)
                alpha = solidFill.makeelement(qn("a:alpha"), {"val": str(int(opacity * 100000))})
                solidFill.append(alpha)
        else:
            from PIL import Image as PILImage
            import io
            img = PILImage.open(io.BytesIO(image_bytes))
            img_w = int(slide_w * factor)
            img_h = int(img_w * img.size[1] / img.size[0])
            left = int(slide_w * px - img_w / 2)
            top = int(slide_h * py - img_h / 2)
            slide.shapes.add_picture(io.BytesIO(image_bytes), left, top, img_w, img_h)

    prs.save(output_path)