import asyncio
import datetime
import uuid

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.db.database import get_conn, upsert_visitor, active_visitor_count, prune_visitors

router = APIRouter(prefix="/api", tags=["health"])

_heartbeat_lock = asyncio.Lock()


@router.get("/health")
async def health():
    return {"status": "ok", "time": datetime.datetime.utcnow().isoformat()}


@router.get("/visitors")
async def visitors(request: Request):
    """Heartbeat + live count of active visitors (prune occurs periodically by the cleanup loop)."""
    vid = request.cookies.get("qd_visitor")
    if not vid:
        vid = uuid.uuid4().hex
    upsert_visitor(vid)
    count = active_visitor_count()
    # Prune every ~30s to keep the count fresh (throttled with a lock)
    async with _heartbeat_lock:
        try:
            prune_visitors(2)
            count = active_visitor_count()
        except Exception:
            pass
    response = JSONResponse({"active": count, "visitor": vid})
    response.set_cookie(
        key="qd_visitor",
        value=vid,
        max_age=60 * 60 * 24 * 365,
        httponly=True,
        samesite="lax",
        secure=False,
    )
    return response


@router.get("/stats")
async def stats():
    conn = get_conn()
    jobs_today = conn.execute(
        "SELECT COUNT(*) AS c FROM jobs WHERE created_at >= ?",
        (datetime.datetime.utcnow().date().isoformat(),),
    ).fetchone()["c"]
    successful = conn.execute("SELECT COUNT(*) AS c FROM jobs WHERE status = 'completed'").fetchone()["c"]
    failed = conn.execute("SELECT COUNT(*) AS c FROM jobs WHERE status = 'failed'").fetchone()["c"]
    avg_time = conn.execute(
        "SELECT AVG(processing_time_ms) AS a FROM jobs WHERE processing_time_ms > 0"
    ).fetchone()["a"]
    queue = conn.execute("SELECT COUNT(*) AS c FROM jobs WHERE status = 'queued'").fetchone()["c"]
    processing = conn.execute("SELECT COUNT(*) AS c FROM jobs WHERE status = 'processing'").fetchone()["c"]
    usage = conn.execute(
        "SELECT tool, SUM(total_jobs) AS total, SUM(successful_jobs) AS ok FROM tool_usage GROUP BY tool ORDER BY total DESC"
    ).fetchall()
    return {
        "jobs_today": jobs_today,
        "successful": successful,
        "failed": failed,
        "avg_processing_time_ms": int(avg_time or 0),
        "queue": queue,
        "processing": processing,
        "tool_usage": [{"tool": r["tool"], "total": r["total"], "successful": r["ok"]} for r in usage],
    }