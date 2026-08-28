from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.db.database import get_job
from app.services.storage import get_output_files, output_path

router = APIRouter(prefix="/api", tags=["jobs"])


@router.get("/jobs/{job_id}")
async def job_status(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    files = get_output_files(job_id)
    output_files = [{"name": f.name, "size": f.stat().st_size, "url": f"/api/jobs/{job_id}/download/{f.name}"} for f in files]
    return {
        "id": job["id"],
        "tool": job["tool"],
        "status": job["status"],
        "input_size": job["input_size"],
        "output_size": job["output_size"],
        "input_format": job["input_format"],
        "output_format": job["output_format"],
        "error_code": job["error_code"],
        "error_message": job["error_message"],
        "expires_at": job["expires_at"],
        "processing_time_ms": job["processing_time_ms"],
        "output_files": output_files,
    }


@router.get("/jobs/{job_id}/download/{filename}")
async def download_file(job_id: str, filename: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    if job["status"] != "completed":
        raise HTTPException(status_code=404, detail="Result not available.")

    safe_name = Path(filename).name
    path = output_path(job_id, safe_name)
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found.")

    response = FileResponse(path, filename=safe_name, media_type="application/octet-stream")
    return response