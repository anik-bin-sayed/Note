from datetime import datetime

from pydantic import BaseModel, Field


class EntryCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    text: str = Field(
        ...,
        min_length=1,
    )


class EntryUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    text: str | None = Field(
        default=None,
        min_length=1,
    )


class EntryResponse(BaseModel):
    id: str
    user_id: str
    title: str
    text: str
    created_at: datetime
    updated_at: datetime
