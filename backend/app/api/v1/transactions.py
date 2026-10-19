import uuid
from datetime import date
from typing import List, Sequence
from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session
from app.db.session import get_session
from app.models.transaction import TransactionType
from app.schemas.transaction import TransactionCreate, TransactionResponse, TransactionUpdate
from app.services.transaction_service import TransactionService

router = APIRouter()
service = TransactionService()


@router.post(
    "/",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new transaction"
)
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_session)
) -> TransactionResponse:
    """Creates a new transaction, validating that the referenced Account and Category exist."""
    return service.create_transaction(db, payload)


@router.get(
    "/summary",
    summary="Get overall financial summary stats with filters"
)
def get_transaction_summary(
    account_id: uuid.UUID | None = Query(default=None),
    category_id: List[uuid.UUID] = Query(default=[]),
    bucket_id: uuid.UUID | None = Query(default=None),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Session = Depends(get_session)
) -> dict:
    """Returns overall financial summary metrics and category breakdown matching filters."""
    return service.get_summary(
        db,
        start_date=start_date,
        end_date=end_date,
        account_id=account_id,
        bucket_id=bucket_id,
        category_ids=category_id,
        search=search
    )


@router.get(
    "/{transaction_id}",
    response_model=TransactionResponse,
    summary="Get transaction details by ID"
)
def get_transaction(
    transaction_id: uuid.UUID,
    db: Session = Depends(get_session)
) -> TransactionResponse:
    """Retrieves a single transaction by its UUID."""
    return service.get_transaction(db, transaction_id)


@router.get(
    "/",
    response_model=List[TransactionResponse],
    summary="List transactions with filters"
)
def list_transactions(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    account_id: uuid.UUID | None = Query(default=None),
    category_id: List[uuid.UUID] = Query(default=[]),
    bucket_id: uuid.UUID | None = Query(default=None),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    transaction_type: TransactionType | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Session = Depends(get_session)
) -> Sequence[TransactionResponse]:
    """Lists transactions with pagination, text search on description/notes, and optional filtering."""
    return service.list_transactions(
        db,
        skip=skip,
        limit=limit,
        account_id=account_id,
        category_ids=category_id,
        bucket_id=bucket_id,
        start_date=start_date,
        end_date=end_date,
        transaction_type=transaction_type,
        search=search
    )


@router.put(
    "/{transaction_id}",
    response_model=TransactionResponse,
    summary="Update a transaction"
)
def update_transaction(
    transaction_id: uuid.UUID,
    payload: TransactionUpdate,
    db: Session = Depends(get_session)
) -> TransactionResponse:
    """Updates one or more fields of an existing transaction."""
    return service.update_transaction(db, transaction_id, payload)


@router.delete(
    "/{transaction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a transaction"
)
def delete_transaction(
    transaction_id: uuid.UUID,
    db: Session = Depends(get_session)
) -> None:
    """Deletes a transaction. Returns a 204 No Content response on success."""
    service.delete_transaction(db, transaction_id)
