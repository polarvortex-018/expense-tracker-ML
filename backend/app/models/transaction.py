import uuid
import datetime
from decimal import Decimal
from enum import Enum
from sqlmodel import Field, Relationship, SQLModel, Column, Numeric
from app.models.account import Account
from app.models.category import Category
from app.models.savings_bucket import SavingsBucket


class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


class Transaction(SQLModel, table=True):
    __tablename__ = "transactions"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        nullable=False
    )
    
    # Store exact monetary values to avoid floating-point rounding errors
    amount: Decimal = Field(
        sa_column=Column(Numeric(precision=18, scale=2), nullable=False)
    )
    
    date: datetime.date = Field(index=True, nullable=False)
    description: str = Field(index=True, nullable=False)
    transaction_type: TransactionType = Field(nullable=False)
    notes: str | None = Field(default=None, nullable=True)

    account_id: uuid.UUID = Field(
        foreign_key="accounts.id",
        index=True,
        nullable=False
    )
    category_id: uuid.UUID = Field(
        foreign_key="categories.id",
        index=True,
        nullable=False
    )
    bucket_id: uuid.UUID | None = Field(
        default=None,
        foreign_key="savings_buckets.id",
        index=True,
        nullable=True
    )

    created_at: datetime.datetime = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False
    )
    updated_at: datetime.datetime = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False
    )

    # Relationships
    account: Account = Relationship(back_populates="transactions")
    category: Category = Relationship(back_populates="transactions")
    bucket: SavingsBucket | None = Relationship(back_populates="transactions")
