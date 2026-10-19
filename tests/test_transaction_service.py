import pytest
import uuid
from datetime import date
from decimal import Decimal
from sqlmodel import Session, select

from app.core.exceptions import EntityNotFoundError
from app.models.account import Account
from app.models.category import Category
from app.models.transaction import TransactionType
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.services.transaction_service import TransactionService


def test_create_transaction_success(session: Session) -> None:
    # 1. Fetch seeded database rows
    account = session.exec(select(Account)).first()
    category = session.exec(select(Category)).first()
    assert account is not None
    assert category is not None

    service = TransactionService()
    payload = TransactionCreate(
        amount=Decimal("45.50"),
        date=date(2026, 7, 25),
        description="Coffee and Bakery",
        transaction_type=TransactionType.EXPENSE,
        notes="Out with friends",
        account_id=account.id,
        category_id=category.id
    )

    # 2. Execute service operation
    transaction = service.create_transaction(session, payload)

    # 3. Assert correct properties
    assert transaction.id is not None
    assert transaction.amount == Decimal("45.50")
    assert transaction.description == "Coffee and Bakery"
    assert transaction.transaction_type == TransactionType.EXPENSE
    assert transaction.account_id == account.id
    assert transaction.category_id == category.id


def test_create_transaction_invalid_relation(session: Session) -> None:
    category = session.exec(select(Category)).first()
    assert category is not None

    service = TransactionService()
    payload = TransactionCreate(
        amount=Decimal("100.00"),
        date=date(2026, 7, 25),
        description="Gift",
        transaction_type=TransactionType.INCOME,
        account_id=uuid.uuid4(),  # Random invalid UUID
        category_id=category.id
    )

    # Validate that exception is raised
    with pytest.raises(EntityNotFoundError) as exc_info:
        service.create_transaction(session, payload)
    assert "Account" in exc_info.value.message


def test_account_balance_calculation(session: Session) -> None:
    account = session.exec(select(Account)).first()
    category = session.exec(select(Category)).first()
    assert account is not None
    assert category is not None

    service = TransactionService()

    # Create one Income and one Expense
    service.create_transaction(session, TransactionCreate(
        amount=Decimal("1500.00"),
        date=date(2026, 7, 25),
        description="Monthly Salary",
        transaction_type=TransactionType.INCOME,
        account_id=account.id,
        category_id=category.id
    ))

    service.create_transaction(session, TransactionCreate(
        amount=Decimal("350.25"),
        date=date(2026, 7, 25),
        description="Electric Utility",
        transaction_type=TransactionType.EXPENSE,
        account_id=account.id,
        category_id=category.id
    ))

    # Calculate net balance
    balance = service.repository.get_account_balance(session, account.id)
    assert balance == Decimal("1149.75")
