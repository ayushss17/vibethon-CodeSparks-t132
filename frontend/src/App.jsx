import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Problems from './pages/Problems'
import ProblemDetail from './pages/ProblemDetail'

function AppInner() {
  const { pathname } = useLocation()
  const showNavbar = pathname !== '/'  // Landing has its own nav
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      {showNavbar && <Navbar />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: pathname === '/' ? 'auto' : 'hidden' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/:slug" element={<ProblemDetail />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AuthProvider>
  )
}