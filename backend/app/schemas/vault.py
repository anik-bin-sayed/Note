from pydantic import BaseModel, Field


class VaultVerifier(BaseModel):
    ciphertext: str = Field(..., min_length=1, max_length=512)
    iv: str = Field(..., min_length=16, max_length=16)


class VaultSetup(BaseModel):
    salt: str = Field(..., min_length=24, max_length=24)
    iterations: int = Field(..., ge=100_000, le=1_000_000)
    verifier: VaultVerifier
