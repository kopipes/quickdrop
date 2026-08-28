import asyncio
import datetime
import logging

from app.db.database import expire_jobs, mark_interrupted, get_conn
from app.config import CLEANUP_INTERVAL_SECONDS
from app.services.storage import cleanup_job

logger = logging.getLogger("cleanup")


async def cleanup_loop():
    while True:
        try:
            await asyncio.to_thread(run_cleanup)
        except Exception as e:
            logger.error("Cleanup error: %s", e)
        await asyncio.sleep(CLEANUP_INTERVAL_SECONDS)


def run_cleanup():
    try:
        mark_interrupted()
    except Exception as e:
        logger.error("mark_interrupted error: %s", e)
    try:
        expire_jobs()
    except Exception as e:
        logger.error("expire_jobs error: %s", e)
    conn = get_conn()
    rows = conn.execute(
        "SELECT id FROM jobs WHERE status IN ('expired', 'failed')"
    ).fetchall()
    for row in rows:
        cleanup_job(row["id"])