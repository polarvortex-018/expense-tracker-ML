import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.transaction import Transaction


class Category(SQLModel, table=True):
    __tablename__ = "categories"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        nullable=False
    )
    name: str = Field(index=True, unique=True, nullable=False)
    color: str = Field(default="#6366f1", nullable=False)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    transactions: List["Transaction"] = Relationship(back_populates="category")
