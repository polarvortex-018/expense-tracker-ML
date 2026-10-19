import shutil
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Finance Tracker"
    API_V1_STR: str = "/api/v1"

    # Base path of the application (root of the workspace)
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    BACKUP_DIR: Path = BASE_DIR / "backups"
    DATABASE_NAME: str = "finance.db"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

    def __init__(self, **values):
        super().__init__(**values)
        self._ensure_env_file()

    def _ensure_env_file(self) -> None:
        """Auto-creates .env from .env.example if missing."""
        env_path = self.BASE_DIR / ".env"
        example_path = self.BASE_DIR / ".env.example"
        if not env_path.exists() and example_path.exists():
            try:
                shutil.copy2(example_path, env_path)
            except Exception:
                pass

    @property
    def DATABASE_URL(self) -> str:
        """Dynamically build the SQLite connection URL, ensuring directories exist."""
        self.DATA_DIR.mkdir(parents=True, exist_ok=True)
        self.BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        db_path = self.DATA_DIR / self.DATABASE_NAME
        return f"sqlite:///{db_path.as_posix()}"


settings = Settings()
