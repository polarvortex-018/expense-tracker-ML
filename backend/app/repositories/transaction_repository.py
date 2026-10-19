import uuid
from datetime import date
from decimal import Decimal
from typing import List, Sequence
from sqlmodel import Session, select, func
from app.models.transaction import Transaction, TransactionType


class TransactionRepository:
    """Manages all database operations for Transaction models."""

    def create(self, db: Session, transaction: Transaction) -> Transaction:
        """Persists a new transaction."""
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        return transaction

    def get_by_id(self, db: Session, transaction_id: uuid.UUID) -> Transaction | None:
        """Retrieves a single transaction by ID."""
        return db.get(Transaction, transaction_id)

    def list(
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
        """Lists transactions with filters, searching, and pagination."""
        query = select(Transaction)
        
        if account_id:
            query = query.where(Transaction.account_id == account_id)
        if category_ids:
            query = query.where(Transaction.category_id.in_(category_ids))
        if bucket_id:
            query = query.where(Transaction.bucket_id == bucket_id)
        if start_date:
            query = query.where(Transaction.date >= start_date)
        if end_date:
            query = query.where(Transaction.date <= end_date)
        if transaction_type:
            query = query.where(Transaction.transaction_type == transaction_type)
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                Transaction.description.like(search_pattern) | 
                Transaction.notes.like(search_pattern)
            )

        # Order by Date Added -> Descending (Newest First)
        query = query.order_by(Transaction.created_at.desc(), Transaction.date.desc())
        query = query.offset(skip).limit(limit)
        
        return db.exec(query).all()

    def update(self, db: Session, db_transaction: Transaction, updated_data: dict) -> Transaction:
        """Updates a transaction's fields with new data."""
        for key, value in updated_data.items():
            setattr(db_transaction, key, value)
        
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return db_transaction

    def delete(self, db: Session, transaction_id: uuid.UUID) -> bool:
        """Deletes a transaction by ID. Returns True if deleted, False if not found."""
        db_transaction = db.get(Transaction, transaction_id)
        if not db_transaction:
            return False
        db.delete(db_transaction)
        db.commit()
        return True

    def get_account_balance(self, db: Session, account_id: uuid.UUID) -> Decimal:
        """Computes the net balance of an account based on income and expense transactions."""
        income_query = select(func.sum(Transaction.amount)).where(
            Transaction.account_id == account_id,
            Transaction.transaction_type == TransactionType.INCOME
        )
        expense_query = select(func.sum(Transaction.amount)).where(
            Transaction.account_id == account_id,
            Transaction.transaction_type == TransactionType.EXPENSE
        )

        income_sum = db.exec(income_query).one_or_none() or Decimal("0.00")
        expense_sum = db.exec(expense_query).one_or_none() or Decimal("0.00")

        # Convert back to Decimal in case SQLAlchemy returns float
        return Decimal(str(income_sum)) - Decimal(str(expense_sum))

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
        """Computes financial metrics and category spending breakdown with optional filtering."""
        where_clauses = []
        if start_date:
            where_clauses.append(Transaction.date >= start_date)
        if end_date:
            where_clauses.append(Transaction.date <= end_date)
        if account_id:
            where_clauses.append(Transaction.account_id == account_id)
        if bucket_id:
            where_clauses.append(Transaction.bucket_id == bucket_id)
        if category_ids:
            where_clauses.append(Transaction.category_id.in_(category_ids))
        if search:
            sp = f"%{search}%"
            where_clauses.append(
                Transaction.description.like(sp) | Transaction.notes.like(sp)
            )

        inc_q = select(func.sum(Transaction.amount)).where(
            Transaction.transaction_type == TransactionType.INCOME,
            *where_clauses
        )
        exp_q = select(func.sum(Transaction.amount)).where(
            Transaction.transaction_type == TransactionType.EXPENSE,
            *where_clauses
        )

        inc_sum = db.exec(inc_q).one_or_none() or Decimal("0.00")
        exp_sum = db.exec(exp_q).one_or_none() or Decimal("0.00")
        total_exp = Decimal(str(exp_sum))

        cat_q = select(Transaction.category_id, func.sum(Transaction.amount)).where(
            Transaction.transaction_type == TransactionType.EXPENSE,
            *where_clauses
        ).group_by(Transaction.category_id)

        cat_results = db.exec(cat_q).all()
        category_breakdown = []

        for cat_id, amount in cat_results:
            amt_dec = Decimal(str(amount))
            pct = float(round((amt_dec / total_exp) * 100, 1)) if total_exp > 0 else 0.0
            category_breakdown.append({
                "category_id": cat_id,
                "amount": amt_dec,
                "percentage": pct
            })

        return {
            "total_income": Decimal(str(inc_sum)),
            "total_expenses": total_exp,
            "category_breakdown": category_breakdown
        }
