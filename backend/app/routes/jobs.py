from typing import Optional, List, Tuple
import hashlib
import json

from fastapi import APIRouter, UploadFile, File, Form, Request
from fastapi.responses import JSONResponse

from app.db.database import create_job, get_conn
from app.services.storage import save_upload
from app.config import (
    MAX_ACTIVE_JOBS_PER_IP, MAX_FILE_SIZE_PDF, MAX_FILE_SIZE_PPTX, MAX_FILE_SIZE_IMAGE,
    MAX_MERGE_FILES, TOOL_CATEGORIES,
)

router = APIRouter(prefix="/api", tags=["jobs"])

ALLOWED_EXTENSIONS = {
    "pdf": {".pdf"},
    "pptx": {".pptx"},
    "image": {".jpg", ".jpeg", ".png", ".webp"},
}

TOOL_INPUT_TYPES = {
    "compress_pdf": "pdf",
    "merge_pdf": "pdf",
    "split_pdf": "pdf",
    "remove_pdf_pages": "pdf",
    "rotate_pdf": "pdf",
    "reorder_pdf": "pdf",
    "pdf_to_images": "pdf",
    "image_to_pdf": "image",
    "shrink_presentation": "pptx",
    "pptx_to_pdf": "pptx",
    "pptx_to_images": "pptx",
    "watermark_pdf": "pdf",
    "watermark_presentation": "pptx",
    "resize_image": "image",
    "make_it_smaller": "image",
}

TOOL_EXTRA_INPUT = {"watermark_pdf": "image", "watermark_presentation": "image"}


def _input_extensions(tool_id: str) -> set:
    if tool_id == "make_it_smaller":
        return {".pdf", ".pptx", ".jpg", ".jpeg", ".png", ".webp"}
    return ALLOWED_EXTENSIONS.get(TOOL_INPUT_TYPES.get(tool_id, "pdf"), set())


def _ip_hash(request: Request) -> Optional[str]:
    ip = request.client.host if request.client else None
    if not ip:
        return None
    return hashlib.sha256(ip.encode()).hexdigest()[:16]


def _active_jobs_for_ip(ip_hash: str) -> int:
    conn = get_conn()
    row = conn.execute(
        "SELECT COUNT(*) AS c FROM jobs WHERE ip_hash = ? AND status IN ('queued', 'processing')",
        (ip_hash,),
    ).fetchone()
    return row["c"] if row else 0


@router.post("/jobs")
async def create_job_endpoint(
    request: Request,
    tool: str = Form(...),
    files: list[UploadFile] = File(...),
    options: str = Form("{}"),
):
    tool_id = None
    for cat, tools in TOOL_CATEGORIES.items():
        for slug, tid in tools.items():
            if tid == tool:
                tool_id = tid
                break
    if not tool_id:
        return JSONResponse({"detail": "Unknown tool."}, status_code=400)

    try:
        params = json.loads(options or "{}")
    except json.JSONDecodeError:
        params = {}

    input_type = TOOL_INPUT_TYPES.get(tool_id, "pdf")
    if tool_id == "make_it_smaller":
        max_size = MAX_FILE_SIZE_PPTX
    else:
        max_size = {"pdf": MAX_FILE_SIZE_PDF, "pptx": MAX_FILE_SIZE_PPTX, "image": MAX_FILE_SIZE_IMAGE}.get(input_type, MAX_FILE_SIZE_PDF)

    if not files:
        return JSONResponse({"detail": "No files uploaded."}, status_code=400)

    if len(files) > MAX_MERGE_FILES:
        return JSONResponse({"detail": f"Maximum {MAX_MERGE_FILES} files per job."}, status_code=400)

    allowed = _input_extensions(tool_id)
    extra_allowed = ALLOWED_EXTENSIONS.get(TOOL_EXTRA_INPUT.get(tool_id, ""), set())

    main_files = []
    extra_files = []
    for f in files:
        import os
        ext = os.path.splitext(f.filename or "")[1].lower()
        if ext in allowed:
            main_files.append(f)
        elif extra_allowed and ext in extra_allowed:
            extra_files.append(f)
        else:
            return JSONResponse({"detail": f"Unsupported file type: {f.filename}"}, status_code=400)

    if not main_files:
        return JSONResponse({"detail": "No valid files uploaded for this tool."}, status_code=400)

    for f in main_files + extra_files:
        content = await f.read()
        if len(content) > max_size:
            return JSONResponse({"detail": f"{f.filename} exceeds the maximum allowed size."}, status_code=413)
        f.content = content

    h = _ip_hash(request)
    if h and _active_jobs_for_ip(h) >= MAX_ACTIVE_JOBS_PER_IP:
        return JSONResponse({"detail": "You already have processing jobs running. Wait for them to finish."}, status_code=429)

    from app.jobs.worker import _get_job_class
    job_class = _get_job_class(tool_id)
    output_format = params.get("output_format")
    job_id = create_job(tool_id, job_class=job_class, ip_hash=h,
                        input_format=input_type, output_format=output_format,
                        params=json.dumps(params))

    for f in main_files + extra_files:
        save_upload(job_id, f.content, f.filename)

    return JSONResponse({"job_id": job_id, "status": "queued"})