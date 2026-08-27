import asyncio
import json
import datetime
import logging
from pathlib import Path

from app.db.database import claim_next_job, update_job, record_usage, log_event
from app.services.storage import get_input_path, get_input_files, get_output_files, save_output, cleanup_job
from app.config import (
    TEMP_DIR, JOB_TIMEOUT_SECONDS, RETENTION_MINUTES, CONCURRENCY_LIGHT, CONCURRENCY_MEDIUM, CONCURRENCY_HEAVY,
    TOOL_NAMES,
)
from app.engines.pdf_engine import (
    compress_pdf, merge_pdfs, split_pdf, remove_pages, rotate_pdf,
    image_to_pdf, pdf_to_images, reorder_pdf, make_zip, EngineError,
)
from app.engines.presentation_engine import shrink_presentation, pptx_to_pdf, pptx_to_images
from app.engines.watermark_engine import watermark_pdf, watermark_presentation
from app.engines.image_engine import resize_image
from app.engines.smaller_engine import make_it_smaller, resolve_target

logger = logging.getLogger("worker")


TOOL_HANDLERS = {}



def _params(job: dict) -> dict:
    raw = job.get("params")
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except Exception:
        return {}

def _register(tool_id: str, handler):
    TOOL_HANDLERS[tool_id] = handler


def _get_job_class(tool: str) -> str:
    heavy_tools = {"shrink_presentation", "pptx_to_pdf", "pptx_to_images", "watermark_presentation"}
    medium_tools = {"compress_pdf", "pdf_to_images", "watermark_pdf", "merge_pdf"}
    if tool in heavy_tools:
        return "heavy"
    if tool in medium_tools:
        return "medium"
    return "light"


def _get_concurrency_limit(job_class: str) -> int:
    return {"light": CONCURRENCY_LIGHT, "medium": CONCURRENCY_MEDIUM, "heavy": CONCURRENCY_HEAVY}.get(job_class, 2)


_semaphores = {
    "light": asyncio.Semaphore(CONCURRENCY_LIGHT),
    "medium": asyncio.Semaphore(CONCURRENCY_MEDIUM),
    "heavy": asyncio.Semaphore(CONCURRENCY_HEAVY),
}


async def _process_job(job: dict):
    tool = job["tool"]
    job_id = job["id"]
    job_class = job.get("job_class") or _get_job_class(tool)

    async with _semaphores[job_class]:
        try:
            handler = TOOL_HANDLERS.get(tool)
            if not handler:
                raise EngineError(f"Unknown tool: {tool}", "QD-TOOL-UNKNOWN")

            input_path = get_input_path(job_id, ".pdf" if tool in ("watermark_pdf",) else (".pptx" if tool in ("watermark_presentation",) else None))
            all_inputs = get_input_files(job_id)
            output_dir = TEMP_DIR / "jobs" / job_id / "output"
            output_dir.mkdir(parents=True, exist_ok=True)

            result = await asyncio.to_thread(handler, job_id, input_path, all_inputs, output_dir, job)

            if result:
                output_size = result.get("output_size", 0)
                output_filename = result.get("filename", "result.pdf")
                if isinstance(result, dict):
                    output_size = result.get("output_size", 0)
                    output_format = result.get("output_format", job.get("output_format"))
                else:
                    output_size = 0
                    output_format = None
            else:
                output_files = get_output_files(job_id)
                output_size = sum(f.stat().st_size for f in output_files) if output_files else 0
                output_format = output_files[0].suffix.lstrip(".") if output_files else None

            completed_at = datetime.datetime.utcnow().isoformat()
            created = datetime.datetime.fromisoformat(job["created_at"])
            processing_time_ms = int((datetime.datetime.fromisoformat(completed_at) - created).total_seconds() * 1000)
            expires_at = (datetime.datetime.utcnow() + datetime.timedelta(minutes=RETENTION_MINUTES)).isoformat()

            update_job(job_id,
                       status="completed",
                       completed_at=completed_at,
                       expires_at=expires_at,
                       output_size=output_size,
                       output_format=output_format,
                       processing_time_ms=processing_time_ms)

            job["status"] = "completed"
            job["processing_time_ms"] = processing_time_ms
            record_usage(job)
            log_event("job_completed", f"Job {job_id} ({tool}) completed", "info")

        except EngineError as e:
            update_job(job_id, status="failed", error_code=e.code, error_message=e.message,
                       completed_at=datetime.datetime.utcnow().isoformat())
            job["status"] = "failed"
            record_usage(job)
            log_event("job_failed", f"Job {job_id} ({tool}) failed: {e.message}", "warning")

        except Exception as e:
            logger.exception("Unhandled error processing job %s", job_id)
            update_job(job_id, status="failed", error_code="QD-INTERNAL",
                       error_message="An unexpected error occurred. Please try again.",
                       completed_at=datetime.datetime.utcnow().isoformat())

        finally:
            pass


def _register_handlers():
    _register("compress_pdf", _handle_compress_pdf)
    _register("merge_pdf", _handle_merge_pdf)
    _register("split_pdf", _handle_split_pdf)
    _register("remove_pdf_pages", _handle_remove_pages)
    _register("rotate_pdf", _handle_rotate_pdf)
    _register("image_to_pdf", _handle_image_to_pdf)
    _register("pdf_to_images", _handle_pdf_to_images)
    _register("reorder_pdf", _handle_reorder_pdf)
    _register("shrink_presentation", _handle_shrink_presentation)
    _register("pptx_to_pdf", _handle_pptx_to_pdf)
    _register("pptx_to_images", _handle_pptx_to_images)
    _register("watermark_pdf", _handle_watermark_pdf)
    _register("watermark_presentation", _handle_watermark_presentation)
    _register("resize_image", _handle_resize_image)
    _register("make_it_smaller", _handle_make_it_smaller)


def _handle_compress_pdf(job_id, input_path, all_inputs, output_dir, job):
    params = _params(job)
    preset = params.get("preset", "balanced")
    if not input_path:
        raise EngineError("No input file found.", "QD-UPLOAD")
    out = output_dir / "compressed.pdf"
    compress_pdf(input_path, out, preset)
    return {"output_size": out.stat().st_size, "filename": "compressed.pdf", "output_format": "pdf"}


def _handle_merge_pdf(job_id, input_path, all_inputs, output_dir, job):
    if len(all_inputs) < 2:
        raise EngineError("Please upload at least two PDFs to merge.", "QD-MERGE-PDFS")
    out = output_dir / "merged.pdf"
    merge_pdfs(all_inputs, out)
    return {"output_size": out.stat().st_size, "filename": "merged.pdf", "output_format": "pdf"}


def _handle_split_pdf(job_id, input_path, all_inputs, output_dir, job):
    params = _params(job)
    ranges = params.get("ranges")
    every_page = params.get("every_page", False)
    if not input_path:
        raise EngineError("No input file found.", "QD-UPLOAD")
    if every_page:
        split_pdf(input_path, output_dir, every_page=True)
        zip_path = output_dir / "pages.zip"
        make_zip(get_output_files(job_id), zip_path)
        return {"output_size": zip_path.stat().st_size, "filename": "pages.zip", "output_format": "zip"}
    else:
        split_pdf(input_path, output_dir, ranges=ranges)
        files = get_output_files(job_id)
        if len(files) == 1:
            return {"output_size": files[0].stat().st_size, "filename": files[0].name, "output_format": "pdf"}
        zip_path = output_dir / "split.zip"
        make_zip(files, zip_path)
        return {"output_size": zip_path.stat().st_size, "filename": "split.zip", "output_format": "zip"}


def _handle_remove_pages(job_id, input_path, all_inputs, output_dir, job):
    params = _params(job)
    pages = params.get("pages", [])
    if not input_path:
        raise EngineError("No input file found.", "QD-UPLOAD")
    out = output_dir / "modified.pdf"
    remove_pages(input_path, out, pages)
    return {"output_size": out.stat().st_size, "filename": "modified.pdf", "output_format": "pdf"}


def _handle_rotate_pdf(job_id, input_path, all_inputs, output_dir, job):
    params = _params(job)
    pages = params.get("pages", [])
    rotation = params.get("rotation", 90)
    if not input_path:
        raise EngineError("No input file found.", "QD-UPLOAD")
    out = output_dir / "rotated.pdf"
    rotate_pdf(input_path, out, pages, rotation)
    return {"output_size": out.stat().st_size, "filename": "rotated.pdf", "output_format": "pdf"}


def _handle_image_to_pdf(job_id, input_path, all_inputs, output_dir, job):
    params = _params(job)
    page_size = params.get("page_size", "auto")
    orientation = params.get("orientation", "auto")
    margin = params.get("margin", "none")
    if not all_inputs:
        raise EngineError("No images found.", "QD-UPLOAD")
    out = output_dir / "output.pdf"
    image_to_pdf(all_inputs, out, page_size, orientation, margin)
    return {"output_size": out.stat().st_size, "filename": "output.pdf", "output_format": "pdf"}


def _handle_pdf_to_images(job_id, input_path, all_inputs, output_dir, job):
    params = _params(job)
    fmt = params.get("format", "png")
    resolution = params.get("resolution", "standard")
    if not input_path:
        raise EngineError("No input file found.", "QD-UPLOAD")
    pdf_to_images(input_path, output_dir, fmt, resolution)
    files = get_output_files(job_id)
    if len(files) == 1:
        return {"output_size": files[0].stat().st_size, "filename": files[0].name, "output_format": fmt}
    zip_path = output_dir / "images.zip"
    make_zip(files, zip_path)
    return {"output_size": zip_path.stat().st_size, "filename": "images.zip", "output_format": "zip"}


def _handle_reorder_pdf(job_id, input_path, all_inputs, output_dir, job):
    params = _params(job)
    new_order = params.get("order", [])
    if not input_path:
        raise EngineError("No input file found.", "QD-UPLOAD")
    out = output_dir / "reordered.pdf"
    reorder_pdf(input_path, out, new_order)
    return {"output_size": out.stat().st_size, "filename": "reordered.pdf", "output_format": "pdf"}


def _handle_shrink_presentation(job_id, input_path, all_inputs, output_dir, job):
    params = _params(job)
    preset = params.get("preset", "balanced")
    if not input_path:
        raise EngineError("No input file found.", "QD-UPLOAD")
    out = output_dir / "shrinked.pptx"
    shrink_presentation(input_path, out, preset)
    return {"output_size": out.stat().st_size, "filename": "shrinked.pptx", "output_format": "pptx"}


def _handle_pptx_to_pdf(job_id, input_path, all_inputs, output_dir, job):
    if not input_path:
        raise EngineError("No input file found.", "QD-UPLOAD")
    out = output_dir / "converted.pdf"
    pptx_to_pdf(input_path, out)
    return {"output_size": out.stat().st_size, "filename": "converted.pdf", "output_format": "pdf"}


def _handle_pptx_to_images(job_id, input_path, all_inputs, output_dir, job):
    params = _params(job)
    fmt = params.get("format", "png")
    resolution = params.get("resolution", "standard")
    if not input_path:
        raise EngineError("No input file found.", "QD-UPLOAD")
    pptx_to_images(input_path, output_dir, fmt, resolution)
    files = get_output_files(job_id)
    zip_path = output_dir / "slides.zip"
    make_zip(files, zip_path)
    return {"output_size": zip_path.stat().st_size, "filename": "slides.zip", "output_format": "zip"}


def _handle_watermark_pdf(job_id, input_path, all_inputs, output_dir, job):
    params = _params(job)
    wm_type = params.get("watermark_type", "text")
    text = params.get("text", "")
    position = params.get("position", "center")
    opacity = params.get("opacity", 0.3)
    size = params.get("size", "medium")
    rotation = params.get("rotation", 0)
    apply_to = params.get("apply_to", "all")
    selected_pages = params.get("selected_pages")
    if not input_path:
        raise EngineError("No input file found.", "QD-UPLOAD")
    if not input_path.suffix.lower() == ".pdf":
        raise EngineError("No PDF found.", "QD-WATERMARK-PDF")
    image_bytes = None
    if wm_type == "image":
        for f in all_inputs:
            if f.suffix.lower() in (".png", ".jpg", ".jpeg"):
                image_bytes = f.read_bytes()
                break
        if not image_bytes:
            raise EngineError("No watermark image found.", "QD-WATERMARK-IMG")
    out = output_dir / "watermarked.pdf"
    watermark_pdf(input_path, out, wm_type, text, image_bytes, position, opacity, size, rotation, apply_to, selected_pages)
    return {"output_size": out.stat().st_size, "filename": "watermarked.pdf", "output_format": "pdf"}


def _handle_watermark_presentation(job_id, input_path, all_inputs, output_dir, job):
    params = _params(job)
    wm_type = params.get("watermark_type", "text")
    text = params.get("text", "")
    position = params.get("position", "center")
    opacity = params.get("opacity", 0.3)
    size = params.get("size", "medium")
    rotation = params.get("rotation", 0)
    apply_to = params.get("apply_to", "all")
    selected_slides = params.get("selected_slides")
    if not input_path:
        raise EngineError("No input file found.", "QD-UPLOAD")
    if not input_path.suffix.lower() == ".pptx":
        raise EngineError("No PPTX found.", "QD-WATERMARK-PPTX")
    image_bytes = None
    if wm_type == "image":
        for f in all_inputs:
            if f.suffix.lower() in (".png", ".jpg", ".jpeg"):
                image_bytes = f.read_bytes()
                break
        if not image_bytes:
            raise EngineError("No watermark image found.", "QD-WATERMARK-IMG")
    out = output_dir / "watermarked.pptx"
    watermark_presentation(input_path, out, wm_type, text, image_bytes, position, opacity, size, rotation, apply_to, selected_slides)
    return {"output_size": out.stat().st_size, "filename": "watermarked.pptx", "output_format": "pptx"}


def _handle_resize_image(job_id, input_path, all_inputs, output_dir, job):
    params = _params(job)
    width = params.get("width", 0)
    height = params.get("height", 0)
    percentage = params.get("percentage", 0)
    max_dimension = params.get("max_dimension", 0)
    quality = params.get("quality", 85)
    if not input_path:
        raise EngineError("No input file found.", "QD-UPLOAD")
    fmt = params.get("format", "original")
    ext = fmt if fmt != "original" else input_path.suffix.lower()
    if ext not in (".jpg", ".jpeg", ".png", ".webp"):
        ext = ".jpg"
    out = output_dir / f"resized{ext}"
    resize_image(input_path, out, width, height, percentage, max_dimension, quality)
    return {"output_size": out.stat().st_size, "filename": f"resized{ext}", "output_format": ext.lstrip(".")}


def _handle_make_it_smaller(job_id, input_path, all_inputs, output_dir, job):
    params = _params(job)
    target = params.get("target", "5mb")
    target_bytes = resolve_target(target)
    if not input_path:
        raise EngineError("No input file found.", "QD-UPLOAD")
    ext = input_path.suffix.lower()
    out = output_dir / f"optimized{ext}"
    make_it_smaller(input_path, out, target_bytes)
    out = output_dir / f"optimized{ext}"
    if not out.exists():
        raise EngineError("Optimization failed to produce output.", "QD-SMALLER-OUT")
    return {"output_size": out.stat().st_size, "filename": f"optimized{ext}", "output_format": ext.lstrip(".")}


_register_handlers()


async def worker_loop():
    while True:
        try:
            job = claim_next_job()
            if job:
                asyncio.create_task(_process_job(job))
            else:
                await asyncio.sleep(1)
        except Exception as e:
            logger.exception("Worker loop error")
            await asyncio.sleep(5)