from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import users_collection
from app.dependencies.auth import get_current_user_id
from app.schemas.vault import VaultSetup

router = APIRouter(
    prefix="/api/vault",
    tags=["Vault"],
)


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
