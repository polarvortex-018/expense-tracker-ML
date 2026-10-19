from fastapi import status
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from app.models.account import Account, AccountType
from app.models.category import Category
from app.models.transaction import Transaction, TransactionType
import uuid
import datetime


def test_api_create_account_success(client: TestClient, session: Session) -> None:
    payload = {
        "name": "Investments Brokerage",
        "type": "Savings"
    }
    
    response = client.post("/api/v1/accounts/", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    
    data = response.json()
    assert data["name"] == "Investments Brokerage"
    assert data["type"] == "Savings"
    assert "id" in data

    # Verify db
    db_acc = session.exec(select(Account).where(Account.name == "Investments Brokerage")).first()
    assert db_acc is not None
    assert db_acc.type == AccountType.SAVINGS


def test_api_create_account_duplicate_fails(client: TestClient, session: Session) -> None:
    # Pre-seed account
    seeded = Account(name="Duplicate Account", type=AccountType.CHECKING)
    session.add(seeded)
    session.commit()

    payload = {
        "name": "Duplicate Account",
        "type": "Checking"
    }

    response = client.post("/api/v1/accounts/", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already exists" in response.json()["detail"]


def test_api_create_category_success(client: TestClient, session: Session) -> None:
    payload = {
        "name": "Streaming Subscriptions"
    }

    response = client.post("/api/v1/categories/", json=payload)
    assert response.status_code == status.HTTP_201_CREATED

    data = response.json()
    assert data["name"] == "Streaming Subscriptions"
    assert "id" in data

    # Verify db
    db_cat = session.exec(select(Category).where(Category.name == "Streaming Subscriptions")).first()
    assert db_cat is not None


def test_api_create_category_duplicate_fails(client: TestClient, session: Session) -> None:
    # Pre-seed category
    seeded = Category(name="Duplicate Category")
    session.add(seeded)
    session.commit()

    payload = {
        "name": "Duplicate Category"
    }

    response = client.post("/api/v1/categories/", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already exists" in response.json()["detail"]


def test_api_delete_account_success(client: TestClient, session: Session) -> None:
    acc = Account(name="Unused Account", type=AccountType.SAVINGS)
    session.add(acc)
    session.commit()

    response = client.delete(f"/api/v1/accounts/{acc.id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    db_acc = session.get(Account, acc.id)
    assert db_acc is None


def test_api_delete_account_blocked_by_transactions(client: TestClient, session: Session) -> None:
    acc = Account(name="Used Account", type=AccountType.CHECKING)
    cat = Category(name="Any Category")
    session.add(acc)
    session.add(cat)
    session.commit()

    tx = Transaction(
        amount=10.00,
        date=datetime.date(2026, 7, 25),
        description="Linked tx",
        transaction_type=TransactionType.EXPENSE,
        account_id=acc.id,
        category_id=cat.id
    )
    session.add(tx)
    session.commit()

    response = client.delete(f"/api/v1/accounts/{acc.id}")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "active transactions" in response.json()["detail"]

    db_acc = session.get(Account, acc.id)
    assert db_acc is not None


def test_api_delete_category_success(client: TestClient, session: Session) -> None:
    cat = Category(name="Unused Category")
    session.add(cat)
    session.commit()

    response = client.delete(f"/api/v1/categories/{cat.id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    db_cat = session.get(Category, cat.id)
    assert db_cat is None


def test_api_delete_category_blocked_by_transactions(client: TestClient, session: Session) -> None:
    acc = Account(name="Any Account", type=AccountType.CHECKING)
    cat = Category(name="Used Category")
    session.add(acc)
    session.add(cat)
    session.commit()

    tx = Transaction(
        amount=10.00,
        date=datetime.date(2026, 7, 25),
        description="Linked tx",
        transaction_type=TransactionType.EXPENSE,
        account_id=acc.id,
        category_id=cat.id
    )
    session.add(tx)
    session.commit()

    response = client.delete(f"/api/v1/categories/{cat.id}")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "active transactions" in response.json()["detail"]

    db_cat = session.get(Category, cat.id)
    assert db_cat is not None


def test_api_update_account_success(client: TestClient, session: Session) -> None:
    acc = Account(name="Old Name", type=AccountType.CHECKING)
    session.add(acc)
    session.commit()

    payload = {
        "name": "New Name",
        "type": "Savings"
    }

    response = client.put(f"/api/v1/accounts/{acc.id}", json=payload)
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert data["name"] == "New Name"
    assert data["type"] == "Savings"

    # Verify db
    db_acc = session.get(Account, acc.id)
    assert db_acc is not None
    assert db_acc.name == "New Name"
    assert db_acc.type == AccountType.SAVINGS


def test_api_update_account_duplicate_fails(client: TestClient, session: Session) -> None:
    acc1 = Account(name="Target Account", type=AccountType.CHECKING)
    acc2 = Account(name="Taken Name", type=AccountType.CHECKING)
    session.add(acc1)
    session.add(acc2)
    session.commit()

    payload = {
        "name": "Taken Name"
    }

    response = client.put(f"/api/v1/accounts/{acc1.id}", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already exists" in response.json()["detail"]


def test_api_update_category_success(client: TestClient, session: Session) -> None:
    cat = Category(name="Old Cat")
    session.add(cat)
    session.commit()

    payload = {
        "name": "New Cat"
    }

    response = client.put(f"/api/v1/categories/{cat.id}", json=payload)
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert data["name"] == "New Cat"

    # Verify db
    db_cat = session.get(Category, cat.id)
    assert db_cat is not None
    assert db_cat.name == "New Cat"


def test_api_update_category_duplicate_fails(client: TestClient, session: Session) -> None:
    cat1 = Category(name="Target Cat")
    cat2 = Category(name="Taken Cat Name")
    session.add(cat1)
    session.add(cat2)
    session.commit()

    payload = {
        "name": "Taken Cat Name"
    }

    response = client.put(f"/api/v1/categories/{cat1.id}", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already exists" in response.json()["detail"]


