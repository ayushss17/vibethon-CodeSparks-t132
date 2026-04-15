from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from app.schemas.auth_schemas import RegisterRequest, LoginRequest, TokenResponse
from app.utils.auth_utils import hash_password, verify_password, create_access_token
from app.database.mongo_db import get_database
from app.models.db_models import UserInDB, UserResponse
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest):
    """Register a new user"""
    db = get_database()
    
    # Check if user already exists
    existing_user = await db["users"].find_one({"email": request.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check username availability
    existing_username = await db["users"].find_one({"username": request.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = hash_password(request.password)
    user_doc = {
        "email": request.email,
        "username": request.username,
        "hashed_password": hashed_password,
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
    
    result = await db["users"].insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Generate token
    token = create_access_token(user_id, request.email)
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user_id,
        username=request.username,
        email=request.email
    )

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Login user and return JWT token"""
    db = get_database()
    
    user = await db["users"].find_one({"email": request.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Update last activity
    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"last_activity": datetime.utcnow()}}
    )
    
    # Generate token
    token = create_access_token(str(user["_id"]), user["email"])
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=str(user["_id"]),
        username=user["username"],
        email=user["email"]
    )

@router.get("/profile", response_model=UserResponse)
async def get_profile(authorization: str = None):
    """Get user profile (requires authentication)"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    from app.utils.auth_utils import extract_token_from_header, verify_token
    
    token = extract_token_from_header(authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header"
        )
    
    try:
        payload = verify_token(token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(payload["user_id"])})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        _id=str(user["_id"]),
        email=user["email"],
        username=user["username"],
        xp=user.get("xp", 0),
        level=user.get("level", 1),
        current_streak=user.get("current_streak", 0),
        max_streak=user.get("max_streak", 0),
        badges=user.get("badges", []),
        problems_solved=user.get("problems_solved", 0),
        total_submissions=user.get("total_submissions", 0),
        created_at=user.get("created_at", datetime.utcnow())
    )