import os

from pymongo import AsyncMongoClient
from app.core.config import settings

DATABASE_NAME = os.getenv("DATABASE_NAME")

client = AsyncMongoClient(settings.MONGO_URI)

db = client[DATABASE_NAME]

users_collection = db["users"]
entries_collection = db["entries"]
