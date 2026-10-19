import uuid
import datetime
from sqlmodel import Field, Relationship, SQLModel


class SavingsBucket(SQLModel, table=True):
    __tablename__ = "savings_buckets"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        nullable=False
    )
    
    name: str = Field(index=True, unique=True, nullable=False)
    icon: str = Field(default="🪣", nullable=False)
    color: str = Field(default="#6366f1", nullable=False)
    is_archived: bool = Field(default=False, nullable=False)

    created_at: datetime.datetime = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False
    )
    updated_at: datetime.datetime = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False
    )

    # Relationships
    transactions: list["Transaction"] = Relationship(back_populates="bucket")
