import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Animated Neural Network Background ──────────────────────────────────────
function NeuralBg() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const nodes = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 1,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1
      })
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 130) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(42,159,255,${0.07 * (1 - dist / 130)})`
            ctx.lineWidth = 0.6
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(42,159,255,0.25)'
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId) }
  }, [])

  return <canvas ref={canvasRef} id="neural-canvas" />
}

// ── Stats ticker ─────────────────────────────────────────────────────────────
const STATS = [
  { value: '150+', label: 'AIML Problems' },
  { value: '6', label: 'Topic Sheets' },
  { value: '10K+', label: 'Learners' },
  { value: '95%', label: 'Interview Success' },
]

// ── Problem categories preview ────────────────────────────────────────────────
const PROBLEM_CARDS = [
  { icon: '🔥', title: 'PyTorch Sheet', count: 30, color: '#ee4b2b', bg: 'rgba(238,75,43,0.1)' },
  { icon: '🧠', title: 'Cracking ML', count: 35, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  { icon: '⚡', title: 'Deep Learning', count: 35, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { icon: '🔢', title: 'NumPy Sheet', count: 25, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  { icon: '🗃️', title: 'SQL Sheet', count: 25, color: '#10b981', bg: 'rgba(16,185,129,0.1)', soon: true },
  { icon: '📊', title: 'Stats & Prob', count: 20, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', soon: true },
]

// ── Feature list ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '⚡',
    title: 'Interactive Code Playground',
    desc: 'Write and execute Python directly in your browser. Real-time feedback, test cases, and instant results.',
    color: '#f59e0b',
  },
  {
    icon: '📐',
    title: 'Visual Concept Explanations',
    desc: 'Understand sigmoid curves, gradient descent paths, attention heads — through interactive charts you control.',
    color: '#a855f7',
  },
  {
    icon: '🏆',
    title: 'Structured Learning Paths',
    desc: 'Curated problem sets ordered from foundations to advanced. Never wonder what to study next.',
    color: '#2a9fff',
  },
  {
    icon: '🧪',
    title: 'Instant Grading & Feedback',
    desc: 'Submit code and get immediate test results. Wrong answer? See exactly which case failed and why.',
    color: '#10b981',
  },
  {
    icon: '🗺️',
    title: 'Topic-Wise Problem Sheets',
    desc: 'From PyTorch internals to NumPy vectorization — drill any concept deeply with focused problem sets.',
    color: '#ec4899',
  },
  {
    icon: '📈',
    title: 'Progress Tracking',
    desc: 'Track solved problems, accuracy by topic, and difficulty distribution. See your weak spots and crush them.',
    color: '#06b6d4',
  },
]

// ── Sample Problems (preview on landing) ─────────────────────────────────────
const SAMPLE_PROBLEMS = [
  { id: 1, title: 'Implement Sigmoid in NumPy', difficulty: 'Easy', topic: 'Activation Functions', slug: 'sigmoid-numpy' },
  { id: 2, title: 'Logistic Regression Training Loop', difficulty: 'Medium', topic: 'Optimization', slug: 'logistic-regression-training' },
  { id: 3, title: 'Convolution Padding (same vs valid)', difficulty: 'Medium', topic: 'Computer Vision', slug: 'conv-padding' },
  { id: 4, title: 'Matrix Transpose', difficulty: 'Easy', topic: 'Linear Algebra', slug: 'matrix-transpose' },
  { id: 5, title: 'Positional Encoding (sin/cos)', difficulty: 'Medium', topic: 'Transformers', slug: 'positional-encoding' },
]

// ── Hero typed text ───────────────────────────────────────────────────────────
const TYPED_PHRASES = ['Activation Functions', 'Gradient Descent', 'Transformers', 'Loss Functions', 'Backpropagation']

export default function Landing() {
  const navigate = useNavigate()
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [typing, setTyping] = useState(true)

  useEffect(() => {
    const phrase = TYPED_PHRASES[phraseIdx]
    let i = displayed.length
    let timeout

    if (typing) {
      if (i < phrase.length) {
        timeout = setTimeout(() => setDisplayed(phrase.slice(0, i + 1)), 60)
      } else {
        timeout = setTimeout(() => setTyping(false), 1800)
      }
    } else {
      if (i > 0) {
        timeout = setTimeout(() => setDisplayed(phrase.slice(0, i - 1)), 35)
      } else {
        setTyping(true)
        setPhraseIdx(p => (p + 1) % TYPED_PHRASES.length)
      }
    }
    return () => clearTimeout(timeout)
  }, [displayed, typing, phraseIdx])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', position: 'relative' }}>
      <NeuralBg />

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <nav className="navbar" style={{ position: 'sticky', top: 0 }}>
        <div className="nav-logo cursor-pointer" onClick={() => navigate('/')}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <circle cx="13" cy="13" r="12" stroke="#2a9fff" strokeWidth="1.5" opacity="0.4"/>
            <circle cx="13" cy="13" r="5" fill="#2a9fff" opacity="0.9"/>
            <line x1="13" y1="1" x2="13" y2="6" stroke="#2a9fff" strokeWidth="1.5"/>
            <line x1="13" y1="20" x2="13" y2="25" stroke="#2a9fff" strokeWidth="1.5"/>
            <line x1="1" y1="13" x2="6" y2="13" stroke="#2a9fff" strokeWidth="1.5"/>
            <line x1="20" y1="13" x2="25" y2="13" stroke="#2a9fff" strokeWidth="1.5"/>
          </svg>
          NeuralForge
        </div>
        <div style={{ display:'flex', gap:4, flex:1 }}>
          {['Problems','Learn','Discuss'].map(l => (
            <span key={l} className="nav-link" style={{ cursor:'pointer' }}
              onClick={() => l === 'Problems' ? navigate('/problems') : null}>{l}</span>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, marginLeft:'auto', alignItems:'center' }}>
          <button className="btn-ghost" style={{ padding:'5px 16px', fontSize:13 }}>Sign In</button>
          <button className="btn-primary" style={{ padding:'5px 16px', fontSize:13 }}
            onClick={() => navigate('/problems')}>Get Started</button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', zIndex: 1, textAlign: 'center',
        padding: '100px 24px 80px',
        background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(42,159,255,0.12) 0%, transparent 60%)',
      }}>
        {/* Badge */}
        <div style={{
          display:'inline-flex', alignItems:'center', gap:8,
          background:'rgba(42,159,255,0.08)', border:'1px solid rgba(42,159,255,0.2)',
          borderRadius:40, padding:'6px 16px', marginBottom:28,
          fontSize:12.5, fontWeight:600, color:'var(--accent)',
          letterSpacing:'0.04em',
        }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 8px #4ade80' }} />
          AIML Learning Platform · VIBETHON 2025
        </div>

        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 'clamp(40px, 6vw, 72px)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          marginBottom: 20,
          color: 'var(--text-primary)',
        }}>
          Master AI/ML by<br />
          <span style={{ color: 'var(--accent)', textShadow: '0 0 40px rgba(42,159,255,0.4)' }}>Building</span>, Not Reading
        </h1>

        <div style={{ fontSize: 'clamp(18px,2.5vw,24px)', color: 'var(--text-secondary)', marginBottom: 16, minHeight: 36 }}>
          Practice hands-on problems in{' '}
          <span style={{ color: 'var(--accent-bright)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
            {displayed}<span style={{ opacity: 0.7 }}>|</span>
          </span>
        </div>

        <p style={{ fontSize: 15, color: 'var(--text-dim)', marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
          An interactive platform where you write code, visualize concepts, and solve real ML problems — all in your browser.
        </p>

        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <button className="btn-primary" style={{ padding:'13px 32px', fontSize:15 }}
            onClick={() => navigate('/problems')}>
            Start Solving →
          </button>
          <button className="btn-ghost" style={{ padding:'13px 32px', fontSize:15 }}
            onClick={() => navigate('/problems')}>
            Explore Problems
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display:'flex', gap:0, justifyContent:'center', marginTop:60, flexWrap:'wrap' }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              padding:'16px 36px',
              borderRight: i < STATS.length - 1 ? '1px solid var(--border)' : 'none',
              textAlign:'center',
            }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:'var(--accent)' }}>{s.value}</div>
              <div style={{ fontSize:12, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── EXPLORE PROBLEM SPACE ─────────────────────────────────────────── */}
      <section style={{ position:'relative', zIndex:1, padding:'60px 24px', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', color:'var(--accent)', textTransform:'uppercase', marginBottom:6 }}>Problem Sets</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:'var(--text-primary)' }}>Explore Problem Space</h2>
          </div>
          <button className="btn-ghost" style={{ padding:'8px 20px', fontSize:13 }}
            onClick={() => navigate('/problems')}>View All →</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:12 }}>
          {PROBLEM_CARDS.map(card => (
            <div key={card.title}
              onClick={() => navigate('/problems')}
              style={{
                background:'var(--bg-card)', border:'1px solid var(--border)',
                borderRadius:14, padding:'18px 16px', cursor:'pointer',
                transition:'all 0.2s', position:'relative',
                opacity: card.soon ? 0.55 : 1,
              }}
              onMouseEnter={e => { if (!card.soon) { e.currentTarget.style.borderColor='var(--border-bright)'; e.currentTarget.style.transform='translateY(-3px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; }}
            >
              {card.soon && (
                <span style={{ position:'absolute', top:10, right:10, fontSize:9, fontWeight:700, background:'rgba(42,159,255,0.15)', color:'var(--accent)', padding:'2px 7px', borderRadius:4, letterSpacing:'0.06em' }}>SOON</span>
              )}
              <div style={{ width:40, height:40, borderRadius:10, background:card.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:12 }}>{card.icon}</div>
              <div style={{ fontSize:13.5, fontWeight:600, color:'var(--text-primary)', marginBottom:4 }}>{card.title}</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)' }}>{card.count} problems</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SAMPLE PROBLEMS TABLE ─────────────────────────────────────────── */}
      <section style={{ position:'relative', zIndex:1, padding:'20px 24px 60px', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:700, color:'var(--text-primary)' }}>Featured Problems</h2>
          <button className="btn-ghost" style={{ padding:'7px 18px', fontSize:13 }}
            onClick={() => navigate('/problems')}>View All Problems →</button>
        </div>
        <div className="prob-table">
          <div className="prob-table-header">
            <span>Status</span><span>Problem</span><span>Topic</span><span>Difficulty</span>
          </div>
          {SAMPLE_PROBLEMS.map(p => (
            <div key={p.id} className="prob-row" onClick={() => navigate(`/problems/${p.slug}`)}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ color:'var(--text-dim)', fontSize:13 }}>–</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span className="prob-id">{p.id}.</span>
                <span className="prob-title">{p.title}</span>
              </div>
              <div><span className="topic-tag">{p.topic}</span></div>
              <div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                  p.difficulty === 'Easy' ? 'tag-easy' : p.difficulty === 'Medium' ? 'tag-medium' : 'tag-hard'
                }`} style={{ padding:'2px 10px', borderRadius:5, fontSize:12, fontWeight:600 }}>
                  {p.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────────────── */}
      <section style={{ position:'relative', zIndex:1, padding:'60px 24px', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', color:'var(--accent)', textTransform:'uppercase', marginBottom:10 }}>Platform Features</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(24px,4vw,38px)', fontWeight:800, color:'var(--text-primary)', marginBottom:12 }}>
            Everything You Need to Master AIML
          </h2>
          <p style={{ fontSize:15, color:'var(--text-secondary)', maxWidth:520, margin:'0 auto' }}>
            From foundations to cutting-edge architectures — practice the concepts that actually appear in interviews.
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:18 }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className="feature-card"
              style={{ animationDelay:`${i * 0.07}s` }}>
              <div style={{
                width:44, height:44, borderRadius:12,
                background:`${f.color}18`, border:`1px solid ${f.color}30`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:20, marginBottom:16,
              }}>{f.icon}</div>
              <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>{f.title}</h3>
              <p style={{ fontSize:13.5, color:'var(--text-secondary)', lineHeight:1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section style={{ position:'relative', zIndex:1, padding:'60px 24px 80px' }}>
        <div style={{
          maxWidth:700, margin:'0 auto', textAlign:'center',
          background:'linear-gradient(135deg,rgba(10,22,40,0.9),rgba(8,18,40,0.9))',
          border:'1px solid var(--border-bright)',
          borderRadius:24, padding:'56px 40px',
          boxShadow:'0 0 80px rgba(42,159,255,0.08)',
          position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center top, rgba(42,159,255,0.07) 0%, transparent 60%)', pointerEvents:'none' }} />
          <div style={{ position:'relative' }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(26px,4vw,40px)', fontWeight:800, color:'var(--text-primary)', marginBottom:14 }}>
              Ready to <span style={{ color:'var(--accent)' }}>Level Up</span>?
            </h2>
            <p style={{ fontSize:15, color:'var(--text-secondary)', marginBottom:32, lineHeight:1.7 }}>
              Join thousands of engineers mastering AI/ML through hands-on problem solving.
              Start your first problem in seconds — no setup required.
            </p>
            <button className="btn-primary" style={{ padding:'14px 36px', fontSize:16 }}
              onClick={() => navigate('/problems')}>
              Start Solving Now →
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ position:'relative', zIndex:1, borderTop:'1px solid var(--border)', padding:'24px', textAlign:'center' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:'var(--accent)', fontSize:16, marginBottom:8 }}>NeuralForge</div>
        <p style={{ fontSize:12.5, color:'var(--text-dim)' }}>
          Built for VIBETHON 2025 · AIML Learning Platform
        </p>
      </footer>
    </div>
  )
}