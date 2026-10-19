from typing import List
import uuid
from fastapi import APIRouter, Depends, status
from sqlmodel import Session, select
from app.db.session import get_session
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.category import CategoryResponse, CategoryCreate, CategoryUpdate
from app.core.exceptions import BusinessValidationError, EntityNotFoundError

router = APIRouter()


@router.put("/{category_id}", response_model=CategoryResponse, summary="Update a category")
def update_category(
    category_id: uuid.UUID,
    payload: CategoryUpdate,
    db: Session = Depends(get_session)
) -> CategoryResponse:
    category = db.get(Category, category_id)
    if not category:
        raise EntityNotFoundError(f"Category with ID {category_id} not found.")
    
    update_data = payload.model_dump(exclude_unset=True)
    
    if "name" in update_data and update_data["name"] is not None:
        new_name = update_data["name"].strip()
        if not new_name:
            raise BusinessValidationError("Category name cannot be empty.")
        # Check duplicate
        existing = db.exec(select(Category).where(Category.name == new_name, Category.id != category_id)).first()
        if existing:
            raise BusinessValidationError(f"Category with name '{new_name}' already exists.")
        category.name = new_name
        
    if "color" in update_data and update_data["color"] is not None:
        category.color = update_data["color"]
        
    db.add(category)
    db.commit()
    db.refresh(category)
    
    return CategoryResponse.model_validate(category)


@router.get("/", response_model=List[CategoryResponse], summary="List all categories")
def list_categories(db: Session = Depends(get_session)) -> List[CategoryResponse]:
    categories = db.exec(select(Category)).all()
    return [CategoryResponse.model_validate(cat) for cat in categories]


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED, summary="Create a new category")
def create_category(payload: CategoryCreate, db: Session = Depends(get_session)) -> CategoryResponse:
    # Check if name already exists
    existing = db.exec(select(Category).where(Category.name == payload.name)).first()
    if existing:
        raise BusinessValidationError(f"Category with name '{payload.name}' already exists.")
    
    new_cat = Category(name=payload.name, color=payload.color)
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    
    return CategoryResponse.model_validate(new_cat)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a category")
def delete_category(category_id: uuid.UUID, db: Session = Depends(get_session)) -> None:
    category = db.get(Category, category_id)
    if not category:
        raise EntityNotFoundError(f"Category with ID {category_id} not found.")
    
    # Check if any transactions are linked to this category
    linked = db.exec(select(Transaction).where(Transaction.category_id == category_id)).first()
    if linked:
        raise BusinessValidationError(
            f"Cannot delete category '{category.name}' because it contains active transactions. "
            "Please delete or reassign those transactions first."
        )
        
    db.delete(category)
    db.commit()
    return None


