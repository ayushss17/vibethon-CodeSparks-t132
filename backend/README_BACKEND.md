# AIML Playground - Backend Setup Guide

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- MongoDB Atlas account (free tier available)
- pip (Python package manager)

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new project and cluster
4. Get your connection string (it should look like):
   ```
   mongodb+srv://username:password@cluster0.mongodb.net/?retryWrites=true&w=majority
   ```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
# .env file
MONGODB_URL=mongodb+srv://username:password@cluster0.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=aiml_playground
JWT_SECRET_KEY=your-super-secret-key-change-this
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
```

### 4. Run the Backend Server

```bash
python -m uvicorn app.main:app --reload
```

The API will be available at: `http://localhost:8000`

API Documentation (Swagger UI): `http://localhost:8000/docs`

---

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "ayush_sawant",
  "password": "securePassword123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "507f1f77bcf86cd799439011",
  "username": "ayush_sawant",
  "email": "user@example.com"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "507f1f77bcf86cd799439011",
  "username": "ayush_sawant",
  "email": "user@example.com"
}
```

#### Get User Profile
```
GET /api/auth/profile
Authorization: Bearer {access_token}

Response:
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "username": "ayush_sawant",
  "xp": 125,
  "level": 2,
  "current_streak": 5,
  "max_streak": 10,
  "badges": ["first_submission", "problem_solver"],
  "problems_solved": 5,
  "total_submissions": 8,
  "created_at": "2024-04-15T10:30:00"
}
```

### Compiler Routes (`/api/compiler`)

#### Run Code (Single Test Case)
```
POST /api/compiler/run
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "code": "def sigmoid(x):\n    import numpy as np\n    return 1 / (1 + np.exp(-x))",
  "problem_slug": "sigmoid-numpy",
  "test_case_index": 0
}

Response:
{
  "status": "passed",
  "test_case_index": 0,
  "output": "[0.5, 0.88..., 0.119...]",
  "expected": "[0.5, 0.8807970779778823, 0.11920292202211755]",
  "runtime": "245ms"
}
```

#### Submit Code (All Test Cases)
```
POST /api/compiler/submit
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "code": "def sigmoid(x):\n    import numpy as np\n    return 1 / (1 + np.exp(-x))",
  "problem_slug": "sigmoid-numpy"
}

Response:
{
  "submission_id": "507f1f77bcf86cd799439011",
  "status": "Accepted",
  "all_passed": true,
  "passed_tests": 3,
  "total_tests": 3,
  "runtime": "245ms",
  "memory": "18.2 MB",
  "language": "Python 3",
  "xp_earned": 25,
  "test_results": [
    {
      "test_case_index": 0,
      "status": "passed",
      "output": "[0.5, 0.88..., 0.119...]",
      "expected": "[0.5, 0.8807970779778823, 0.11920292202211755]",
      "runtime": "245ms"
    },
    ...
  ],
  "created_at": "2024-04-15T10:35:00"
}
```

#### Get Submissions for a Problem
```
GET /api/compiler/submissions/{problem_slug}
Authorization: Bearer {access_token}

Response:
{
  "submissions": [
    {
      "id": "507f1f77bcf86cd799439011",
      "problem_slug": "sigmoid-numpy",
      "status": "Accepted",
      "all_passed": true,
      "passed_tests": 3,
      "total_tests": 3,
      "runtime": "245ms",
      "memory": "18.2 MB",
      "language": "Python 3",
      "xp_earned": 25,
      "created_at": "2024-04-15T10:35:00"
    }
  ]
}
```

---

## 📦 Database Schema

### Users Collection
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "username": "ayush_sawant",
  "hashed_password": "hashed_bcrypt_password",
  "xp": 125,
  "level": 2,
  "current_streak": 5,
  "max_streak": 10,
  "badges": ["first_submission", "problem_solver"],
  "problems_solved": 5,
  "total_submissions": 8,
  "created_at": ISODate,
  "updated_at": ISODate,
  "last_activity": ISODate
}
```

### Submissions Collection
```json
{
  "_id": ObjectId,
  "user_id": "507f1f77bcf86cd799439011",
  "problem_slug": "sigmoid-numpy",
  "code": "def sigmoid(x):\n    ...",
  "status": "Accepted",
  "all_passed": true,
  "test_results": [
    {
      "test_case_index": 0,
      "status": "passed",
      "output": "[0.5, 0.88...]",
      "expected": "[0.5, 0.8807...]",
      "error_message": null,
      "runtime": "245ms"
    }
  ],
  "passed_tests": 3,
  "total_tests": 3,
  "runtime": "245ms",
  "memory": "18.2 MB",
  "language": "Python 3",
  "xp_earned": 25,
  "created_at": ISODate
}
```

---

## 🎯 Features Implemented

### ✅ Authentication
- User registration with email validation
- Login with JWT tokens
- Password hashing with bcrypt
- Token verification middleware
- Profile endpoint with protected access

### ✅ Code Compilation & Execution
- Run code against single test case
- Submit code to run all test cases
- Test result comparison with tolerance
- Runtime and memory tracking
- Error handling and reporting

### ✅ Gamification System
- XP earning (25 XP per problem solved first time)
- Level calculation based on XP thresholds
- Streak tracking (current and max)
- Badge system (extensible)
- Problem solving statistics

### ✅ User Activity Tracking
- Submission history per user
- Last activity tracking
- Total submissions and problems solved
- Per-problem submission history

### ✅ Database Integration
- MongoDB Atlas with async motor driver
- User data persistence
- Submission history persistence
- Efficient indexing for queries

---

## 🔧 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app setup
│   ├── config.py              # Configuration (settings, env vars)
│   ├── database/
│   │   ├── __init__.py
│   │   └── mongo_db.py        # MongoDB connection and initialization
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py            # User model (legacy)
│   │   └── db_models.py       # MongoDB Pydantic models
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py            # Authentication endpoints
│   │   └── compiler.py        # Code execution endpoints
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user_schema.py     # User schemas (legacy)
│   │   └── auth_schemas.py    # Authentication request/response schemas
│   └── utils/
│       ├── __init__.py
│       ├── auth_utils.py      # JWT and password utilities
│       └── code_executor.py   # Code execution logic
├── requirements.txt
├── .env.example
├── .env
└── README_BACKEND.md
```

---

## 🚨 Security Considerations

1. **Change JWT Secret Key**: Update `JWT_SECRET_KEY` in `.env` with a strong random key
2. **HTTPS in Production**: Always use HTTPS when deploying
3. **MongoDB Security**: 
   - Enable AWS IP whitelist
   - Use strong passwords
   - Enable encryption
4. **Rate Limiting**: Consider adding rate limiting for API endpoints
5. **Input Validation**: All inputs are validated using Pydantic

---

## 🧪 Testing the API

### Using cURL

```bash
# Register
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'

# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get Profile
curl -X GET "http://localhost:8000/api/auth/profile" \
  -H "Authorization: Bearer {access_token}"

# Run Code
curl -X POST "http://localhost:8000/api/compiler/run" \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def sigmoid(x):\n    import numpy as np\n    return 1 / (1 + np.exp(-x))",
    "problem_slug": "sigmoid-numpy",
    "test_case_index": 0
  }'
```

---

## 📝 Next Steps

1. Update the frontend to use the new authentication API
2. Implement profile page in the frontend (matching the design in the image)
3. Connect frontend's "Run" and "Submit" buttons to the compiler API
4. Add more problems and test cases
5. Implement badge system logic
6. Add analytics and progress tracking

---

## 🤝 Support

For issues or questions, refer to:
- FastAPI Docs: https://fastapi.tiangolo.com/
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas/register
- JWT: https://pyjwt.readthedocs.io/
