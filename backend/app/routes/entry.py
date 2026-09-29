from fastapi import APIRouter, Depends, status, Query, HTTPException

from app.dependencies.auth import (
    get_current_user_id,
)

from app.schemas.entry import (
    EntryCreate,
    EntryResponse,
)

from app.services.entry_service import (
    create_entry,
    get_user_entries,
    delete_entry,
    get_entry_by_id,
)

router = APIRouter(
    prefix="/api/entries",
    tags=["Entries"],
)


@router.post(
    "",
    response_model=EntryResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_new_entry(
    data: EntryCreate,
    current_user_id: str = Depends(get_current_user_id),
):
    return await create_entry(
        user_id=current_user_id,
        title=data.title,
        text=data.text,
    )


@router.get("")
async def get_entries(
    page: int = Query(
        default=1,
        ge=1,
    ),
    limit: int = Query(
        default=9,
        ge=1,
        le=100,
    ),
    search: str = Query(default="", max_length=100),
    current_user_id: str = Depends(get_current_user_id),
):
    return await get_user_entries(
        user_id=current_user_id, page=page, limit=limit, search=search
    )


@router.get(
    "/{entry_id}",
    response_model=EntryResponse,
)
async def get_single_entry(
    entry_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    entry = await get_entry_by_id(
        user_id=current_user_id,
        entry_id=entry_id,
    )

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entry not found",
        )

    return entry


@router.delete(
    "/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_existing_entry(
    entry_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    deleted = await delete_entry(
        user_id=current_user_id,
        entry_id=entry_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entry not found",
        )

    return None
