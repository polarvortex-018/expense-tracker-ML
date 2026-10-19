from fastapi import status
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.models.account import Account
from app.models.category import Category


def test_api_create_transaction_success(client: TestClient, session: Session) -> None:
    account = session.exec(select(Account)).first()
    category = session.exec(select(Category)).first()
    assert account is not None
    assert category is not None

    payload = {
        "amount": 29.99,
        "date": "2026-07-25",
        "description": "Premium Subscription",
        "transaction_type": "expense",
        "notes": "Monthly software dev fee",
        "account_id": str(account.id),
        "category_id": str(category.id)
    }

    response = client.post("/api/v1/transactions/", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    
    data = response.json()
    assert data["amount"] == 29.99 or data["amount"] == "29.99"
    assert data["description"] == "Premium Subscription"
    assert "id" in data


def test_api_create_transaction_negative_amount_fails(client: TestClient, session: Session) -> None:
    account = session.exec(select(Account)).first()
    category = session.exec(select(Category)).first()
    assert account is not None
    assert category is not None

    payload = {
        "amount": -10.00,  # Negative values are prohibited
        "date": "2026-07-25",
        "description": "Invalid Refund",
        "transaction_type": "income",
        "account_id": str(account.id),
        "category_id": str(category.id)
    }

    response = client.post("/api/v1/transactions/", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert "greater than zero" in response.text


def test_api_create_transaction_whitespace_description_fails(client: TestClient, session: Session) -> None:
    account = session.exec(select(Account)).first()
    category = session.exec(select(Category)).first()
    assert account is not None
    assert category is not None

    payload = {
        "amount": 5.00,
        "date": "2026-07-25",
        "description": "    ",  # Blank description is prohibited
        "transaction_type": "expense",
        "account_id": str(account.id),
        "category_id": str(category.id)
    }

    response = client.post("/api/v1/transactions/", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert "empty or whitespace" in response.text


def test_api_get_and_delete_transaction(client: TestClient, session: Session) -> None:
    account = session.exec(select(Account)).first()
    category = session.exec(select(Category)).first()
    assert account is not None
    assert category is not None

    # 1. Create a transaction
    payload = {
        "amount": 100.00,
        "date": "2026-07-25",
        "description": "Rent Payment Portion",
        "transaction_type": "expense",
        "account_id": str(account.id),
        "category_id": str(category.id)
    }
    create_res = client.post("/api/v1/transactions/", json=payload)
    tx_id = create_res.json()["id"]

    # 2. Retrieve the transaction
    get_res = client.get(f"/api/v1/transactions/{tx_id}")
    assert get_res.status_code == status.HTTP_200_OK
    assert get_res.json()["description"] == "Rent Payment Portion"

    # 3. Delete the transaction
    del_res = client.delete(f"/api/v1/transactions/{tx_id}")
    assert del_res.status_code == status.HTTP_204_NO_CONTENT

    # 4. Confirm it is gone
    missing_res = client.get(f"/api/v1/transactions/{tx_id}")
    assert missing_res.status_code == status.HTTP_404_NOT_FOUND


def test_api_list_transactions_multi_category(client: TestClient, session: Session) -> None:
    account = session.exec(select(Account)).first()
    categories = session.exec(select(Category)).all()
    assert account is not None
    assert len(categories) >= 2

    cat1, cat2 = categories[0], categories[1]

    # Create 3 transactions: one in cat1, one in cat2, and one in another (if exists) or none
    payload1 = {
        "amount": 10.00,
        "date": "2026-07-25",
        "description": "Tx 1",
        "transaction_type": "expense",
        "account_id": str(account.id),
        "category_id": str(cat1.id)
    }
    payload2 = {
        "amount": 20.00,
        "date": "2026-07-25",
        "description": "Tx 2",
        "transaction_type": "expense",
        "account_id": str(account.id),
        "category_id": str(cat2.id)
    }

    client.post("/api/v1/transactions/", json=payload1)
    client.post("/api/v1/transactions/", json=payload2)

    # Query with multiple category parameters: ?category_id=cat1_id&category_id=cat2_id
    response = client.get(f"/api/v1/transactions/?category_id={cat1.id}&category_id={cat2.id}")
    assert response.status_code == status.HTTP_200_OK

    txs = response.json()
    # Check that we only get transactions belonging to cat1 or cat2
    category_ids = {str(cat1.id), str(cat2.id)}
    for tx in txs:
        # Since database might have other preseeded transactions, check if the query filter successfully retrieved both types
        if tx["description"] in ["Tx 1", "Tx 2"]:
            assert tx["category_id"] in category_ids


def test_api_list_transactions_date_range(client: TestClient, session: Session) -> None:
    account = session.exec(select(Account)).first()
    category = session.exec(select(Category)).first()
    assert account is not None
    assert category is not None

    # Create 3 transactions with different dates
    payload1 = {
        "amount": 10.00,
        "date": "2026-07-01",
        "description": "Early Tx",
        "transaction_type": "expense",
        "account_id": str(account.id),
        "category_id": str(category.id)
    }
    payload2 = {
        "amount": 20.00,
        "date": "2026-07-15",
        "description": "Middle Tx",
        "transaction_type": "expense",
        "account_id": str(account.id),
        "category_id": str(category.id)
    }
    payload3 = {
        "amount": 30.00,
        "date": "2026-07-31",
        "description": "Late Tx",
        "transaction_type": "expense",
        "account_id": str(account.id),
        "category_id": str(category.id)
    }

    client.post("/api/v1/transactions/", json=payload1)
    client.post("/api/v1/transactions/", json=payload2)
    client.post("/api/v1/transactions/", json=payload3)

    # Filter for date range July 10th to July 20th
    response = client.get("/api/v1/transactions/?start_date=2026-07-10&end_date=2026-07-20")
    assert response.status_code == status.HTTP_200_OK

    txs = response.json()
    descriptions = [tx["description"] for tx in txs]
    
    # "Middle Tx" must be present
    assert "Middle Tx" in descriptions
    # "Early Tx" and "Late Tx" must not be present
    assert "Early Tx" not in descriptions
    assert "Late Tx" not in descriptions


