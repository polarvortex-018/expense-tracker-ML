import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.vault_manager import vault_manager

def test_list_vaults(client):
    response = client.get("/api/v1/vaults/")
    assert response.status_code == 200
    vaults = response.json()
    assert isinstance(vaults, list)
    assert len(vaults) > 0


def test_create_and_switch_vault(client):
    # Create test vault
    res_create = client.post("/api/v1/vaults/create", json={"name": "TestVault"})
    assert res_create.status_code == 200
    data = res_create.json()
    assert "testvault.db" in data["active_vault"]

    # Switch back to finance.db
    res_switch = client.post("/api/v1/vaults/switch", json={"filename": "finance.db"})
    assert res_switch.status_code == 200
    assert res_switch.json()["active_vault"] == "finance.db"

    # Cleanup test vault
    res_delete = client.delete("/api/v1/vaults/testvault.db")
    assert res_delete.status_code == 200


def test_backup_create_and_list(client):
    res_create = client.post("/api/v1/backup/create")
    assert res_create.status_code == 200
    data = res_create.json()
    assert "backup_filename" in data

    res_list = client.get("/api/v1/backup/list")
    assert res_list.status_code == 200
    backups = res_list.json()
    assert len(backups) > 0
