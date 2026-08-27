from pathlib import Path

from app.engines.pdf_engine import compress_pdf, EngineError
from app.engines.presentation_engine import shrink_presentation
from app.engines.image_engine import compress_image

TARGET_PRESETS = {
    "2mb": 2 * 1024 * 1024,
    "5mb": 5 * 1024 * 1024,
    "10mb": 10 * 1024 * 1024,
    "email": 5 * 1024 * 1024,
    "whatsapp": 16 * 1024 * 1024,
}

TARGET_LABELS = {
    "2mb": "2 MB",
    "5mb": "5 MB",
    "10mb": "10 MB",
    "email": "Email Friendly",
    "whatsapp": "WhatsApp Friendly",
}


def resolve_target(target: str) -> int:
    if target in TARGET_PRESETS:
        return TARGET_PRESETS[target]
    try:
        return int(float(target) * 1024 * 1024)
    except (TypeError, ValueError):
        raise EngineError("Invalid target size.", "QD-SIZE-TARGET")


def make_it_smaller(input_path: Path, output_path: Path, target_bytes: int) -> Path:
    ext = input_path.suffix.lower()
    current = input_path.stat().st_size

    if current <= target_bytes:
        if ext in (".pdf",):
            compress_pdf(input_path, output_path, "best")
        elif ext == ".pptx":
            shrink_presentation(input_path, output_path, "best")
        elif ext in (".jpg", ".jpeg", ".png", ".webp"):
            compress_image(input_path, output_path, quality=88)
        else:
            raise EngineError("Unsupported file type.", "QD-SMALLER-TYPE")
        return output_path

    if ext == ".pdf":
        for preset in ("balanced", "maximum"):
            compress_pdf(input_path, output_path, preset)
            if output_path.stat().st_size <= target_bytes:
                return output_path
    elif ext == ".pptx":
        for preset in ("balanced", "smallest"):
            shrink_presentation(input_path, output_path, preset)
            if output_path.stat().st_size <= target_bytes:
                return output_path
    elif ext in (".jpg", ".jpeg", ".png", ".webp"):
        for quality in (72, 55, 40):
            compress_image(input_path, output_path, quality=quality, max_dimension=2000)
            if output_path.stat().st_size <= target_bytes:
                return output_path
            compress_image(input_path, output_path, quality=quality, max_dimension=1280)
            if output_path.stat().st_size <= target_bytes:
                return output_path
    else:
        raise EngineError("Unsupported file type. Try a PDF, PPTX, or image.", "QD-SMALLER-TYPE")

    return output_path