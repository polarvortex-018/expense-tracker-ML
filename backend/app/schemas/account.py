import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field
from app.models.account import AccountType

class AccountResponse(BaseModel):
    id: uuid.UUID
    name: str
    type: AccountType
    balance: Decimal = Decimal("0.00")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AccountCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: AccountType = AccountType.CHECKING


class AccountUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    type: AccountType | None = None


