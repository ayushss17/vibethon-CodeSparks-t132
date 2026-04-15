# MongoDB Atlas Setup Guide

## 🌍 Setting Up MongoDB Atlas (Free Tier)

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with your email or Google/GitHub account
4. Verify your email

### Step 2: Create an Organization and Project

1. After login, you'll be in the Atlas dashboard
2. Click "New Project"
3. Name your project: "AIML Playground"
4. Click "Create Project"
5. Click "Create" to create a new cluster

### Step 3: Create a Cluster

1. Select "Free Tier" (M0 - 512 MB storage)
2. Choose your preferred cloud provider (AWS, GCP, or Azure)
3. Choose a region closest to you
4. Click "Create Cluster"
5. Wait for the cluster to be created (this takes a few minutes)

### Step 4: Create Database User

Once the cluster is created:

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create username and password:
   - **Username**: `aiml_user` (or any name you prefer)
   - **Password**: Generate a strong password
   - Copy and save this password securely
4. Set "Built-in Role": **Atlas Admin**
5. Click "Add User"

### Step 5: Set Up Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow access from anywhere" (0.0.0.0/0)
4. For production: Add your specific IP address
5. Click "Confirm"

### Step 6: Get Connection String

1. Go back to "Clusters"
2. Click "Connect" button on your cluster
3. Select "Drivers"
4. Copy the connection string:
   ```
   mongodb+srv://aiml_user:password@cluster0.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace:
   - `aiml_user` with your username
   - `password` with your database password
   - `cluster0` with your actual cluster name

### Step 7: Update .env File

In your backend `.env` file:

```env
MONGODB_URL=mongodb+srv://aiml_user:your_password@cluster0.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=aiml_playground
JWT_SECRET_KEY=your-super-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
```

### Step 8: Test the Connection

Run your backend server:

```bash
python -m uvicorn app.main:app --reload
```

Check the console output. You should see:
```
✓ Connected to MongoDB
✓ Indexes created
```

---

## 🗄️ MongoDB Collections Structure

The application will automatically create these collections:

### users
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  username: "ayush_sawant",
  hashed_password: "bcrypt_hash",
  xp: 0,
  level: 1,
  current_streak: 0,
  max_streak: 0,
  badges: [],
  problems_solved: 0,
  total_submissions: 0,
  created_at: ISODate("2024-04-15T10:30:00Z"),
  updated_at: ISODate("2024-04-15T10:30:00Z"),
  last_activity: null
}
```

### submissions
```javascript
{
  _id: ObjectId,
  user_id: "507f1f77bcf86cd799439011",
  problem_slug: "sigmoid-numpy",
  code: "def sigmoid(x): ...",
  status: "Accepted",
  all_passed: true,
  test_results: [...],
  passed_tests: 3,
  total_tests: 3,
  runtime: "245ms",
  memory: "18.2 MB",
  language: "Python 3",
  xp_earned: 25,
  created_at: ISODate("2024-04-15T10:35:00Z")
}
```

---

## 🔄 Troubleshooting

### Connection Refused
- **Issue**: Cannot connect to MongoDB
- **Solution**: 
  1. Verify connection string is correct
  2. Check that your IP is whitelisted in "Network Access"
  3. Ensure username and password are correct
  4. Check that the cluster is running (not paused)

### Authentication Failed
- **Issue**: "Authentication failed"
- **Solution**:
  1. Verify username and password in connection string
  2. Make sure database password is URL-encoded if it contains special characters
  3. Check that the user exists in "Database Access"

### Cluster Paused
- **Issue**: 504 Service Unavailable
- **Solution**:
  1. Go to "Clusters"
  2. Click the resume button on your cluster
  3. Wait for it to start

### Missing Database
- **Issue**: Database doesn't exist
- **Solution**:
  1. MongoDB Atlas creates the database automatically on first insert
  2. Run the backend server - it will create indexes and the database

---

## 📊 Managing Data with MongoDB Atlas

### View Data in Collections

1. Go to "Clusters"
2. Click "Browse Collections"
3. Select your database and collection
4. View documents in a GUI interface

### Backup and Export Data

1. Go to "Backup" in the left sidebar
2. Click "Restore a Backup"
3. You can download data as JSON

### Delete Data (For Testing)

1. Go to "Browse Collections"
2. Click the delete icon next to any document to delete it
3. Or use the MongoDB CLI for bulk operations

---

## 🔐 Security Best Practices

For **Development**:
- Use the free tier credentials
- Allow 0.0.0.0/0 for network access (okay for development)

For **Production**:
- Create a dedicated user with limited permissions
- Use strong passwords (min 16 characters, mixed case, numbers, symbols)
- Whitelist only specific IP addresses
- Enable encryption at rest
- Enable two-factor authentication on your Atlas account
- Regularly backup data
- Use VPN or private endpoints

---

## 💡 Tips

1. **Check Connection**: Use MongoDB Compass (desktop app) to visualize your database
2. **Query Data**: Use the MongoDB Atlas console to write custom queries
3. **Monitor Performance**: Check the Metrics tab to monitor server performance
4. **Free Tier Limits**:
   - 512 MB storage
   - 100 connections
   - 5 GB transfer per week
   - Shared cluster (shared with other users)

---

## 📚 Resources

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- MongoDB University: https://university.mongodb.com/ (free courses)
- MongoDB Query Language: https://docs.mongodb.com/manual/
- Connection String Reference: https://docs.mongodb.com/manual/reference/connection-string/
