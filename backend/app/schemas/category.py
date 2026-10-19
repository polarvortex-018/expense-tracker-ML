import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class CategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    color: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field(default="#6366f1")


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    color: str | None = Field(default=None)



