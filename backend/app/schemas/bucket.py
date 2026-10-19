import uuid
import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class BucketBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    icon: str = Field(default="🪣", max_length=10)
    color: str = Field(default="#6366f1", max_length=20)


class BucketCreate(BucketBase):
    pass


class BucketUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    icon: str | None = Field(default=None, max_length=10)
    color: str | None = Field(default=None, max_length=20)
    is_archived: bool | None = None


class BucketResponse(BucketBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    is_archived: bool
    allocated_balance: Decimal = Field(default=Decimal("0.00"))
    created_at: datetime.datetime
    updated_at: datetime.datetime


class BucketTransferRequest(BaseModel):
    from_bucket_id: uuid.UUID
    to_bucket_id: uuid.UUID
    amount: Decimal = Field(gt=Decimal("0.00"))
    description: str | None = None
