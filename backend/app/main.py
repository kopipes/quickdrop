import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import init_db, mark_interrupted
from app.routes.jobs import router as jobs_router
from app.routes.download import router as download_router
from app.routes.health import router as health_router
from app.routes.pdf import router as pdf_router
from app.jobs.worker import worker_loop
from app.services.cleanup import cleanup_loop
from app.config import TOOL_CATEGORIES, ALLOWED_ORIGINS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    mark_interrupted()
    logger.info("QuikDrop backend started")
    import asyncio
    tasks = [
        asyncio.create_task(worker_loop()),
        asyncio.create_task(cleanup_loop()),
    ]
    yield
    for t in tasks:
        t.cancel()
    logger.info("QuikDrop backend stopped")


app = FastAPI(title="QuikDrop API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs_router)
app.include_router(download_router)
app.include_router(health_router)
app.include_router(pdf_router)


@app.get("/api/tools")
async def tools():
    return {"categories": TOOL_CATEGORIES}