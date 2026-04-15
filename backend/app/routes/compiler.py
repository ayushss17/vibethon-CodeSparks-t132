from fastapi import APIRouter, HTTPException, status, Header
from pydantic import BaseModel
from typing import Optional, List
from app.utils.code_executor import CodeExecutor
from app.utils.auth_utils import extract_token_from_header, verify_token
from app.database.mongo_db import get_database
from app.models.db_models import TestCaseResult, SubmissionResponse
from bson import ObjectId
from datetime import datetime
import json

router = APIRouter(prefix="/api/compiler", tags=["Compiler"])

class RunRequest(BaseModel):
    code: str
    problem_slug: str
    test_case_index: int = 0

class SubmitRequest(BaseModel):
    code: str
    problem_slug: str

class RunResponse(BaseModel):
    status: str
    test_case_index: int
    output: Optional[str] = None
    expected: Optional[str] = None
    error_message: Optional[str] = None
    runtime: str

async def get_current_user(authorization: Optional[str] = Header(None)):
    """Dependency to get current authenticated user"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    token = extract_token_from_header(authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )
    
    try:
        payload = verify_token(token)
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return user_id
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}"
        )

@router.post("/run", response_model=RunResponse)
async def run_code(
    request: RunRequest,
    user_id: str = None,
    authorization: Optional[str] = Header(None)
):
    """Run code against a single test case"""
    
    # Verify authentication
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    token = extract_token_from_header(authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )
    
    try:
        payload = verify_token(token)
        user_id = payload.get("user_id")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    
    # Execute code
    result = CodeExecutor.run_single_test_case(
        request.code,
        request.problem_slug,
        request.test_case_index
    )
    
    return RunResponse(**result)

@router.post("/submit", response_model=dict)
async def submit_code(
    request: SubmitRequest,
    authorization: Optional[str] = Header(None)
):
    """Submit code for a problem (runs all test cases)"""
    
    # Verify authentication
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    token = extract_token_from_header(authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )
    
    try:
        payload = verify_token(token)
        user_id = payload.get("user_id")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    
    # Get database connection
    db = get_database()
    
    # Check if problem exists
    test_cases = CodeExecutor.get_test_cases(request.problem_slug)
    if not test_cases:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found"
        )
    
    # Execute all test cases
    results, all_passed = CodeExecutor.run_all_test_cases(
        request.code,
        request.problem_slug
    )
    
    # Calculate test results
    test_case_results = []
    passed_count = 0
    
    for result in results:
        if result.get("status") == "passed":
            passed_count += 1
        
        test_case_results.append({
            "test_case_index": result.get("test_case_index", 0),
            "status": result.get("status", "error"),
            "output": result.get("output"),
            "expected": result.get("expected"),
            "error_message": result.get("error_message"),
            "runtime": result.get("runtime", "0ms")
        })
    
    total_tests = len(results)
    status_text = "Accepted" if all_passed else "Wrong Answer"
    runtime = results[0].get("runtime", "0ms") if results else "0ms"
    xp_earned = 0
    
    # If accepted, award XP and update user stats
    if all_passed:
        # Check if this is the first time solving this problem
        previous_submission = await db["submissions"].find_one({
            "user_id": user_id,
            "problem_slug": request.problem_slug,
            "all_passed": True
        })
        
        if not previous_submission:
            # First time solving - award XP
            xp_earned = 25  # Base XP for solving a problem
            
            # Update user stats
            user = await db["users"].find_one({"_id": ObjectId(user_id)})
            if user:
                new_xp = user.get("xp", 0) + xp_earned
                new_level = CodeExecutor.calculate_level(new_xp)
                
                await db["users"].update_one(
                    {"_id": ObjectId(user_id)},
                    {
                        "$set": {
                            "xp": new_xp,
                            "level": new_level,
                            "problems_solved": user.get("problems_solved", 0) + 1,
                            "updated_at": datetime.utcnow(),
                            "last_activity": datetime.utcnow()
                        }
                    }
                )
    
    # Save submission to database
    submission_doc = {
        "user_id": user_id,
        "problem_slug": request.problem_slug,
        "code": request.code,
        "status": status_text,
        "all_passed": all_passed,
        "test_results": test_case_results,
        "passed_tests": passed_count,
        "total_tests": total_tests,
        "runtime": runtime,
        "memory": "18.2 MB",
        "language": "Python 3",
        "xp_earned": xp_earned,
        "created_at": datetime.utcnow()
    }
    
    result = await db["submissions"].insert_one(submission_doc)
    
    # Also update total submissions count
    await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {
            "$inc": {"total_submissions": 1},
            "$set": {"last_activity": datetime.utcnow()}
        }
    )
    
    return {
        "submission_id": str(result.inserted_id),
        "status": status_text,
        "all_passed": all_passed,
        "passed_tests": passed_count,
        "total_tests": total_tests,
        "runtime": runtime,
        "memory": "18.2 MB",
        "language": "Python 3",
        "xp_earned": xp_earned,
        "test_results": test_case_results,
        "created_at": datetime.utcnow().isoformat()
    }

@router.get("/submissions/{problem_slug}")
async def get_submissions(
    problem_slug: str,
    authorization: Optional[str] = Header(None)
):
    """Get user's submissions for a problem"""
    
    # Verify authentication
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    token = extract_token_from_header(authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )
    
    try:
        payload = verify_token(token)
        user_id = payload.get("user_id")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    
    db = get_database()
    
    submissions = await db["submissions"].find(
        {
            "user_id": user_id,
            "problem_slug": problem_slug
        }
    ).sort("created_at", -1).to_list(length=None)
    
    return {
        "submissions": [
            {
                "id": str(sub["_id"]),
                "problem_slug": sub["problem_slug"],
                "status": sub["status"],
                "all_passed": sub.get("all_passed", False),
                "passed_tests": sub.get("passed_tests", 0),
                "total_tests": sub.get("total_tests", 0),
                "runtime": sub.get("runtime", "0ms"),
                "memory": sub.get("memory", "0MB"),
                "language": sub.get("language", "Python 3"),
                "xp_earned": sub.get("xp_earned", 0),
                "created_at": sub.get("created_at", datetime.utcnow()).isoformat()
            }
            for sub in submissions
        ]
    }
