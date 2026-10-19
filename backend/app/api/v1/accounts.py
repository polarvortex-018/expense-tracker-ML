from typing import List
import uuid
from fastapi import APIRouter, Depends, status
from sqlmodel import Session, select
from app.db.session import get_session
from app.models.account import Account
from app.models.transaction import Transaction
from app.schemas.account import AccountResponse, AccountCreate, AccountUpdate
from app.repositories.transaction_repository import TransactionRepository
from app.core.exceptions import BusinessValidationError, EntityNotFoundError

router = APIRouter()
tx_repo = TransactionRepository()


@router.put("/{account_id}", response_model=AccountResponse, summary="Update an account")
def update_account(
    account_id: uuid.UUID,
    payload: AccountUpdate,
    db: Session = Depends(get_session)
) -> AccountResponse:
    account = db.get(Account, account_id)
    if not account:
        raise EntityNotFoundError(f"Account with ID {account_id} not found.")
    
    update_data = payload.model_dump(exclude_unset=True)
    
    if "name" in update_data:
        new_name = update_data["name"].strip()
        if not new_name:
            raise BusinessValidationError("Account name cannot be empty.")
        # Check duplicate
        existing = db.exec(select(Account).where(Account.name == new_name, Account.id != account_id)).first()
        if existing:
            raise BusinessValidationError(f"Account with name '{new_name}' already exists.")
        account.name = new_name
        
    if "type" in update_data:
        account.type = update_data["type"]
        
    db.add(account)
    db.commit()
    db.refresh(account)
    
    balance = tx_repo.get_account_balance(db, account.id)
    
    return AccountResponse(
        id=account.id,
        name=account.name,
        type=account.type,
        balance=balance,
        created_at=account.created_at,
        updated_at=account.updated_at
    )


@router.get("/", response_model=List[AccountResponse], summary="List all accounts with balances")
def list_accounts(db: Session = Depends(get_session)) -> List[AccountResponse]:
    accounts = db.exec(select(Account)).all()
    response = []
    for acc in accounts:
        balance = tx_repo.get_account_balance(db, acc.id)
        response.append(AccountResponse(
            id=acc.id,
            name=acc.name,
            type=acc.type,
            balance=balance,
            created_at=acc.created_at,
            updated_at=acc.updated_at
        ))
    return response


@router.post("/", response_model=AccountResponse, status_code=status.HTTP_201_CREATED, summary="Create a new account")
def create_account(payload: AccountCreate, db: Session = Depends(get_session)) -> AccountResponse:
    # Check if name already exists
    existing = db.exec(select(Account).where(Account.name == payload.name)).first()
    if existing:
        raise BusinessValidationError(f"Account with name '{payload.name}' already exists.")
    
    new_acc = Account(name=payload.name, type=payload.type)
    db.add(new_acc)
    db.commit()
    db.refresh(new_acc)
    
    return AccountResponse(
        id=new_acc.id,
        name=new_acc.name,
        type=new_acc.type,
        balance=0, # new accounts start with zero balance
        created_at=new_acc.created_at,
        updated_at=new_acc.updated_at
    )


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete an account")
def delete_account(account_id: uuid.UUID, db: Session = Depends(get_session)) -> None:
    account = db.get(Account, account_id)
    if not account:
        raise EntityNotFoundError(f"Account with ID {account_id} not found.")
    
    # Check if any transactions are linked to this account
    linked = db.exec(select(Transaction).where(Transaction.account_id == account_id)).first()
    if linked:
        raise BusinessValidationError(
            f"Cannot delete account '{account.name}' because it contains active transactions. "
            "Please delete or reassign those transactions first."
        )
        
    db.delete(account)
    db.commit()
    return None


