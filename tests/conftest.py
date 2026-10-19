import sys
from pathlib import Path

# Add backend directory to path so imports work out-of-the-box
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from app.main import app
from app.db.session import get_session
from app.models import Account, AccountType, Category, Transaction

from sqlalchemy.pool import StaticPool

# Use in-memory database for unit/integration testing
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)


@pytest.fixture(name="session")
def session_fixture() -> Generator[Session, None, None]:
    """Sets up an in-memory SQLModel database, seeding default accounts/categories."""
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        # Seed default categories
        categories = ["Food", "Rent", "Petrol", "Luxuries", "Necessities"]
        for cat_name in categories:
            session.add(Category(name=cat_name))
            
        # Seed default accounts
        accounts = [
            Account(name="Checking", type=AccountType.CHECKING),
            Account(name="Savings", type=AccountType.SAVINGS),
            Account(name="Cash", type=AccountType.CASH),
        ]
        for acc in accounts:
            session.add(acc)
            
        session.commit()
        yield session
        
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="client")
def client_fixture(session: Session) -> Generator[TestClient, None, None]:
    """Generates a FastAPI TestClient with database session overrides."""
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
