from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Optional
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError(f"Invalid ObjectId: {v}")
        return ObjectId(v)

# ─────────────────────────────────────────────────────────────────────────────
# USER MODELS
# ─────────────────────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserRegister(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDB(UserBase):
    id: PyObjectId = Field(alias="_id")
    hashed_password: str
    xp: int = 0
    level: int = 1
    current_streak: int = 0
    max_streak: int = 0
    badges: List[str] = []
    problems_solved: int = 0
    total_submissions: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: Optional[datetime] = None
    
    class Config:
        populate_by_name = True

class UserResponse(UserBase):
    id: str = Field(alias="_id")
    xp: int
    level: int
    current_streak: int
    max_streak: int
    badges: List[str]
    problems_solved: int
    total_submissions: int
    created_at: datetime
    
    class Config:
        populate_by_name = True

class TokenData(BaseModel):
    user_id: str
    email: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ─────────────────────────────────────────────────────────────────────────────
# SUBMISSION MODELS
# ─────────────────────────────────────────────────────────────────────────────

class TestCaseResult(BaseModel):
    test_case_index: int
    status: str  # "passed" or "wrong"
    output: Optional[str] = None
    expected: Optional[str] = None
    error_message: Optional[str] = None
    runtime: str

class SubmissionBase(BaseModel):
    code: str
    problem_slug: str

class SubmissionInDB(SubmissionBase):
    id: PyObjectId = Field(alias="_id")
    user_id: str
    status: str  # "Accepted" or "Wrong Answer"
    all_passed: bool
    test_results: List[TestCaseResult]
    passed_tests: int
    total_tests: int
    runtime: str
    memory: str
    language: str = "Python 3"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    xp_earned: int = 0
    
    class Config:
        populate_by_name = True

class SubmissionResponse(BaseModel):
    id: str = Field(alias="_id")
    problem_slug: str
    status: str
    all_passed: bool
    passed_tests: int
    total_tests: int
    runtime: str
    memory: str
    language: str
    created_at: datetime
    xp_earned: int
    
    class Config:
        populate_by_name = True

# ─────────────────────────────────────────────────────────────────────────────
# PROBLEM MODELS
# ─────────────────────────────────────────────────────────────────────────────

class ProblemInDB(BaseModel):
    id: PyObjectId = Field(alias="_id")
    slug: str
    title: str
    description: str
    difficulty: str  # "easy", "medium", "hard"
    xp_reward: int
    test_cases_count: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

# ─────────────────────────────────────────────────────────────────────────────
# ACTIVITY MODELS
# ─────────────────────────────────────────────────────────────────────────────

class Activity(BaseModel):
    id: PyObjectId = Field(alias="_id")
    user_id: str
    type: str  # "submission", "problem_solved", "badge_earned"
    problem_slug: Optional[str] = None
    status: str  # "success", "failed"
    xp_earned: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
