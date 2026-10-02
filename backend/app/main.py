from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes.auth import router as auth_router
from app.routes.entry import router as entry_router
from app.routes.vault import router as vault_router
from app.database import client

app = FastAPI(
    title="Google OAuth API",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(entry_router)
app.include_router(vault_router)


@app.get("/test-db")
async def test_db():
    await client.admin.command("ping")

    return {"message": "MongoDB connected successfully"}


@app.get("/")
async def root():
    return {"message": "API is running"}
