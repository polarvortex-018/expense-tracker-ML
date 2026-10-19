import shutil
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from app.db.vault_manager import vault_manager
from app.core.config import settings

router = APIRouter()


@router.get(
    "/export",
    summary="Export active vault database"
)
def export_database():
    """Downloads the currently active SQLite database file."""
    active_path = vault_manager.get_vault_path(vault_manager.active_vault_filename)
    if not active_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active database file not found.")
    
    export_filename = f"expense-tracker-backup-{vault_manager.active_vault_filename}"
    return FileResponse(
        path=active_path,
        filename=export_filename,
        media_type="application/x-sqlite3"
    )


@router.post(
    "/create",
    summary="Create snapshot backup of active vault"
)
def create_backup() -> Dict[str, Any]:
    """Creates a timestamped snapshot copy of active vault in backups directory."""
    settings.BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    active_path = vault_manager.get_vault_path(vault_manager.active_vault_filename)
    
    if not active_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active database file not found.")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"backup_{active_path.stem}_{timestamp}.db"
    backup_path = settings.BACKUP_DIR / backup_filename
    
    shutil.copy2(active_path, backup_path)
    
    return {
        "status": "success",
        "message": f"Created snapshot backup '{backup_filename}'",
        "backup_filename": backup_filename
    }


@router.get(
    "/list",
    summary="List all snapshot backups"
)
def list_backups() -> List[Dict[str, Any]]:
    """Lists all timestamped backups stored in backups directory."""
    settings.BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    backups = []
    
    for file in settings.BACKUP_DIR.glob("*.db"):
        stat = file.stat()
        backups.append({
            "filename": file.name,
            "size_bytes": stat.st_size,
            "created_at": int(stat.st_mtime)
        })
        
    return sorted(backups, key=lambda b: b["created_at"], reverse=True)


@router.post(
    "/restore/{filename}",
    summary="Restore active database from snapshot backup"
)
def restore_backup(filename: str) -> Dict[str, Any]:
    """Restores active database from a snapshot backup file in backups directory."""
    backup_path = settings.BACKUP_DIR / Path(filename).name
    if not backup_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Backup file '{filename}' not found.")
    
    # Check SQLite format
    contents = backup_path.read_bytes()
    if not contents.startswith(b"SQLite format 3"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid backup file format.")
    
    active_path = vault_manager.get_vault_path(vault_manager.active_vault_filename)
    shutil.copy2(backup_path, active_path)
    
    # Reload engine & migrations
    vault_manager.switch_vault(vault_manager.active_vault_filename)
    
    return {
        "status": "success",
        "message": f"Successfully restored database from backup '{filename}'"
    }
