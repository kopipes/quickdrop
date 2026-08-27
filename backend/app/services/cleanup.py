import asyncio
import datetime
import logging

from app.db.database import expire_jobs, mark_interrupted, get_conn
from app.config import CLEANUP_INTERVAL_SECONDS, TEMP_DIR
from app.services.storage import cleanup_job

logger = logging.getLogger("cleanup")


async def cleanup_loop():
    while True:
        try:
            expired = expire_jobs()
            if expired:
                logger.info("Expired %d jobs", expired)
            conn = get_conn()
            rows = conn.execute(
                "SELECT id FROM jobs WHERE status IN ('expired', 'failed') AND completed_at IS NOT NULL"
            ).fetchall()
            for row in rows:
                cleanup_job(row["id"])
        except Exception as e:
            logger.error("Cleanup error: %s", e)
        await asyncio.sleep(CLEANUP_INTERVAL_SECONDS)