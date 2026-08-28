from typing import Optional
from pathlib import Path
import shutil

from app.config import TEMP_DIR


def ensure_job_dir(job_id: str) -> dict[str, Path]:
    d = TEMP_DIR / "jobs" / job_id
    input_dir = d / "input"
    work_dir = d / "work"
    output_dir = d / "output"
    for p in (input_dir, work_dir, output_dir):
        p.mkdir(parents=True, exist_ok=True)
    return {"input": input_dir, "work": work_dir, "output": output_dir}


def save_upload(job_id: str, content: bytes, filename: str) -> Path:
    dirs = ensure_job_dir(job_id)
    ext = Path(filename).suffix.lower()
    existing = list(dirs["input"].glob(f"*{ext}"))
    safe_name = f"input{len(existing) + 1}{ext}"
    path = dirs["input"] / safe_name
    path.write_bytes(content)
    return path


async def save_upload_stream(job_id: str, upload, max_size: int) -> Path:
    """Stream an UploadFile to disk, aborting with ValueError if it exceeds max_size."""
    dirs = ensure_job_dir(job_id)
    ext = Path(upload.filename or "").suffix.lower()
    existing = list(dirs["input"].glob(f"*{ext}"))
    safe_name = f"input{len(existing) + 1}{ext}"
    path = dirs["input"] / safe_name
    total = 0
    try:
        with open(path, "wb") as out:
            while True:
                chunk = await upload.read(64 * 1024)
                if not chunk:
                    break
                total += len(chunk)
                if total > max_size:
                    out.close()
                    path.unlink(missing_ok=True)
                    raise ValueError("file too large")
                out.write(chunk)
    finally:
        await upload.close()
    return path


def output_path(job_id: str, filename: str) -> Path:
    return TEMP_DIR / "jobs" / job_id / "output" / filename


def get_output_files(job_id: str) -> list[Path]:
    d = TEMP_DIR / "jobs" / job_id / "output"
    if d.exists():
        return sorted(d.iterdir())
    return []


def get_input_path(job_id: str, wanted_ext: Optional[str] = None) -> Optional[Path]:
    files = get_input_files(job_id)
    if not files:
        return None
    if wanted_ext:
        for f in files:
            if f.suffix.lower() == wanted_ext.lower():
                return f
        return None
    return files[0]


def get_input_files(job_id: str) -> list[Path]:
    d = TEMP_DIR / "jobs" / job_id / "input"
    if d.exists():
        return sorted(d.iterdir())
    return []


def cleanup_job(job_id: str):
    d = TEMP_DIR / "jobs" / job_id
    if d.exists():
        shutil.rmtree(d, ignore_errors=True)