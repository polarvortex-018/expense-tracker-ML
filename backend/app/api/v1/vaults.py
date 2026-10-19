from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, UploadFile, File, status
from pydantic import BaseModel
from app.db.vault_manager import vault_manager
from app.core.config import settings

router = APIRouter()


class CreateVaultRequest(BaseModel):
    name: str


class SwitchVaultRequest(BaseModel):
    filename: str


@router.get(
    "/",
    summary="List all available financial vaults"
)
def list_vaults() -> List[Dict[str, Any]]:
    """Returns a list of all SQLite database vaults found in the data directory."""
    return vault_manager.list_vaults()


@router.post(
    "/create",
    summary="Create a new financial vault"
)
def create_vault(payload: CreateVaultRequest) -> Dict[str, Any]:
    """Creates a new named financial vault database, auto-migrating and seeding default categories."""
    clean_name = payload.name.strip().replace(" ", "_").lower()
    if not clean_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vault name cannot be empty.")
    
    filename = f"{clean_name}.db" if not clean_name.endswith(".db") else clean_name
    vault_path = vault_manager.get_vault_path(filename)
    
    active_filename = vault_manager.switch_vault(filename)
    return {
        "status": "success",
        "message": f"Created and switched to vault '{active_filename}'",
        "active_vault": active_filename,
        "vaults": vault_manager.list_vaults()
    }


@router.post(
    "/switch",
    summary="Switch active financial vault"
)
def switch_vault(payload: SwitchVaultRequest) -> Dict[str, Any]:
    """Switches active database session pool to target vault file."""
    vault_path = vault_manager.get_vault_path(payload.filename)
    if not vault_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Vault file '{payload.filename}' not found.")
    
    active_filename = vault_manager.switch_vault(payload.filename)
    return {
        "status": "success",
        "message": f"Switched active vault to '{active_filename}'",
        "active_vault": active_filename,
        "vaults": vault_manager.list_vaults()
    }


@router.post(
    "/import",
    summary="Import external SQLite .db file as a new vault"
)
async def import_vault(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Uploads and validates an external SQLite file, adding it as a vault."""
    if not file.filename.endswith(".db") and not file.filename.endswith(".sqlite"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file must be a .db or .sqlite file.")
    
    contents = await file.read()
    if not contents.startswith(b"SQLite format 3"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file: Not a valid SQLite 3 database.")
    
    target_name = Path(file.filename).name
    target_path = vault_manager.get_vault_path(target_name)
    
    # If collision, append timestamp
    if target_path.exists():
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        target_name = f"{target_path.stem}_{timestamp}.db"
        target_path = vault_manager.get_vault_path(target_name)
        
    target_path.write_bytes(contents)
    
    # Run migrations on imported DB to ensure compatible schema
    vault_manager.run_migrations_for_db(target_name)
    active_filename = vault_manager.switch_vault(target_name)
    
    return {
        "status": "success",
        "message": f"Successfully imported and switched to vault '{active_filename}'",
        "active_vault": active_filename,
        "vaults": vault_manager.list_vaults()
    }


@router.delete(
    "/{filename}",
    summary="Delete a non-active vault"
)
def delete_vault(filename: str) -> Dict[str, Any]:
    """Deletes a database vault. Active vault cannot be deleted."""
    if filename == vault_manager.active_vault_filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete the currently active vault.")
    
    vault_path = vault_manager.get_vault_path(filename)
    if not vault_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Vault '{filename}' not found.")
    
    import gc
    gc.collect()
    
    try:
        vault_path.unlink(missing_ok=True)
    except Exception as e:
        gc.collect()
        try:
            vault_path.unlink(missing_ok=True)
        except Exception as e2:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete vault: {e2}")
        
    return {
        "status": "success",
        "message": f"Deleted vault '{filename}'",
        "vaults": vault_manager.list_vaults()
    }
