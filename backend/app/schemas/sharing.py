from typing import Literal

from pydantic import BaseModel, Field


class PublicShareCreate(BaseModel):
    expires_in_days: int = Field(default=30, ge=1, le=365)


class CollaboratorCreate(BaseModel):
    email: str = Field(..., min_length=5, max_length=254)
    role: Literal["viewer", "editor"]


class CollaboratorResponse(BaseModel):
    user_id: str
    email: str
    name: str | None = None
    role: Literal["viewer", "editor"]
