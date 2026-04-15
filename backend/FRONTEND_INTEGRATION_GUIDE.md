# Frontend-Backend Integration Guide

## 🔗 Connecting Frontend to Backend

This guide shows how to integrate the React frontend with the FastAPI backend.

---

## 📦 Required Frontend Dependencies

Update your `frontend/package.json`:

```json
{
  "dependencies": {
    "react": "^19.2.2",
    "react-dom": "^19.2.2",
    "react-router-dom": "^7.14.1",
    "axios": "^1.6.0"
  }
}
```

Install axios:
```bash
cd frontend
npm install axios
```

---

## 🔐 Authentication Flow

### 1. Create Auth Service

Create `frontend/src/services/authService.js`:

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

const authService = {
  register: async (email, username, password) => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        email,
        username,
        password
      });
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Registration failed';
    }
  },

  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password
      });
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Login failed';
    }
  },

  getProfile: async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Failed to fetch profile';
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }
};

export default authService;
```

---

## 💻 Compiler Service

Create `frontend/src/services/compilerService.js`:

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/compiler';

const getToken = () => localStorage.getItem('access_token');

const compilerService = {
  runCode: async (code, problemSlug, testCaseIndex = 0) => {
    try {
      const response = await axios.post(`${API_URL}/run`, {
        code,
        problem_slug: problemSlug,
        test_case_index: testCaseIndex
      }, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Code execution failed';
    }
  },

  submitCode: async (code, problemSlug) => {
    try {
      const response = await axios.post(`${API_URL}/submit`, {
        code,
        problem_slug: problemSlug
      }, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Code submission failed';
    }
  },

  getSubmissions: async (problemSlug) => {
    try {
      const response = await axios.get(`${API_URL}/submissions/${problemSlug}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Failed to fetch submissions';
    }
  }
};

export default compilerService;
```

---

## 🔑 Protected Route Component

Create `frontend/src/components/ProtectedRoute.jsx`:

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/landing" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

---

## 📝 Update Landing Component

Update `frontend/src/pages/Landing.jsx`:

```jsx
import React, { useState } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import '../css/Landing.css';

const Landing = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await authService.login(formData.email, formData.password);
      } else {
        await authService.register(
          formData.email,
          formData.username,
          formData.password
        );
      }
      navigate('/problems');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-container">
      <div className="auth-form">
        <h1>{isLogin ? 'Login' : 'Register'}</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <p className="toggle-auth">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="link-button"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Landing;
```

---

## 💾 Update ProblemDetail Component

Update `frontend/src/pages/ProblemDetail.jsx`:

```jsx
import React, { useState } from 'react';
import compilerService from '../services/compilerService';
import '../css/ProblemDetail.css';

const ProblemDetail = ({ problem }) => {
  const [code, setCode] = useState('def solution():\n    pass');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      const result = await compilerService.runCode(
        code,
        problem.slug,
        0 // test case index
      );
      setOutput(JSON.stringify(result, null, 2));
    } catch (error) {
      setOutput(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await compilerService.submitCode(code, problem.slug);
      setTestResults(result.test_results);
      setSubmitted(true);
      setOutput(JSON.stringify(result, null, 2));
      
      // Show success message
      if (result.all_passed) {
        alert(`✅ Accepted! You earned ${result.xp_earned} XP`);
      } else {
        alert('❌ Some test cases failed');
      }
    } catch (error) {
      setOutput(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="problem-detail-container">
      <div className="problem-panel">
        <h1>{problem.title}</h1>
        <p>{problem.description}</p>
        <p className="difficulty">Difficulty: {problem.difficulty}</p>
        <p className="xp-reward">Reward: {problem.xp} XP</p>
      </div>

      <div className="editor-panel">
        <h2>Code Editor</h2>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Write your solution here..."
          className="code-editor"
        />

        <div className="button-group">
          <button onClick={handleRun} disabled={loading} className="btn-run">
            {loading ? 'Running...' : '▶ Run'}
          </button>
          <button onClick={handleSubmit} disabled={loading} className="btn-submit">
            {loading ? 'Submitting...' : '✓ Submit'}
          </button>
        </div>

        {output && (
          <div className="output-panel">
            <h3>Output</h3>
            <pre>{output}</pre>
          </div>
        )}

        {submitted && testResults.length > 0 && (
          <div className="test-results">
            <h3>Test Results</h3>
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`test-case ${result.status === 'passed' ? 'passed' : 'failed'}`}
              >
                <span>Test {index + 1}: {result.status.toUpperCase()}</span>
                <span>Runtime: {result.runtime}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDetail;
```

---

## 👤 Create Profile Page

Create `frontend/src/pages/Profile.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import compilerService from '../services/compilerService';
import '../css/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const profileData = await authService.getProfile();
      setUser(profileData);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user data</div>;

  return (
    <div className="profile-container">
      {/* User Info Card */}
      <div className="user-card">
        <div className="avatar">
          <img src={`https://ui-avatars.com/api/?name=${user.username}`} alt="" />
        </div>
        <h1>{user.username}</h1>
        <p className="email">@{user.username}</p>
        <button className="edit-profile-btn">Edit Profile →</button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat">
          <span className="label">Problems Solved</span>
          <span className="value">{user.problems_solved}</span>
        </div>
        <div className="stat">
          <span className="label">Current Streak</span>
          <span className="value">{user.current_streak}</span>
        </div>
        <div className="stat">
          <span className="label">Max Streak</span>
          <span className="value">{user.max_streak}</span>
        </div>
        <div className="stat">
          <span className="label">Total Submissions</span>
          <span className="value">{user.total_submissions}</span>
        </div>
      </div>

      {/* Level & XP */}
      <div className="level-section">
        <div className="level-card">
          <h2>Level {user.level}</h2>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${(user.xp % 100)}%` }}></div>
          </div>
          <p className="xp-text">XP: {user.xp}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="badges-section">
        <h2>Badges ({user.badges.length})</h2>
        <div className="badges-grid">
          {user.badges.map((badge, index) => (
            <div key={index} className="badge">
              🏆 {badge}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h2>Recent Activity</h2>
        {user.last_activity ? (
          <p>Last active: {new Date(user.last_activity).toLocaleDateString()}</p>
        ) : (
          <p>No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
```

---

## 🔄 Update App Router

Update `frontend/src/App.jsx`:

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />

        <Route
          path="/problems"
          element={
            <ProtectedRoute>
              <Problems />
            </ProtectedRoute>
          }
        />

        <Route
          path="/problem/:slug"
          element={
            <ProtectedRoute>
              <ProblemDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
```

---

## 🎨 Update Navbar

Create `frontend/src/components/Navbar.jsx`:

```jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../css/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    authService.logout();
    navigate('/landing');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">🚀 AIML Playground</Link>
      </div>

      <ul className="nav-menu">
        {token && (
          <>
            <li><Link to="/problems">Problems</Link></li>
            <li><Link to="/profile">👤 {user.username}</Link></li>
            <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
          </>
        )}
        {!token && (
          <>
            <li><Link to="/landing">Login</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
```

---

## 🚀 Running the Full Stack

### Terminal 1: Backend
```bash
cd backend
python -m uvicorn app.main:app --reload
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

---

## ✅ Integration Checklist

- [ ] Install axios in frontend
- [ ] Create auth service
- [ ] Create compiler service
- [ ] Create protected route component
- [ ] Update Landing component
- [ ] Update ProblemDetail component
- [ ] Create Profile page
- [ ] Update Navbar
- [ ] Update App.jsx routes
- [ ] Test authentication flow
- [ ] Test code submission
- [ ] Test profile display

---

## 🔍 Testing Workflow

1. **Register**: Create new account at landing page
2. **Browse Problems**: View problem list
3. **Write Code**: Enter solution code
4. **Run Code**: Test single test case
5. **Submit Code**: Submit for all test cases
6. **View Profile**: Check earned XP and stats

---

## 🐛 Debug Tips

1. Check browser console for errors
2. Monitor network tab to see API calls
3. Verify token is saved in localStorage
4. Check backend logs for detailed errors
5. Use Swagger UI to test API directly

---

## 📚 Full Documentation

See individual documentation files:
- `README_BACKEND.md` - Backend API details
- `QUICK_START.md` - Quick reference
- `MONGODB_SETUP.md` - Database setup

Ready to integrate! 🎉
