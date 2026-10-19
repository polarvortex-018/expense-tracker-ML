import uuid
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from app.models.savings_bucket import SavingsBucket
from app.models.transaction import Transaction, TransactionType
from app.models.account import Account
from app.models.category import Category


def test_create_bucket(client: TestClient):
    payload = {
        "name": "Trip to Japan",
        "icon": "✈️",
        "color": "#3b82f6"
    }
    response = client.post("/api/v1/buckets/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Trip to Japan"
    assert data["icon"] == "✈️"
    assert data["color"] == "#3b82f6"
    assert data["is_archived"] is False
    assert float(data["allocated_balance"]) == 0.0


def test_list_buckets(client: TestClient, session: Session):
    response = client.get("/api/v1/buckets/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_update_and_archive_bucket(client: TestClient):
    # Create bucket
    create_res = client.post("/api/v1/buckets/", json={"name": "New Laptop", "icon": "💻"})
    bucket_id = create_res.json()["id"]

    # Update bucket
    update_res = client.put(f"/api/v1/buckets/{bucket_id}", json={"name": "MacBook Pro", "is_archived": True})
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "MacBook Pro"
    assert update_res.json()["is_archived"] is True

    # List without archived
    list_active = client.get("/api/v1/buckets/")
    active_ids = [b["id"] for b in list_active.json()]
    assert bucket_id not in active_ids

    # List including archived
    list_all = client.get("/api/v1/buckets/?include_archived=true")
    all_ids = [b["id"] for b in list_all.json()]
    assert bucket_id in all_ids


def test_transfer_between_buckets(client: TestClient, session: Session):
    # Get or create accounts & categories
    acc = session.exec(select(Account)).first()
    cat = session.exec(select(Category)).first()

    b1_res = client.post("/api/v1/buckets/", json={"name": "Emergency Fund", "icon": "🛡️"})
    b2_res = client.post("/api/v1/buckets/", json={"name": "Vacation Fund", "icon": "🌴"})

    b1_id = b1_res.json()["id"]
    b2_id = b2_res.json()["id"]

    # Seed income into Emergency Fund
    client.post("/api/v1/transactions/", json={
        "amount": 10000.00,
        "date": "2026-07-28",
        "description": "Salary Deposit",
        "transaction_type": "income",
        "account_id": str(acc.id),
        "category_id": str(cat.id),
        "bucket_id": b1_id
    })

    # Perform transfer: Move 3000 from Emergency Fund -> Vacation Fund
    transfer_res = client.post("/api/v1/buckets/transfer", json={
        "from_bucket_id": b1_id,
        "to_bucket_id": b2_id,
        "amount": 3000.00,
        "description": "Allocating to vacation"
    })
    assert transfer_res.status_code == 200

    # Verify bucket balances
    list_buckets = client.get("/api/v1/buckets/").json()
    b1_data = next(b for b in list_buckets if b["id"] == b1_id)
    b2_data = next(b for b in list_buckets if b["id"] == b2_id)

    assert float(b1_data["allocated_balance"]) == 7000.00
    assert float(b2_data["allocated_balance"]) == 3000.00
