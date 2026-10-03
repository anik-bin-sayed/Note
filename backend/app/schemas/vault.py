from typing import Any

from pydantic import BaseModel, Field


class VaultVerifier(BaseModel):
    ciphertext: str = Field(..., min_length=1, max_length=4096)
    iv: str = Field(..., min_length=16, max_length=16)


class VaultSetup(BaseModel):
    salt: str = Field(..., min_length=24, max_length=24)
    iterations: int = Field(..., ge=100_000, le=1_000_000)
    verifier: VaultVerifier
    public_key: dict[str, Any] | None = None
    private_key: VaultVerifier | None = None


class VaultKeySetup(BaseModel):
    public_key: dict[str, Any]
    private_key: VaultVerifier
