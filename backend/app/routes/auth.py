from fastapi import APIRouter, HTTPException
from app.schemas.user_schema import UserCreate, UserLogin
from app.database.db import users_collection
from app.utils.auth_utils import hash_password, verify_password, create_access_token
from app.models.user import User

router = APIRouter()

@router.post("/register")
def register(user: UserCreate):
    existing = users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = hash_password(user.password)

    new_user = User(
        email=user.email,
        password=hashed_password
    )

    users_collection.insert_one(new_user.dict())

    return {"message": "User registered successfully"}


@router.post("/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})

    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.email})

    return {"access_token": token, "token_type": "bearer"}