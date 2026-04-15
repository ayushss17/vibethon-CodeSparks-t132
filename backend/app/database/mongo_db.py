from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings
import asyncio

class MongoDB:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

mongodb = MongoDB()

async def connect_to_mongo():
    """Connect to MongoDB"""
    mongodb.client = AsyncIOMotorClient(settings.MONGODB_URL)
    mongodb.db = mongodb.client[settings.MONGODB_DB_NAME]
    print("✓ Connected to MongoDB")
    
    # Create indexes
    await create_indexes()

async def close_mongo_connection():
    """Close MongoDB connection"""
    if mongodb.client:
        mongodb.client.close()
    print("✓ Disconnected from MongoDB")

async def create_indexes():
    """Create necessary indexes"""
    try:
        # Users collection
        users_collection = mongodb.db["users"]
        await users_collection.create_index("email", unique=True)
        
        # Submissions collection
        submissions_collection = mongodb.db["submissions"]
        await submissions_collection.create_index([("user_id", 1), ("problem_slug", 1)])
        await submissions_collection.create_index("created_at")
        
        print("✓ Indexes created")
    except Exception as e:
        print(f"Index creation error: {e}")

def get_database() -> AsyncIOMotorDatabase:
    """Get database connection"""
    return mongodb.db
