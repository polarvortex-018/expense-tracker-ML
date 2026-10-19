import sys
from logging.config import fileConfig
from pathlib import Path
from sqlalchemy import engine_from_config, pool
from alembic import context

# Add backend directory to sys.path to allow imports from app
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from sqlmodel import SQLModel
from app.core.config import settings
from app.models import Account, Category, Transaction  # noqa: F401

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Target metadata for autogenerate support
target_metadata = SQLModel.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    # Use dynamic sqlalchemy.url from Alembic Config if set, fallback to settings.DATABASE_URL
    target_url = config.get_main_option("sqlalchemy.url") or settings.DATABASE_URL
    alembic_config = config.get_section(config.config_ini_section) or {}
    alembic_config["sqlalchemy.url"] = target_url

    connectable = engine_from_config(
        alembic_config,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
