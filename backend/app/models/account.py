import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING, List
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.transaction import Transaction


class AccountType(str, Enum):
    CASH = "Cash"
    CHECKING = "Checking"
    SAVINGS = "Savings"
    CREDIT_CARD = "Credit Card"
    WALLET = "Wallet"


class Account(SQLModel, table=True):
    __tablename__ = "accounts"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        nullable=False
    )
    name: str = Field(index=True, unique=True, nullable=False)
    type: AccountType = Field(default=AccountType.CHECKING, nullable=False)
    
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    transactions: List["Transaction"] = Relationship(
        back_populates="account",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
