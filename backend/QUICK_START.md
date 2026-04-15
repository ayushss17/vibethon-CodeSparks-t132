# 🚀 Backend Quick Start Guide

## Installation

```bash
cd backend
pip install -r requirements.txt
```

## Configure MongoDB

1. Create MongoDB Atlas account: https://www.mongodb.com/cloud/atlas
2. Create cluster (free tier)
3. Get connection string
4. Update `.env` file:

```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

## Run Backend

```bash
python -m uvicorn app.main:app --reload
```

API will be available at: `http://localhost:8000`

API Docs: `http://localhost:8000/docs` (Swagger UI)

---

## 📍 Key API Endpoints

### Authentication
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |
| GET | `/api/auth/profile` | Get user profile (needs token) |

### Code Execution
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/compiler/run` | Run single test case |
| POST | `/api/compiler/submit` | Submit & run all tests |
| GET | `/api/compiler/submissions/{problem_slug}` | Get submission history |

---

## 🧪 Test Registration & Login

### Register User
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user_id": "507f...",
  "username": "testuser",
  "email": "test@example.com"
}
```

### Login
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test a Submission

```bash
curl -X POST "http://localhost:8000/api/compiler/submit" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def sigmoid(x):\n    import numpy as np\n    return 1 / (1 + np.exp(-x))",
    "problem_slug": "sigmoid-numpy"
  }'
```

---

## 🗂️ Project Structure

```
backend/
├── app/
│   ├── main.py              ← FastAPI app
│   ├── config.py            ← Settings
│   ├── database/
│   │   └── mongo_db.py      ← MongoDB connection
│   ├── routes/
│   │   ├── auth.py          ← Auth endpoints
│   │   └── compiler.py      ← Compiler endpoints
│   ├── models/
│   │   └── db_models.py     ← Data models
│   ├── schemas/
│   │   └── auth_schemas.py  ← Request/response schemas
│   └── utils/
│       ├── auth_utils.py    ← JWT, bcrypt
│       └── code_executor.py ← Code execution
├── requirements.txt
├── .env
└── README_BACKEND.md
```

---

## 🔑 Key Features

✅ **Authentication**
- Register with email validation
- Login with JWT tokens
- 24-hour token expiration
- Password hashing with bcrypt

✅ **Code Execution**
- Run code against test cases
- Compare results automatically
- Measure runtime
- Handle errors gracefully

✅ **Database**
- MongoDB Atlas integration
- User persistence
- Submission tracking
- Async/await support

✅ **Gamification**
- XP earning (25 per problem)
- Level calculation (5 levels)
- Streak tracking
- Badge framework

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` |
| MongoDB connection failed | Check `.env`, verify IP whitelisted |
| `404 Not Found` | Check endpoint path, ensure server running |
| `401 Unauthorized` | Token missing/expired, login again |
| Code execution timeout | Code may have infinite loop, 5s limit |

---

## 📊 Database Collections

### users
- Stores user data, XP, levels, streaks, badges
- Indexed by email (unique)

### submissions
- Stores code submissions and test results
- Indexed by user_id + problem_slug

---

## 🔄 Workflow

1. User registers → JWT token created → Stored in frontend
2. User writes code → Click "Run" → Single test executed
3. All tests pass → Click "Submit" → All tests executed
4. Submission successful → XP awarded → Level updated
5. User views profile → Stats displayed from database

---

## 📚 Documentation Files

- `README_BACKEND.md` - Full API documentation
- `MONGODB_SETUP.md` - MongoDB Atlas setup guide
- `BACKEND_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `AIML_Playground.postman_collection.json` - Postman collection

---

## 💡 Development Tips

1. **Use Swagger UI**: Go to `http://localhost:8000/docs` for interactive API testing
2. **Import Postman Collection**: Use `AIML_Playground.postman_collection.json`
3. **Check Logs**: Watch console for error messages
4. **Database Viewer**: Use MongoDB Atlas console to browse data
5. **Token Storage**: Save JWT token from login for testing authenticated endpoints

---

## 🎯 Supported Problems

| Problem | Slug | Tests |
|---------|------|-------|
| Sigmoid Function | sigmoid-numpy | 3 |
| Logistic Regression | logistic-regression-training | 1 |
| Matrix Transpose | matrix-transpose | 3 |
| Gradient Descent | gradient-descent-quadratic | 2 |
| Positional Encoding | positional-encoding | 1 |

---

## ⏱️ Timeline

### Phase 1 ✅ (Completed)
- Authentication system
- Code compilation API
- MongoDB integration
- Gamification framework

### Phase 2 (Next)
- Frontend integration
- Profile page implementation
- Streak reset logic
- Badge system activation

### Phase 3 (Future)
- Leaderboard
- Advanced analytics
- More problems
- Admin panel

---

## 🆘 Getting Help

1. Check `README_BACKEND.md` for full API documentation
2. Review API responses in Swagger UI: `http://localhost:8000/docs`
3. Check console logs for error messages
4. Verify MongoDB connection in `.env` file
5. Test with provided cURL commands

---

Last Updated: April 15, 2024
