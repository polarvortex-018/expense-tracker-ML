from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging
from app.db.vault_manager import vault_manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize and configure logging
    setup_logging()
    
    print("\n" + "="*55)
    print(" [+] Finance Tracker Local-First Engine Starting...")
    print("="*55)
    
    # Run DB auto-creation, Alembic migrations, and seed defaults
    vault_manager.init_active_vault()
    
    print(f" [+] Active Vault: {vault_manager.active_vault_filename}")
    print(f" [+] Data Directory: {settings.DATA_DIR.as_posix()}")
    print(" [+] Schema Migrations: Up-to-Date (Alembic Head)")
    print("="*55 + "\n")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register custom exception mappings
register_exception_handlers(app)

# Include v1 REST API router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["status"])
def read_root() -> dict:
    """Simple health check endpoint."""
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "active_vault": vault_manager.active_vault_filename,
        "api_documentation": "/docs"
    }
