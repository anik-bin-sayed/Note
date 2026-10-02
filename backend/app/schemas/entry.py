from datetime import datetime

from pydantic import BaseModel, Field


class EntryCreate(BaseModel):
    ciphertext: str = Field(..., min_length=1, max_length=12_000_000)
    iv: str = Field(..., min_length=16, max_length=16)


class EntryUpdate(BaseModel):
    ciphertext: str = Field(..., min_length=1, max_length=12_000_000)
    iv: str = Field(..., min_length=16, max_length=16)


class EntryResponse(BaseModel):
    id: str
    user_id: str
    ciphertext: str | None = None
    iv: str | None = None
    legacy_title: str | None = None
    legacy_text: str | None = None
    created_at: datetime
    updated_at: datetime
