import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav style={{
      height: 54, minHeight: 54,
      display: 'flex', alignItems: 'center', padding: '0 20px',
      borderBottom: '1px solid rgba(0,170,255,0.15)',
      background: 'rgba(3,7,18,0.95)',
      backdropFilter: 'blur(20px)',
      gap: 28, zIndex: 100, position: 'relative',
    }}>
      {/* Logo */}
      <div onClick={() => navigate('/')} style={{
        display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer',
        fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: 15,
        letterSpacing: '0.04em', color: '#00d4ff',
        textShadow: '0 0 20px rgba(0,212,255,0.6)', whiteSpace: 'nowrap',
      }}>
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" stroke="#00d4ff" strokeWidth="1.5" opacity="0.4" />
          <circle cx="16" cy="8" r="3" fill="#00d4ff" />
          <circle cx="8" cy="22" r="3" fill="#0077ff" />
          <circle cx="24" cy="22" r="3" fill="#00d4ff" />
          <line x1="16" y1="8" x2="8" y2="22" stroke="#00aaff" strokeWidth="1.2" opacity="0.6" />
          <line x1="16" y1="8" x2="24" y2="22" stroke="#00aaff" strokeWidth="1.2" opacity="0.6" />
          <line x1="8" y1="22" x2="24" y2="22" stroke="#00aaff" strokeWidth="1.2" opacity="0.6" />
        </svg>
        NeuralForge
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {[
          { label: 'Problems', path: '/problems' },
          { label: 'Learn', path: '/learn' },
          { label: 'Contest', path: '/contest', badge: 'LIVE' },
        ].map(link => (
          <div key={link.path}
            onClick={() => navigate(link.path)}
            style={{
              padding: '6px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              borderRadius: 6, transition: 'all 0.2s', whiteSpace: 'nowrap',
              color: pathname.startsWith(link.path) ? '#00d4ff' : '#64748b',
              background: pathname.startsWith(link.path) ? 'rgba(0,170,255,0.08)' : 'transparent',
            }}
            onMouseEnter={e => { if (!pathname.startsWith(link.path)) { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(0,170,255,0.06)' } }}
            onMouseLeave={e => { if (!pathname.startsWith(link.path)) { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent' } }}
          >
            {link.label}
            {link.badge && <span style={{ fontSize: 9, fontWeight: 700, background: '#0077ff', color: 'white', padding: '1px 5px', borderRadius: 3, letterSpacing: '0.06em', marginLeft: 5 }}>{link.badge}</span>}
          </div>
        ))}
      </div>

      {/* Right */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Discord */}
        <div title="Discord" style={{
          width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(88,101,242,0.15)', border: '1px solid rgba(88,101,242,0.35)',
          cursor: 'pointer', color: '#7289da', fontSize: 14, transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(88,101,242,0.3)'; e.currentTarget.style.color = '#a5b4fc' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(88,101,242,0.15)'; e.currentTarget.style.color = '#7289da' }}>
          <svg width="16" height="12" viewBox="0 0 640 512" fill="currentColor">
            <path d="M524.5 69.8a1.5 1.5 0 0 0-.764-.7A485.1 485.1 0 0 0 404.1 32a1.816 1.816 0 0 0-1.923.91 337.5 337.5 0 0 0-14.9 30.6 447.8 447.8 0 0 0-134.4 0 309.5 309.5 0 0 0-15.14-30.6 1.89 1.89 0 0 0-1.924-.91A483.7 483.7 0 0 0 116.1 69.1a1.712 1.712 0 0 0-.788.676C39.07 183.7 18.19 294.7 28.43 404.4a2.016 2.016 0 0 0 .765 1.375 487.7 487.7 0 0 0 146.6 74.08 1.9 1.9 0 0 0 2.063-.676A348.2 348.2 0 0 0 208.1 430.4a1.86 1.86 0 0 0-1.019-2.588 321.2 321.2 0 0 1-45.87-21.85 1.885 1.885 0 0 1-.185-3.126c3.082-2.309 6.166-4.711 9.109-7.137a1.819 1.819 0 0 1 1.9-.256c96.23 43.92 200.4 43.92 295.5 0a1.812 1.812 0 0 1 1.924.233c2.944 2.426 6.027 4.851 9.132 7.16a1.884 1.884 0 0 1-.162 3.126 301.4 301.4 0 0 1-45.89 21.83 1.875 1.875 0 0 0-1 2.611 391.1 391.1 0 0 0 30.01 48.81 1.864 1.864 0 0 0 2.063.7A486 486 0 0 0 610.7 405.7a1.882 1.882 0 0 0 .765-1.352C623.7 277.6 590.9 167.5 524.5 69.8zM222.5 337.6c-29 0-52.8-26.6-52.8-59.2S193.1 219.1 222.5 219.1c29.7 0 53.3 26.8 52.8 59.2C275.3 311 251.9 337.6 222.5 337.6zm195.4 0c-29 0-52.8-26.6-52.8-59.2S388.4 219.1 417.9 219.1c29.7 0 53.3 26.8 52.8 59.2C470.7 311 447.5 337.6 417.9 337.6z"/>
          </svg>
        </div>

        {/* Avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #0077ff, #00d4ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, cursor: 'pointer', color: 'white',
          boxShadow: '0 0 12px rgba(0,212,255,0.3)',
        }}>U</div>
      </div>
    </nav>
  )
}