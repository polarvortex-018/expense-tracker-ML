import uuid
import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator
from app.models.transaction import TransactionType


class TransactionBase(BaseModel):
    amount: Decimal = Field(..., description="The transaction amount (must be positive).")
    date: datetime.date = Field(..., description="The date the transaction occurred.")
    description: str = Field(..., min_length=1, description="A brief description of the transaction.")
    transaction_type: TransactionType = Field(..., description="Income or expense.")
    notes: str | None = Field(default=None, description="Optional extra details.")
    account_id: uuid.UUID = Field(..., description="The associated account ID.")
    category_id: uuid.UUID = Field(..., description="The associated category ID.")
    bucket_id: uuid.UUID | None = Field(default=None, description="The associated Savings Bucket ID.")

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, value: Decimal) -> Decimal:
        if value <= 0:
            raise ValueError("Amount must be greater than zero.")
        return value

    @field_validator("description")
    @classmethod
    def description_must_not_be_whitespace(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Description cannot be empty or whitespace.")
        return stripped


class TransactionCreate(TransactionBase):
    """Schema for creating a transaction."""
    pass


class TransactionUpdate(BaseModel):
    """Schema for updating an existing transaction. All fields are optional."""
    amount: Decimal | None = Field(default=None, description="The transaction amount (must be positive).")
    date: datetime.date | None = Field(default=None)
    description: str | None = Field(default=None, min_length=1)
    transaction_type: TransactionType | None = Field(default=None)
    notes: str | None = Field(default=None)
    account_id: uuid.UUID | None = Field(default=None)
    category_id: uuid.UUID | None = Field(default=None)
    bucket_id: uuid.UUID | None = Field(default=None)

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, value: Decimal | None) -> Decimal | None:
        if value is not None and value <= 0:
            raise ValueError("Amount must be greater than zero.")
        return value

    @field_validator("description")
    @classmethod
    def description_must_not_be_whitespace(cls, value: str | None) -> str | None:
        if value is not None:
            stripped = value.strip()
            if not stripped:
                raise ValueError("Description cannot be empty or whitespace.")
            return stripped
        return value


class TransactionResponse(TransactionBase):
    """Schema for returning transaction details to the client."""
    id: uuid.UUID
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True
