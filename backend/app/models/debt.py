import uuid
import datetime
from decimal import Decimal
from enum import Enum
from sqlmodel import Field, Relationship, SQLModel, Column, Numeric
from app.models.account import Account
from app.models.transaction import Transaction

class DebtType(str, Enum):
    LENT = "lent"
    BORROWED = "borrowed"

class Debt(SQLModel, table=True):
    __tablename__ = "debts"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        nullable=False
    )
    person_name: str = Field(index=True, nullable=False)
    amount: Decimal = Field(
        sa_column=Column(Numeric(precision=18, scale=2), nullable=False)
    )
    type: DebtType = Field(nullable=False)
    description: str | None = Field(default=None, nullable=True)
    is_settled: bool = Field(default=False, nullable=False)
    
    account_id: uuid.UUID = Field(
        foreign_key="accounts.id",
        index=True,
        nullable=False
    )
    transaction_id: uuid.UUID | None = Field(
        foreign_key="transactions.id",
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
    account: Account = Relationship()
    transaction: Transaction | None = Relationship()
