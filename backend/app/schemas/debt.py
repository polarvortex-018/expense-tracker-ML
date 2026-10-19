import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field
from app.models.debt import DebtType


class DebtCreate(BaseModel):
    person_name: str = Field(..., min_length=1, max_length=200)
    amount: Decimal = Field(..., gt=0)
    type: DebtType
    description: str | None = None
    account_id: uuid.UUID


class DebtSettle(BaseModel):
    account_id: uuid.UUID


class DebtResponse(BaseModel):
    id: uuid.UUID
    person_name: str
    amount: Decimal
    type: DebtType
    description: str | None
    is_settled: bool
    account_id: uuid.UUID
    transaction_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
