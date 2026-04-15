from typing import List, Dict
from pydantic import BaseModel, EmailStr

class User(BaseModel):
    email: EmailStr
    password: str
    xp: int = 0
    level: int = 1
    streak: int = 0
    badges: List[str] = []
    progress: Dict[str, Dict] = {}