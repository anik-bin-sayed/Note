import os

from pymongo import AsyncMongoClient
from app.core.config import settings

DATABASE_NAME = os.getenv("DATABASE_NAME")

client = AsyncMongoClient(settings.MONGO_URI)

db = client[DATABASE_NAME]

users_collection = db["users"]
entries_collection = db["entries"]
shared_notes_collection = db["shared_notes"]
note_collaborators_collection = db["note_collaborators"]
notifications_collection = db["notifications"]
