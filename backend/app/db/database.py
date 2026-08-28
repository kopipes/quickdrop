from typing import Optional, List, Tuple
import sqlite3
import threading
import uuid
from contextlib import contextmanager

from app.config import DATABASE_URL

_local = threading.local()


def get_conn():
    conn = getattr(_local, "conn", None)
    if conn is None:
        conn = sqlite3.connect(DATABASE_URL, timeout=30, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA busy_timeout=30000")
        conn.execute("PRAGMA foreign_keys=ON")
        _local.conn = conn
    return conn


@contextmanager
def db_cursor():
    conn = get_conn()
    try:
        cur = conn.cursor()
        yield cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise


def init_db():
    with db_cursor() as cur:
        cur.executescript(
            """
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                tool TEXT NOT NULL,
                status TEXT NOT NULL,
                ip_hash TEXT,
                input_size INTEGER DEFAULT 0,
                output_size INTEGER DEFAULT 0,
                input_format TEXT,
                output_format TEXT,
                job_class TEXT DEFAULT 'light',
                filename TEXT,
                params TEXT,
                error_code TEXT,
                error_message TEXT,
                created_at TEXT NOT NULL,
                started_at TEXT,
                completed_at TEXT,
                expires_at TEXT,
                processing_time_ms INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS tool_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tool TEXT NOT NULL,
                created_date TEXT NOT NULL,
                total_jobs INTEGER DEFAULT 0,
                successful_jobs INTEGER DEFAULT 0,
                failed_jobs INTEGER DEFAULT 0,
                avg_processing_time INTEGER DEFAULT 0,
                UNIQUE(tool, created_date)
            );

            CREATE TABLE IF NOT EXISTS system_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT NOT NULL,
                severity TEXT DEFAULT 'info',
                message TEXT,
                created_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
            CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at);
            CREATE INDEX IF NOT EXISTS idx_jobs_expires ON jobs(expires_at);
            """
        )


def create_job(tool: str, job_class: str = "light", ip_hash: Optional[str] = None, input_size: int = 0,
               input_format: Optional[str] = None, output_format: Optional[str] = None, filename: Optional[str] = None,
               params: Optional[str] = None) -> str:
    job_id = uuid.uuid4().hex[:12]
    import datetime
    now = datetime.datetime.utcnow().isoformat()
    with db_cursor() as cur:
        cur.execute(
            """INSERT INTO jobs (id, tool, status, ip_hash, input_size, input_format, output_format,
               job_class, filename, params, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (job_id, tool, "queued", ip_hash, input_size, input_format, output_format,
             job_class, filename, params, now),
        )
    return job_id


def get_job(job_id: str) -> Optional[dict]:
    with db_cursor() as cur:
        row = cur.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
        return dict(row) if row else None


def update_job(job_id: str, **fields):
    if not fields:
        return
    cols = ", ".join(f"{k} = ?" for k in fields)
    with db_cursor() as cur:
        cur.execute(f"UPDATE jobs SET {cols} WHERE id = ?", (*fields.values(), job_id))


def claim_next_job() -> Optional[dict]:
    import datetime
    with db_cursor() as cur:
        row = cur.execute(
            "SELECT * FROM jobs WHERE status = 'queued' ORDER BY created_at ASC LIMIT 1"
        ).fetchone()
        if not row:
            return None
        job = dict(row)
        cur.execute(
            "UPDATE jobs SET status = 'processing', started_at = ? WHERE id = ? AND status = 'queued'",
            (datetime.datetime.utcnow().isoformat(), job["id"]),
        )
        if cur.rowcount == 0:
            return None
        return job


def record_usage(job: dict):
    import datetime
    created_date = datetime.datetime.utcnow().date().isoformat()
    with db_cursor() as cur:
        cur.execute(
            """INSERT INTO tool_usage (tool, created_date, total_jobs)
               VALUES (?, ?, 1)
               ON CONFLICT(tool, created_date) DO UPDATE SET total_jobs = total_jobs + 1""",
            (job["tool"], created_date),
        )
        if job["status"] == "completed":
            cur.execute(
                """UPDATE tool_usage SET successful_jobs = successful_jobs + 1,
                   avg_processing_time = (avg_processing_time * (total_jobs - 1) + ?) / total_jobs
                   WHERE tool = ? AND created_date = ?""",
                (job["processing_time_ms"], job["tool"], created_date),
            )
        elif job["status"] == "failed":
            cur.execute(
                """UPDATE tool_usage SET failed_jobs = failed_jobs + 1
                   WHERE tool = ? AND created_date = ?""",
                (job["tool"], created_date),
            )


def log_event(event_type: str, message: str, severity: str = "info"):
    import datetime
    with db_cursor() as cur:
        cur.execute(
            "INSERT INTO system_events (event_type, severity, message, created_at) VALUES (?, ?, ?, ?)",
            (event_type, severity, message, datetime.datetime.utcnow().isoformat()),
        )


def expire_jobs():
    import datetime
    now = datetime.datetime.utcnow().isoformat()
    with db_cursor() as cur:
        cur.execute("UPDATE jobs SET status = 'expired' WHERE expires_at IS NOT NULL AND expires_at < ? AND status != 'expired'", (now,))
        return cur.rowcount


def mark_interrupted():
    import datetime
    threshold = (datetime.datetime.utcnow() - datetime.timedelta(seconds=300)).isoformat()
    now = datetime.datetime.utcnow().isoformat()
    with db_cursor() as cur:
        cur.execute(
            "UPDATE jobs SET status = 'failed', error_code = 'QD-INTERRUPTED', error_message = 'Processing was interrupted by a server restart.', completed_at = ? WHERE status = 'processing' AND started_at < ?",
            (now, threshold),
        )
