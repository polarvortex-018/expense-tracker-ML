import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session
from app.db.session import get_session
from app.models.savings_bucket import SavingsBucket
from app.schemas.bucket import BucketCreate, BucketUpdate, BucketResponse, BucketTransferRequest
from app.repositories.bucket_repository import BucketRepository

router = APIRouter()
bucket_repo = BucketRepository()


@router.get("/", response_model=List[BucketResponse])
def get_buckets(
    include_archived: bool = Query(default=False),
    db: Session = Depends(get_session)
):
    """Retrieves all savings buckets with calculated allocated balances."""
    buckets = bucket_repo.list(db, include_archived=include_archived)
    response_list = []
    for b in buckets:
        allocated = bucket_repo.get_allocated_balance(db, b.id)
        b_dict = b.model_dump()
        b_dict["allocated_balance"] = allocated
        response_list.append(BucketResponse(**b_dict))
    return response_list


@router.post("/", response_model=BucketResponse, status_code=status.HTTP_201_CREATED)
def create_bucket(
    payload: BucketCreate,
    db: Session = Depends(get_session)
):
    """Creates a new Savings Bucket."""
    existing = bucket_repo.get_by_name(db, payload.name.strip())
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bucket with name '{payload.name}' already exists."
        )

    new_bucket = SavingsBucket(
        name=payload.name.strip(),
        icon=payload.icon.strip() if payload.icon else "🪣",
        color=payload.color.strip() if payload.color else "#6366f1"
    )
    created = bucket_repo.create(db, new_bucket)
    allocated = bucket_repo.get_allocated_balance(db, created.id)
    c_dict = created.model_dump()
    c_dict["allocated_balance"] = allocated
    return BucketResponse(**c_dict)


@router.put("/{bucket_id}", response_model=BucketResponse)
def update_bucket(
    bucket_id: uuid.UUID,
    payload: BucketUpdate,
    db: Session = Depends(get_session)
):
    """Updates a Savings Bucket."""
    db_bucket = bucket_repo.get_by_id(db, bucket_id)
    if not db_bucket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Savings bucket not found."
        )

    if payload.name and payload.name.strip().lower() != db_bucket.name.lower():
        existing = bucket_repo.get_by_name(db, payload.name.strip())
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Bucket with name '{payload.name}' already exists."
            )

    update_data = payload.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"]:
        update_data["name"] = update_data["name"].strip()

    updated = bucket_repo.update(db, db_bucket, update_data)
    allocated = bucket_repo.get_allocated_balance(db, updated.id)
    u_dict = updated.model_dump()
    u_dict["allocated_balance"] = allocated
    return BucketResponse(**u_dict)


@router.delete("/{bucket_id}")
def delete_bucket(
    bucket_id: uuid.UUID,
    db: Session = Depends(get_session)
):
    """Deletes bucket if unused, or archives it if historical transactions exist."""
    success, action = bucket_repo.delete_or_archive(db, bucket_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Savings bucket not found."
        )
    return {"message": f"Bucket successfully {action}.", "action": action}


@router.post("/transfer")
def transfer_bucket_funds(
    payload: BucketTransferRequest,
    db: Session = Depends(get_session)
):
    """Transfers funds between two buckets without modifying bank account balances."""
    if payload.from_bucket_id == payload.to_bucket_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source and destination buckets must be different."
        )

    success = bucket_repo.transfer_balance(
        db,
        from_bucket_id=payload.from_bucket_id,
        to_bucket_id=payload.to_bucket_id,
        amount=payload.amount,
        description=payload.description
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to transfer funds. Please verify buckets exist."
        )

    return {"message": "Funds transferred successfully between buckets."}
