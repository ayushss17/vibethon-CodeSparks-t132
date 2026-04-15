import asyncio
import sys
sys.path.insert(0, 'D:\\DYP_vibeathon\\vibethon-CodeSparks-t132\\backend')

from app.database.mongo_db import mongodb, connect_to_mongo
from app.utils.auth_utils import hash_password, create_access_token
from app.config import settings
from datetime import datetime

async def test_registration():
    """Test registration process"""
    try:
        # Initialize MongoDB
        await connect_to_mongo()
        print("✓ MongoDB connected")
        
        # Get database
        db = mongodb.db
        print(f"✓ Database: {db}")
        
        # Test data
        email = "test@example.com"
        username = "testuser"
        password = "password123"
        
        # Check if user exists
        existing = await db["users"].find_one({"email": email})
        print(f"✓ Existing user check: {existing}")
        
        # Hash password
        hashed = hash_password(password)
        print(f"✓ Password hashed: {len(hashed)} chars")
        
        # Create user document
        user_doc = {
            "email": email,
            "username": username,
            "hashed_password": hashed,
            "xp": 0,
            "level": 1,
            "current_streak": 0,
            "max_streak": 0,
            "badges": [],
            "problems_solved": 0,
            "total_submissions": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "last_activity": None
        }
        print(f"✓ User document created")
        
        # Insert user
        result = await db["users"].insert_one(user_doc)
        print(f"✓ User inserted with ID: {result.inserted_id}")
        
        # Create token
        user_id = str(result.inserted_id)
        token = create_access_token(user_id, email)
        print(f"✓ Token created: {token[:20]}...")
        
        print("\n✓ All tests passed!")
        
    except Exception as e:
        print(f"✗ Error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if mongodb.client:
            mongodb.client.close()

if __name__ == "__main__":
    asyncio.run(test_registration())
