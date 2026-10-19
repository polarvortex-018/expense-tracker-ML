import logging
from sqlmodel import Session, select, SQLModel, text
from app.db.session import engine
from app.models.account import Account, AccountType
from app.models.category import Category
from app.models.savings_bucket import SavingsBucket
from app.models.system_setting import SystemSetting

logger = logging.getLogger(__name__)


def init_db(db: Session) -> None:
    """Creates database tables, runs self-healing migrations, and performs initial seeding."""
    # Ensure tables exist
    SQLModel.metadata.create_all(engine)
    logger.info("Database tables verified/created.")

    # Self-healing migration for Category color column
    try:
        db.execute(text("ALTER TABLE categories ADD COLUMN color VARCHAR DEFAULT '#6366f1' NOT NULL"))
        db.commit()
    except Exception:
        pass

    # Self-healing migration for Transaction bucket_id column
    try:
        db.execute(text("ALTER TABLE transactions ADD COLUMN bucket_id CHAR(32) REFERENCES savings_buckets(id)"))
        db.commit()
    except Exception:
        pass

    # Ensure default "General" bucket exists for backward compatibility
    general_bucket = db.exec(select(SavingsBucket).where(SavingsBucket.name == "General")).first()
    if not general_bucket:
        general_bucket = SavingsBucket(
            name="General",
            icon="🪣",
            color="#6366f1",
            is_archived=False
        )
        db.add(general_bucket)
        db.commit()
        db.refresh(general_bucket)
        logger.info("Created default 'General' Savings Bucket.")

    # Assign default bucket to any existing transactions without a bucket_id
    try:
        db.execute(
            text("UPDATE transactions SET bucket_id = :b_id WHERE bucket_id IS NULL"),
            {"b_id": str(general_bucket.id).replace("-", "")}
        )
        db.commit()
    except Exception as e:
        logger.warning(f"Note on backfilling bucket_id: {e}")

    # Check one-time seed flag for categories/accounts
    seed_flag = db.exec(select(SystemSetting).where(SystemSetting.key == "is_seeded")).first()
    if seed_flag and seed_flag.value == "true":
        logger.info("Database is already seeded. Skipping initial account/category seeding.")
        return

    # Check if existing data
    has_existing_data = (
        db.exec(select(Category)).first() is not None or
        db.exec(select(Account)).first() is not None
    )
    if has_existing_data:
        logger.info("Database has existing user data. Marking database as seeded.")
        db.add(SystemSetting(key="is_seeded", value="true"))
        db.commit()
        return

    # Seed default Categories
    default_categories = ["Food", "Rent", "Petrol", "Luxuries", "Necessities"]
    default_colors = {
        "Food": "#f59e0b",       # Amber
        "Rent": "#3b82f6",       # Blue
        "Petrol": "#10b981",     # Emerald
        "Luxuries": "#ec4899",   # Pink
        "Necessities": "#8b5cf6" # Purple
    }
    for name in default_categories:
        color = default_colors.get(name, "#6366f1")
        category = Category(name=name, color=color)
        db.add(category)

    # Seed default Accounts
    default_accounts = [
        ("Checking", AccountType.CHECKING),
        ("Savings", AccountType.SAVINGS),
        ("Cash", AccountType.CASH),
        ("Credit Card", AccountType.CREDIT_CARD),
        ("Wallet", AccountType.WALLET)
    ]
    for name, acc_type in default_accounts:
        account = Account(name=name, type=acc_type)
        db.add(account)

    db.add(SystemSetting(key="is_seeded", value="true"))
    db.commit()
    logger.info("Database initial seeding completed successfully.")
