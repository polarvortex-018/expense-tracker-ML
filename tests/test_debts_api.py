import uuid
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from app.models.account import Account
from app.models.transaction import Transaction, TransactionType
from app.models.debt import Debt, DebtType


def test_create_lent_debt(client: TestClient, session: Session):
    # Get initial account
    account = session.exec(select(Account)).first()
    assert account is not None

    payload = {
        "person_name": "Alice",
        "amount": "100.50",
        "type": "lent",
        "description": "Lunch money",
        "account_id": str(account.id)
    }

    response = client.post("/api/v1/debts/", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["person_name"] == "Alice"
    assert Decimal(data["amount"]) == Decimal("100.50")
    assert data["type"] == "lent"
    assert data["is_settled"] is False
    assert data["transaction_id"] is not None

    # Check auto-created transaction
    tx_id = uuid.UUID(data["transaction_id"])
    tx = session.get(Transaction, tx_id)
    assert tx is not None
    assert tx.transaction_type == TransactionType.EXPENSE
    assert tx.amount == Decimal("100.50")


def test_create_borrowed_debt(client: TestClient, session: Session):
    account = session.exec(select(Account)).first()
    assert account is not None

    payload = {
        "person_name": "Bob",
        "amount": "250.00",
        "type": "borrowed",
        "description": "Car repair loan",
        "account_id": str(account.id)
    }

    response = client.post("/api/v1/debts/", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["person_name"] == "Bob"
    assert data["type"] == "borrowed"
    assert data["is_settled"] is False

    tx_id = uuid.UUID(data["transaction_id"])
    tx = session.get(Transaction, tx_id)
    assert tx is not None
    assert tx.transaction_type == TransactionType.INCOME


def test_settle_lent_debt(client: TestClient, session: Session):
    account = session.exec(select(Account)).first()

    # Create debt first
    create_res = client.post("/api/v1/debts/", json={
        "person_name": "Charlie",
        "amount": "50.00",
        "type": "lent",
        "account_id": str(account.id)
    })
    debt_id = create_res.json()["id"]

    # Settle debt
    settle_res = client.post(f"/api/v1/debts/{debt_id}/settle", json={
        "account_id": str(account.id)
    })
    assert settle_res.status_code == 200
    data = settle_res.json()
    assert data["is_settled"] is True

    # Settle again should fail
    fail_res = client.post(f"/api/v1/debts/{debt_id}/settle", json={
        "account_id": str(account.id)
    })
    assert fail_res.status_code == 400


def test_delete_debt(client: TestClient, session: Session):
    account = session.exec(select(Account)).first()

    create_res = client.post("/api/v1/debts/", json={
        "person_name": "David",
        "amount": "30.00",
        "type": "lent",
        "account_id": str(account.id)
    })
    debt_id = create_res.json()["id"]

    del_res = client.delete(f"/api/v1/debts/{debt_id}")
    assert del_res.status_code == 204

    # Verify deleted
    get_res = client.get("/api/v1/debts/")
    debts = get_res.json()
    assert not any(d["id"] == debt_id for d in debts)
