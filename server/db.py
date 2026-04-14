# server/db.py
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB Configuration
MONGO_DETAILS = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_DETAILS)

# Database
database = client.autoyolo

# Collections
users_collection = database.get_collection("users")
sessions_collection = database.get_collection("sessions")
results_collection = database.get_collection("results")

async def get_user_by_name(username: str):
    user = await users_collection.find_one({"username": username})
    if user:
        user["id"] = str(user["_id"])
    return user

async def create_user(user_data: dict):
    user = await users_collection.insert_one(user_data)
    new_user = await users_collection.find_one({"_id": user.inserted_id})
    return new_user
