import uuid
import datetime
from decimal import Decimal
from typing import Sequence
from sqlmodel import Session, select, func
from app.models.savings_bucket import SavingsBucket
from app.models.transaction import Transaction, TransactionType
from app.models.category import Category
from app.models.account import Account


class BucketRepository:
    """Manages all database operations for SavingsBucket models."""

    def create(self, db: Session, bucket: SavingsBucket) -> SavingsBucket:
        db.add(bucket)
        db.commit()
        db.refresh(bucket)
        return bucket

    def get_by_id(self, db: Session, bucket_id: uuid.UUID) -> SavingsBucket | None:
        return db.get(SavingsBucket, bucket_id)

    def get_by_name(self, db: Session, name: str) -> SavingsBucket | None:
        query = select(SavingsBucket).where(func.lower(SavingsBucket.name) == name.lower())
        return db.exec(query).first()

    def list(self, db: Session, include_archived: bool = False) -> Sequence[SavingsBucket]:
        query = select(SavingsBucket)
        if not include_archived:
            query = query.where(SavingsBucket.is_archived == False)
        query = query.order_by(SavingsBucket.created_at.asc())
        return db.exec(query).all()

    def get_allocated_balance(self, db: Session, bucket_id: uuid.UUID) -> Decimal:
        """Calculates current allocated balance in a bucket from income & expense transactions."""
        inc_query = select(func.sum(Transaction.amount)).where(
            Transaction.bucket_id == bucket_id,
            Transaction.transaction_type == TransactionType.INCOME
        )
        exp_query = select(func.sum(Transaction.amount)).where(
            Transaction.bucket_id == bucket_id,
            Transaction.transaction_type == TransactionType.EXPENSE
        )

        inc_sum = db.exec(inc_query).one_or_none() or Decimal("0.00")
        exp_sum = db.exec(exp_query).one_or_none() or Decimal("0.00")

        return Decimal(str(inc_sum)) - Decimal(str(exp_sum))

    def update(self, db: Session, db_bucket: SavingsBucket, updated_data: dict) -> SavingsBucket:
        for key, value in updated_data.items():
            if value is not None:
                setattr(db_bucket, key, value)
        db_bucket.updated_at = datetime.datetime.now(datetime.timezone.utc)
        db.add(db_bucket)
        db.commit()
        db.refresh(db_bucket)
        return db_bucket

    def delete_or_archive(self, db: Session, bucket_id: uuid.UUID) -> tuple[bool, str]:
        """
        Deletes bucket if no transactions reference it.
        If transactions exist, archives the bucket to preserve historical records.
        """
        db_bucket = db.get(SavingsBucket, bucket_id)
        if not db_bucket:
            return False, "not_found"

        tx_count = db.exec(
            select(func.count(Transaction.id)).where(Transaction.bucket_id == bucket_id)
        ).one()

        if tx_count > 0:
            db_bucket.is_archived = True
            db_bucket.updated_at = datetime.datetime.now(datetime.timezone.utc)
            db.add(db_bucket)
            db.commit()
            return True, "archived"

        db.delete(db_bucket)
        db.commit()
        return True, "deleted"

    def transfer_balance(
        self,
        db: Session,
        from_bucket_id: uuid.UUID,
        to_bucket_id: uuid.UUID,
        amount: Decimal,
        description: str | None = None
    ) -> bool:
        """
        Transfers funds between two buckets by creating balanced internal income/expense entries.
        Account balances remain 100% unchanged.
        """
        from_b = db.get(SavingsBucket, from_bucket_id)
        to_b = db.get(SavingsBucket, to_bucket_id)
        if not from_b or not to_b:
            return False

        # Get default account and category for system transfer records
        account = db.exec(select(Account)).first()
        category = db.exec(select(Category)).first()
        if not account or not category:
            return False

        desc_str = description or f"Transfer from {from_b.name} to {to_b.name}"
        today = datetime.date.today()

        # Outflow from source bucket
        tx_out = Transaction(
            amount=amount,
            date=today,
            description=f"Bucket Transfer Out: {desc_str}",
            transaction_type=TransactionType.EXPENSE,
            account_id=account.id,
            category_id=category.id,
            bucket_id=from_bucket_id,
            notes=f"Internal transfer to {to_b.name}"
        )

        # Inflow to destination bucket
        tx_in = Transaction(
            amount=amount,
            date=today,
            description=f"Bucket Transfer In: {desc_str}",
            transaction_type=TransactionType.INCOME,
            account_id=account.id,
            category_id=category.id,
            bucket_id=to_bucket_id,
            notes=f"Internal transfer from {from_b.name}"
        )

        db.add_all([tx_out, tx_in])
        db.commit()
        return True
