import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
TEMP_DIR = BASE_DIR / "tmp"

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(TEMP_DIR / "jobs", exist_ok=True)

DATABASE_URL = os.getenv("QUIKDROP_DATABASE_URL", str(DATA_DIR / "quikdrop.db"))

MAX_FILE_SIZE_PDF = 100 * 1024 * 1024
MAX_FILE_SIZE_PPTX = 150 * 1024 * 1024
MAX_FILE_SIZE_IMAGE = 30 * 1024 * 1024
MAX_PDF_PAGES = 300
MAX_PPTX_SLIDES = 200
MAX_MERGE_FILES = 20

RETENTION_MINUTES = 30
CLEANUP_INTERVAL_SECONDS = 300

MAX_ACTIVE_JOBS_PER_IP = 2

ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv("QUIKDROP_ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if o.strip()
]

JOB_TIMEOUT_SECONDS = 300
CONCURRENCY_LIGHT = 4
CONCURRENCY_MEDIUM = 2
CONCURRENCY_HEAVY = 1

STATUS_QUEUED = "queued"
STATUS_PROCESSING = "processing"
STATUS_COMPLETED = "completed"
STATUS_FAILED = "failed"
STATUS_EXPIRED = "expired"

TOOL_CATEGORIES = {
    "pdf": {
        "compress": "compress_pdf",
        "merge": "merge_pdf",
        "split": "split_pdf",
        "remove-pages": "remove_pdf_pages",
        "rotate": "rotate_pdf",
        "image-to-pdf": "image_to_pdf",
        "pdf-to-images": "pdf_to_images",
        "reorder": "reorder_pdf",
    },
    "presentation": {
        "shrink": "shrink_presentation",
        "to-pdf": "pptx_to_pdf",
        "to-images": "pptx_to_images",
        "images-to-ppt": "images_to_pptx",
    },
    "watermark": {
        "pdf": "watermark_pdf",
        "presentation": "watermark_presentation",
    },
    "quick": {
        "qr": "qr_generator",
        "favicon-generator": "favicon_generator",
    },
    "image": {
        "resize": "resize_image",
        "contact-sheet": "contact_sheet",
    },
    "make-smaller": {
        "make-it-smaller": "make_it_smaller",
    },
}

TOOL_NAMES = {}
for cat, tools in TOOL_CATEGORIES.items():
    for slug, tool_id in tools.items():
        TOOL_NAMES[tool_id] = f"/{cat}/{slug}"