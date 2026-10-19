import uuid
import datetime
from typing import List
from decimal import Decimal
from fastapi import APIRouter, Depends, status
from sqlmodel import Session, select
from app.db.session import get_session
from app.models.debt import Debt, DebtType
from app.models.account import Account
from app.models.category import Category
from app.models.transaction import Transaction, TransactionType
from app.schemas.debt import DebtCreate, DebtSettle, DebtResponse
from app.core.exceptions import BusinessValidationError, EntityNotFoundError

router = APIRouter()

DEBT_CATEGORY_NAME = "Debt"
DEBT_CATEGORY_COLOR = "#ef4444"  # Red


def _get_or_create_debt_category(db: Session) -> Category:
    """Get or create a dedicated 'Debt' category for debt transactions."""
    category = db.exec(select(Category).where(Category.name == DEBT_CATEGORY_NAME)).first()
    if not category:
        category = Category(name=DEBT_CATEGORY_NAME, color=DEBT_CATEGORY_COLOR)
        db.add(category)
        db.commit()
        db.refresh(category)
    return category


@router.get("/", response_model=List[DebtResponse], summary="List all debts")
def list_debts(
    settled: bool | None = None,
    db: Session = Depends(get_session)
) -> List[DebtResponse]:
    query = select(Debt).order_by(Debt.created_at.desc())
    if settled is not None:
        query = query.where(Debt.is_settled == settled)
    debts = db.exec(query).all()
    return [DebtResponse.model_validate(d) for d in debts]


@router.post("/", response_model=DebtResponse, status_code=status.HTTP_201_CREATED, summary="Create a new debt")
def create_debt(
    payload: DebtCreate,
    db: Session = Depends(get_session)
) -> DebtResponse:
    # Validate account exists
    account = db.get(Account, payload.account_id)
    if not account:
        raise EntityNotFoundError(f"Account with ID {payload.account_id} not found.")

    # Get or create the Debt category
    debt_category = _get_or_create_debt_category(db)

    # Determine transaction type based on debt type
    # Lent money = money leaves the account (expense)
    # Borrowed money = money enters the account (income)
    if payload.type == DebtType.LENT:
        tx_type = TransactionType.EXPENSE
        tx_description = f"Lent to {payload.person_name}"
    else:
        tx_type = TransactionType.INCOME
        tx_description = f"Borrowed from {payload.person_name}"

    if payload.description:
        tx_description += f" — {payload.description}"

    # Create the corresponding transaction
    transaction = Transaction(
        amount=payload.amount,
        date=datetime.date.today(),
        description=tx_description,
        transaction_type=tx_type,
        notes=f"Auto-created by Debt Tracker",
        account_id=payload.account_id,
        category_id=debt_category.id,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    # Create the debt record
    debt = Debt(
        person_name=payload.person_name,
        amount=payload.amount,
        type=payload.type,
        description=payload.description,
        account_id=payload.account_id,
        transaction_id=transaction.id,
    )
    db.add(debt)
    db.commit()
    db.refresh(debt)

    return DebtResponse.model_validate(debt)


@router.post("/{debt_id}/settle", response_model=DebtResponse, summary="Settle an existing debt")
def settle_debt(
    debt_id: uuid.UUID,
    payload: DebtSettle,
    db: Session = Depends(get_session)
) -> DebtResponse:
    debt = db.get(Debt, debt_id)
    if not debt:
        raise EntityNotFoundError(f"Debt with ID {debt_id} not found.")
    if debt.is_settled:
        raise BusinessValidationError("This debt has already been settled.")

    # Validate settlement account exists
    account = db.get(Account, payload.account_id)
    if not account:
        raise EntityNotFoundError(f"Account with ID {payload.account_id} not found.")

    debt_category = _get_or_create_debt_category(db)

    # Create the settlement (counter) transaction
    # Lent money settled = money comes back (income)
    # Borrowed money settled = money goes out to repay (expense)
    if debt.type == DebtType.LENT:
        tx_type = TransactionType.INCOME
        tx_description = f"Repayment from {debt.person_name}"
    else:
        tx_type = TransactionType.EXPENSE
        tx_description = f"Repaid to {debt.person_name}"

    if debt.description:
        tx_description += f" — {debt.description}"

    settlement_tx = Transaction(
        amount=debt.amount,
        date=datetime.date.today(),
        description=tx_description,
        transaction_type=tx_type,
        notes="Auto-created by Debt Tracker (settlement)",
        account_id=payload.account_id,
        category_id=debt_category.id,
    )
    db.add(settlement_tx)

    # Mark debt as settled
    debt.is_settled = True
    debt.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.add(debt)
    db.commit()
    db.refresh(debt)

    return DebtResponse.model_validate(debt)


@router.delete("/{debt_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a debt")
def delete_debt(
    debt_id: uuid.UUID,
    db: Session = Depends(get_session)
) -> None:
    debt = db.get(Debt, debt_id)
    if not debt:
        raise EntityNotFoundError(f"Debt with ID {debt_id} not found.")

    # Delete the associated initial transaction if it exists
    if debt.transaction_id:
        transaction = db.get(Transaction, debt.transaction_id)
        if transaction:
            db.delete(transaction)

    db.delete(debt)
    db.commit()
    return None
