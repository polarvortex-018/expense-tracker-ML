from typing import Generator
from sqlmodel import Session
from app.db.vault_manager import vault_manager


def get_session() -> Generator[Session, None, None]:
    """FastAPI dependency for injecting SQLModel database sessions from active vault."""
    with Session(vault_manager.engine) as session:
        yield session
