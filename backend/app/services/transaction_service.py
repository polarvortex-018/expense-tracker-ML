import uuid
from datetime import date
from typing import List, Sequence
from sqlmodel import Session
from app.core.exceptions import EntityNotFoundError, BusinessValidationError
from app.models.account import Account
from app.models.category import Category
from app.models.transaction import Transaction, TransactionType
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.transaction import TransactionCreate, TransactionUpdate


class TransactionService:
    """Orchestrates business rules and operations for Transactions."""

    def __init__(self) -> None:
        self.repository = TransactionRepository()

    def _validate_relations(self, db: Session, account_id: uuid.UUID, category_id: uuid.UUID, bucket_id: uuid.UUID | None = None) -> None:
        """Ensures that referenced account, category, and bucket exist."""
        account = db.get(Account, account_id)
        if not account:
            raise EntityNotFoundError(f"Account with ID {account_id} not found.")

        category = db.get(Category, category_id)
        if not category:
            raise EntityNotFoundError(f"Category with ID {category_id} not found.")

        if bucket_id:
            from app.models.savings_bucket import SavingsBucket
            bucket = db.get(SavingsBucket, bucket_id)
            if not bucket:
                raise EntityNotFoundError(f"Savings bucket with ID {bucket_id} not found.")

    def create_transaction(self, db: Session, payload: TransactionCreate) -> Transaction:
        """Creates a transaction after validating foreign key relationships."""
        target_bucket_id = payload.bucket_id
        if not target_bucket_id:
            from app.models.savings_bucket import SavingsBucket
            from sqlmodel import select
            gen_bucket = db.exec(select(SavingsBucket).where(SavingsBucket.name == "General")).first()
            if gen_bucket:
                target_bucket_id = gen_bucket.id

        self._validate_relations(db, payload.account_id, payload.category_id, target_bucket_id)
        
        transaction = Transaction(
            amount=payload.amount,
            date=payload.date,
            description=payload.description,
            transaction_type=payload.transaction_type,
            notes=payload.notes,
            account_id=payload.account_id,
            category_id=payload.category_id,
            bucket_id=target_bucket_id
        )
        return self.repository.create(db, transaction)

    def get_transaction(self, db: Session, transaction_id: uuid.UUID) -> Transaction:
        """Retrieves a transaction, raising an exception if not found."""
        transaction = self.repository.get_by_id(db, transaction_id)
        if not transaction:
            raise EntityNotFoundError(f"Transaction with ID {transaction_id} not found.")
        return transaction

    def list_transactions(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        account_id: uuid.UUID | None = None,
        category_ids: List[uuid.UUID] | None = None,
        bucket_id: uuid.UUID | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
        transaction_type: TransactionType | None = None,
        search: str | None = None
    ) -> Sequence[Transaction]:
        """Lists transactions matching specified search, filtering, and paging bounds."""
        return self.repository.list(
            db,
            skip=skip,
            limit=limit,
            account_id=account_id,
            category_ids=category_ids,
            bucket_id=bucket_id,
            start_date=start_date,
            end_date=end_date,
            transaction_type=transaction_type,
            search=search
        )

    def update_transaction(
        self, db: Session, transaction_id: uuid.UUID, payload: TransactionUpdate
    ) -> Transaction:
        """Updates a transaction, validating relationships if IDs are updated."""
        db_transaction = self.get_transaction(db, transaction_id)

        update_dict = payload.model_dump(exclude_unset=True)

        # Validate new relations if account_id or category_id is changing
        target_account_id = update_dict.get("account_id", db_transaction.account_id)
        target_category_id = update_dict.get("category_id", db_transaction.category_id)
        if "account_id" in update_dict or "category_id" in update_dict:
            self._validate_relations(db, target_account_id, target_category_id)

        return self.repository.update(db, db_transaction, update_dict)

    def delete_transaction(self, db: Session, transaction_id: uuid.UUID) -> None:
        """Deletes a transaction, raising an exception if the entity does not exist."""
        deleted = self.repository.delete(db, transaction_id)
        if not deleted:
            raise EntityNotFoundError(f"Transaction with ID {transaction_id} not found.")

    def get_summary(
        self,
        db: Session,
        start_date: date | None = None,
        end_date: date | None = None,
        account_id: uuid.UUID | None = None,
        bucket_id: uuid.UUID | None = None,
        category_ids: List[uuid.UUID] | None = None,
        search: str | None = None
    ) -> dict:
        """Returns financial summary metrics matching specified filters."""
        return self.repository.get_summary(
            db,
            start_date=start_date,
            end_date=end_date,
            account_id=account_id,
            bucket_id=bucket_id,
            category_ids=category_ids,
            search=search
        )
