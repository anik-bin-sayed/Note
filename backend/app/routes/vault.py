import re

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.database import users_collection
from app.dependencies.auth import get_current_user_id
from app.schemas.vault import VaultKeySetup, VaultSetup

router = APIRouter(
    prefix="/api/vault",
    tags=["Vault"],
)


@router.get("/public-key")
async def get_user_public_key(
    email: str = Query(..., min_length=5, max_length=254),
    current_user_id: str = Depends(get_current_user_id),
):
    del current_user_id
    user = await users_collection.find_one(
        {
            "email": {
                "$regex": f"^{re.escape(email.strip())}$",
                "$options": "i",
            }
        },
        {"vault.public_key": 1},
    )
    public_key = user.get("vault", {}).get("public_key") if user else None
    if not public_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User has not enabled encrypted sharing",
        )
    return {"public_key": public_key}


@router.put("/keys")
async def add_vault_key_pair(
    data: VaultKeySetup,
    current_user_id: str = Depends(get_current_user_id),
):
    result = await users_collection.update_one(
        {
            "_id": ObjectId(current_user_id),
            "vault": {"$exists": True},
            "vault.public_key": {"$exists": False},
        },
        {
            "$set": {
                "vault.public_key": data.public_key,
                "vault.private_key": data.private_key.model_dump(),
            }
        },
    )
    if result.matched_count != 1:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Vault key pair is already configured",
        )
    return {"public_key": data.public_key}


@router.get("")
async def get_vault(current_user_id: str = Depends(get_current_user_id)):
    user = await users_collection.find_one(
        {"_id": ObjectId(current_user_id)},
        {"vault": 1},
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    vault = user.get("vault")

    if not vault:
        return {"configured": False}

    return {"configured": True, **vault}


@router.put("", status_code=status.HTTP_201_CREATED)
async def configure_vault(
    data: VaultSetup,
    current_user_id: str = Depends(get_current_user_id),
):
    result = await users_collection.update_one(
        {
            "_id": ObjectId(current_user_id),
            "vault": {"$exists": False},
        },
        {"$set": {"vault": data.model_dump()}},
    )

    if result.matched_count != 1:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Vault is already configured",
        )

    return {"configured": True, **data.model_dump()}
