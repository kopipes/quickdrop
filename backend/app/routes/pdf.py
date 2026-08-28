import tempfile
from pathlib import Path

import fitz

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.config import MAX_FILE_SIZE_PDF

router = APIRouter(prefix="/api", tags=["pdf"])

CHUNK_SIZE = 64 * 1024


@router.post("/pdf/pages")
async def pdf_pages(files: list[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No file uploaded.")
    f = files[0]
    total = 0
    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp_path = Path(tmp.name)
            while True:
                chunk = await f.read(CHUNK_SIZE)
                if not chunk:
                    break
                total += len(chunk)
                if total > MAX_FILE_SIZE_PDF:
                    tmp_path.unlink(missing_ok=True)
                    raise HTTPException(status_code=413, detail="File exceeds the maximum allowed size.")
                tmp.write(chunk)
        try:
            doc = fitz.open(tmp_path)
            pages = doc.page_count
            doc.close()
        except Exception:
            raise HTTPException(status_code=400, detail="We couldn't read this PDF. It may be encrypted or damaged.")
        return {"pages": pages}
    finally:
        await f.close()
        if "tmp_path" in locals():
            tmp_path.unlink(missing_ok=True)