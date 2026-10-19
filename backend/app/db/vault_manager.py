import json
import logging
from pathlib import Path
from typing import Generator, List, Dict, Any
from sqlalchemy import event
from sqlmodel import Session, SQLModel, create_engine, select
from alembic.config import Config
from alembic import command

from app.core.config import settings

logger = logging.getLogger("vault_manager")
VAULT_POINTER_FILE = settings.DATA_DIR / "active_vault.json"


class VaultManager:
    """Manages active SQLite database vaults, engine switching, and Alembic migrations."""

    def __init__(self) -> None:
        self.active_vault_filename: str = self._get_saved_active_vault()
        self.engine = None
        self._init_engine(self.active_vault_filename)

    def _get_saved_active_vault(self) -> str:
        settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
        settings.BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        if VAULT_POINTER_FILE.exists():
            try:
                data = json.loads(VAULT_POINTER_FILE.read_text(encoding="utf-8"))
                filename = data.get("active_vault", settings.DATABASE_NAME)
                if (settings.DATA_DIR / filename).exists():
                    return filename
            except Exception as e:
                logger.warning(f"Could not read active_vault.json: {e}")
        return settings.DATABASE_NAME

    def _save_active_vault(self, filename: str) -> None:
        try:
            VAULT_POINTER_FILE.write_text(
                json.dumps({"active_vault": filename}, indent=2),
                encoding="utf-8"
            )
        except Exception as e:
            logger.error(f"Failed to save active_vault.json: {e}")

    def get_vault_path(self, filename: str) -> Path:
        """Resolves path for a vault filename, sanitizing inputs."""
        clean_name = Path(filename).name
        if not clean_name.endswith(".db"):
            clean_name += ".db"
        return settings.DATA_DIR / clean_name

    def _init_engine(self, filename: str) -> None:
        if self.engine:
            self.engine.dispose()

        db_path = self.get_vault_path(filename)
        db_url = f"sqlite:///{db_path.as_posix()}"

        self.engine = create_engine(
            db_url,
            connect_args={"check_same_thread": False}
        )

        @event.listens_for(self.engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record) -> None:
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA synchronous=NORMAL")
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

        self.active_vault_filename = db_path.name
        self._save_active_vault(self.active_vault_filename)

    def run_migrations_for_db(self, filename: str) -> None:
        """Programmatically ensures schema and Alembic migrations for target SQLite database."""
        db_path = self.get_vault_path(filename)
        db_url = f"sqlite:///{db_path.as_posix()}"

        # Ensure all tables exist using SQLModel metadata
        SQLModel.metadata.create_all(self.engine)

        try:
            alembic_ini_path = settings.BASE_DIR / "backend" / "alembic.ini"
            if not alembic_ini_path.exists():
                alembic_ini_path = settings.BASE_DIR / "alembic.ini"

            alembic_cfg = Config(str(alembic_ini_path))
            alembic_cfg.set_main_option("sqlalchemy.url", db_url)

            migrations_dir = settings.BASE_DIR / "backend" / "migrations"
            if not migrations_dir.exists():
                migrations_dir = settings.BASE_DIR / "migrations"

            alembic_cfg.set_main_option("script_location", str(migrations_dir))
            command.stamp(alembic_cfg, "head")
        except Exception as e:
            logger.warning(f"Alembic stamp warning for {filename}: {e}")

    def seed_defaults_if_empty(self, session: Session) -> None:
        """Seeds baseline categories and general bucket if empty."""
        from app.models.category import Category
        from app.models.savings_bucket import SavingsBucket

        # Default Categories
        cat_count = session.exec(select(Category)).first()
        if not cat_count:
            default_categories = [
                Category(name="Food & Dining", color="#ef4444"),
                Category(name="Rent & Housing", color="#3b82f6"),
                Category(name="Utilities", color="#f59e0b"),
                Category(name="Salary & Income", color="#10b981"),
                Category(name="Shopping", color="#8b5cf6"),
                Category(name="Entertainment", color="#ec4899"),
                Category(name="Transportation", color="#06b6d4"),
                Category(name="General", color="#64748b")
            ]
            for cat in default_categories:
                session.add(cat)
            session.commit()

        # Default Savings Bucket
        bucket_count = session.exec(select(SavingsBucket)).first()
        if not bucket_count:
            gen_bucket = SavingsBucket(
                name="General",
                icon="🪣",
                color="#6366f1",
                is_archived=False
            )
            session.add(gen_bucket)
            session.commit()

    def init_active_vault(self) -> None:
        """Runs migrations and default seeding on startup for active vault."""
        logger.info(f"[+] Initializing active vault: {self.active_vault_filename}")
        self.run_migrations_for_db(self.active_vault_filename)
        with Session(self.engine) as session:
            self.seed_defaults_if_empty(session)

    def switch_vault(self, filename: str) -> str:
        """Switches active vault to target filename."""
        db_path = self.get_vault_path(filename)
        self._init_engine(db_path.name)
        self.run_migrations_for_db(db_path.name)
        with Session(self.engine) as session:
            self.seed_defaults_if_empty(session)
        return db_path.name

    def list_vaults(self) -> List[Dict[str, Any]]:
        """Lists all available .db vaults in data directory."""
        vaults = []
        settings.DATA_DIR.mkdir(parents=True, exist_ok=True)

        for file in settings.DATA_DIR.glob("*.db"):
            stat = file.stat()
            vaults.append({
                "filename": file.name,
                "name": file.stem.capitalize(),
                "size_bytes": stat.st_size,
                "updated_at": int(stat.st_mtime),
                "is_active": file.name == self.active_vault_filename
            })

        if not vaults:
            vaults.append({
                "filename": settings.DATABASE_NAME,
                "name": "Finance",
                "size_bytes": 0,
                "updated_at": 0,
                "is_active": True
            })

        return sorted(vaults, key=lambda v: v["name"])


vault_manager = VaultManager()
