from sqlmodel import Field, SQLModel


class SystemSetting(SQLModel, table=True):
    __tablename__ = "system_settings"

    key: str = Field(primary_key=True, nullable=False)
    value: str = Field(nullable=False)
