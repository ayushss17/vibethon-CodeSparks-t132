import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { compilerAPI } from '../services/api'
import { PROBLEM_DATA } from '../data/problemsData'
import { VISUALIZATIONS } from './visualizations'

const API_BASE = 'http://localhost:8000'

// ─── Syntax highlighted static code display ───────────────────────────────────
function CodeDisplay({ code }) {
  const lines = code.split('\n')
  const highlight = (line) => {
    if (!line.trim()) return <span>&nbsp;</span>
    let result = line
    // Very minimal highlight for display
    result = result.replace(/(import|def|return|pass|for|if|else|while|class|from|as|in|not|and|or|True|False|None)/g,
      '<span class="kw">$1</span>')
    result = result.replace(/("""[\s\S]*?""")/g, '<span class="st">$1</span>')
    result = result.replace(/(#.*$)/g, '<span class="cm">$1</span>')
    result = result.replace(/\b(np|math)\b/g, '<span class="nb">$1</span>')
    result = result.replace(/\b([a-z_]+)(?=\()/g, '<span class="fn">$1</span>')
    return <span dangerouslySetInnerHTML={{ __html: result }} />
  }
  return (
    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, lineHeight: 1.7 }}>
      {lines.map((line, i) => (
        <div key={i} className="code-line">
          <span className="line-num">{i + 1}</span>
          <span className="line-content">{highlight(line)}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main ProblemDetail ────────────────────────────────────────────────────────
export default function ProblemDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const problem = PROBLEM_DATA[slug]
  const [leftTab, setLeftTab] = useState('description')
  const [bottomTab, setBottomTab] = useState('testcase')
  const [activeCaseTab, setActiveCaseTab] = useState(0)
  const [code, setCode] = useState('')
  const [runLabel, setRunLabel] = useState('▶ Run')
  const [submitLabel, setSubmitLabel] = useState('Submit')
  const [testResult, setTestResult] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [leftWidth, setLeftWidth] = useState(50)
  const [solved, setSolved] = useState(false)
  const canvasRef = useRef(null)
  const resizingRef = useRef(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (!problem) return
    setCode(problem.starterCode || '')
    
    // Fetch submissions if user is authenticated
    if (user) {
      compilerAPI.getSubmissions(slug)
        .then(res => setSubmissions(res.data.submissions || []))
        .catch(() => setSubmissions([]))
    }
  }, [slug, user])

  // Neural bg canvas
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); let animId
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    const nodes = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: Math.random() * 1.5 + 0.5,
    }))
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1
      })
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) { ctx.beginPath(); ctx.strokeStyle = `rgba(0,170,255,${0.05 * (1 - dist / 120)})`; ctx.lineWidth = 0.5; ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke() }
      }
      nodes.forEach(n => { ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,170,255,0.18)'; ctx.fill() })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId) }
  }, [])

  // Resize split
  const startResize = useCallback(e => {
    resizingRef.current = true
    const startX = e.clientX, startW = leftWidth
    const onMove = ev => {
      if (!resizingRef.current) return
      const totalW = document.body.clientWidth
      const delta = ((ev.clientX - startX) / totalW) * 100
      setLeftWidth(Math.max(25, Math.min(75, startW + delta)))
    }
    const onUp = () => { resizingRef.current = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp)
  }, [leftWidth])

  const runCode = async () => {
    if (!code.trim()) {
      alert('Please write some code first')
      return
    }
    if (!user) {
      alert('Please sign in to run code')
      return
    }
    
    setRunLabel('Running...')
    setBottomTab('testresult')
    setTestResult(null)
    
    try {
      const res = await compilerAPI.run(slug, code)
      setTestResult(res.data)
    } catch (err) {
      setTestResult({ 
        status: 'error', 
        message: err.response?.data?.detail || 'Cannot connect to backend'
      })
    }
    setRunLabel('▶ Run')
  }

  const submitCode = async () => {
    if (!code.trim()) {
      alert('Please write some code first')
      return
    }
    if (!user) {
      alert('Please sign in to submit code')
      return
    }
    
    setSubmitLabel('Submitting...')
    setBottomTab('testresult')
    
    try {
      const res = await compilerAPI.submit(slug, code)
      const data = res.data
      setTestResult(data)
      if (data.status === 'Accepted') setSolved(true)
      setSubmissions(prev => [data, ...prev])
      setLeftTab('submissions')
    } catch (err) {
      setTestResult({ 
        status: 'error', 
        message: err.response?.data?.detail || 'Cannot connect to backend'
      })
    }
    setSubmitLabel('Submit')
  }

  if (!problem) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 54px)', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <div style={{ fontSize: 20, fontFamily: "'Syne',sans-serif", fontWeight: 700, color: 'var(--text-primary)' }}>Problem detail coming soon</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>This problem page is under construction. Only first 6 problems are fully implemented.</p>
        <button className="btn-primary" onClick={() => navigate('/problems')} style={{ padding: '10px 24px', marginTop: 8 }}>← Back to Problems</button>
      </div>
    )
  }

  const VizComponent = VISUALIZATIONS[problem.vizKey]
  const diffColor = problem.difficulty === 'Easy' ? '#4ade80' : problem.difficulty === 'Medium' ? '#fbbf24' : '#f87171'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 54px)', overflow: 'hidden', position: 'relative' }}>
      {/* Injected CSS */}
      <style>{`
        .pd-left { overflow: hidden; display: flex; flex-direction: column; border-right: 1px solid rgba(0,170,255,0.15); background: rgba(10,16,30,0.85); }
        .pd-right { flex: 1; display: flex; flex-direction: column; background: rgba(6,10,18,0.9); overflow: hidden; min-width: 0; }
        .panel-tabs { display:flex; align-items:center; padding:0 16px; border-bottom:1px solid rgba(0,170,255,0.12); background:rgba(3,6,15,0.7); gap:2px; min-height:44px; }
        .pd-tab { padding:10px 14px; font-size:12.5px; font-weight:500; color:#64748b; cursor:pointer; border-bottom:2px solid transparent; transition:all 0.2s; white-space:nowrap; }
        .pd-tab:hover { color:#94a3b8; }
        .pd-tab.active { color:#00d4ff; border-bottom-color:#00d4ff; }
        .panel-content { flex:1; overflow-y:auto; padding:20px; scrollbar-width:thin; scrollbar-color:rgba(0,170,255,0.2) transparent; }
        .panel-content::-webkit-scrollbar { width:4px; }
        .panel-content::-webkit-scrollbar-thumb { background:rgba(0,170,255,0.2); border-radius:2px; }
        .tab-panel { display:none; flex-direction:column; gap:0; }
        .tab-panel.active { display:flex; }
        .diff-badge { padding:3px 10px; border-radius:5px; font-size:12px; font-weight:700; display:inline-block; margin-bottom:12px; }
        .topic-chip { padding:3px 10px; border-radius:40px; font-size:11px; font-weight:500; background:rgba(0,170,255,0.08); border:1px solid rgba(0,170,255,0.2); color:#67e8f9; }
        .prob-desc { font-size:14px; line-height:1.8; color:#94a3b8; }
        .prob-desc strong { color:#e2e8f0; }
        .prob-desc code { font-family:'JetBrains Mono',monospace; background:rgba(0,170,255,0.1); padding:2px 6px; border-radius:4px; color:#67e8f9; font-size:12px; }
        .section-heading { font-family:'Orbitron',monospace; font-size:10px; letter-spacing:0.1em; color:#00d4ff; text-transform:uppercase; margin:20px 0 10px; }
        .ex-block { background:rgba(0,20,50,0.6); border:1px solid rgba(0,170,255,0.15); border-radius:8px; padding:12px 14px; margin-bottom:8px; font-family:'JetBrains Mono',monospace; font-size:12.5px; }
        .ex-block .label { font-size:10px; color:#475569; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px; }
        .ex-block .val { color:#e2e8f0; }
        .ex-block .expl { color:#64748b; font-size:11px; margin-top:4px; font-family:'Inter',sans-serif; }
        .req-list { list-style:none; display:flex; flex-direction:column; gap:6px; }
        .req-list li { display:flex; align-items:flex-start; gap:8px; font-size:13px; color:#94a3b8; }
        .req-list li::before { content:'›'; color:#00d4ff; font-size:14px; line-height:1.4; flex-shrink:0; }
        .formula-card { background:rgba(0,40,100,0.3); border:1px solid rgba(0,170,255,0.25); border-radius:8px; padding:12px 16px; margin:10px 0; font-family:'JetBrains Mono',monospace; font-size:13.5px; color:#67e8f9; text-align:center; }
        .theory-h2 { font-size:14px; font-weight:700; color:#e2e8f0; margin:18px 0 8px; }
        .theory-h2:first-child { margin-top:4px; }
        .theory-body { font-size:13.5px; line-height:1.8; color:#94a3b8; }
        .theory-body code { font-family:'JetBrains Mono',monospace; background:rgba(0,170,255,0.1); padding:2px 6px; border-radius:4px; color:#67e8f9; font-size:12px; }
        .mono-table { width:100%; border-collapse:collapse; font-family:'JetBrains Mono',monospace; font-size:12.5px; margin:8px 0; }
        .mono-table th { padding:6px 12px; background:rgba(0,40,100,0.3); color:#00d4ff; font-weight:600; font-size:11px; text-transform:uppercase; letter-spacing:0.06em; text-align:left; border:1px solid rgba(0,170,255,0.12); }
        .mono-table td { padding:6px 12px; border:1px solid rgba(0,170,255,0.08); color:#94a3b8; }
        .mono-table td.val { color:#67e8f9; }
        .learn-first-card { background:rgba(0,20,50,0.7); border:1px solid rgba(0,170,255,0.2); border-radius:10px; padding:20px; text-align:center; }
        .learn-first-label { font-size:20px; margin-bottom:8px; }
        .learn-first-text { font-size:13px; color:#64748b; }
        .editor-toolbar { height:44px; display:flex; align-items:center; padding:0 14px; border-bottom:1px solid rgba(0,170,255,0.12); background:rgba(3,5,12,0.8); gap:8px; flex-shrink:0; }
        .toolbar-btn { width:30px; height:30px; border-radius:6px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#64748b; font-size:13px; transition:all 0.2s; border:1px solid transparent; }
        .toolbar-btn:hover { color:#00d4ff; background:rgba(0,170,255,0.1); border-color:rgba(0,170,255,0.2); }
        .lang-sel { padding:5px 10px; background:rgba(0,170,255,0.07); border:1px solid rgba(0,170,255,0.15); border-radius:6px; font-size:12px; color:#64748b; cursor:pointer; }
        .lang-sel:hover { border-color:rgba(0,170,255,0.4); color:#00d4ff; }
        .btn-run { padding:6px 16px; background:transparent; border:1px solid rgba(0,170,255,0.4); border-radius:6px; font-size:12px; font-weight:600; color:#00d4ff; cursor:pointer; transition:all 0.25s; letter-spacing:0.04em; }
        .btn-run:hover { background:rgba(0,170,255,0.12); box-shadow:0 0 16px rgba(0,170,255,0.2); }
        .btn-submit { padding:6px 16px; background:linear-gradient(135deg,#0052cc,#0077ff); border:1px solid rgba(0,120,255,0.5); border-radius:6px; font-size:12px; font-weight:600; color:white; cursor:pointer; transition:all 0.25s; letter-spacing:0.04em; box-shadow:0 2px 12px rgba(0,100,255,0.25); }
        .btn-submit:hover { background:linear-gradient(135deg,#0066ff,#00aaff); box-shadow:0 4px 24px rgba(0,170,255,0.35); transform:translateY(-1px); }
        .code-area { flex:1; background:#04060c; font-family:'JetBrains Mono',monospace; font-size:13.5px; line-height:1.7; overflow-y:auto; padding:14px 0; scrollbar-width:thin; scrollbar-color:rgba(0,170,255,0.2) transparent; position:relative; }
        .code-area::-webkit-scrollbar { width:4px; }
        .code-area::-webkit-scrollbar-thumb { background:rgba(0,170,255,0.2); border-radius:2px; }
        .code-textarea { position:absolute; inset:0; width:100%; height:100%; background:transparent; border:none; outline:none; resize:none; font-family:'JetBrains Mono',monospace; font-size:13.5px; line-height:1.7; color:#e2e8f0; padding:14px 14px 14px 58px; caret-color:#00d4ff; z-index:2; }
        .code-line { display:flex; align-items:flex-start; padding:0 18px 0 0; min-height:23px; pointer-events:none; }
        .code-line:hover { background:rgba(0,170,255,0.03); }
        .line-num { width:44px; min-width:44px; text-align:right; padding-right:18px; color:rgba(70,100,140,0.6); user-select:none; font-size:12px; line-height:1.7; flex-shrink:0; }
        .line-content { color:#7f8ea0; }
        .kw { color:#60a5fa; } .fn { color:#34d399; } .st { color:#fb923c; } .cm { color:#4b5e74; } .nb { color:#f59e0b; } .nm { color:#c084fc; } .id { color:#e2e8f0; }
        .cursor-blink { display:inline-block; width:2px; height:16px; background:#00d4ff; animation:blink 1.1s step-end infinite; vertical-align:middle; margin-left:1px; box-shadow:0 0 8px #00d4ff; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .bottom-panel { height:220px; min-height:220px; border-top:1px solid rgba(0,170,255,0.12); background:rgba(3,5,12,0.85); display:flex; flex-direction:column; flex-shrink:0; }
        .bottom-tabs { display:flex; align-items:center; padding:0 14px; border-bottom:1px solid rgba(0,170,255,0.1); gap:2px; min-height:38px; }
        .bottom-tab { padding:7px 13px; font-size:12px; font-weight:500; color:#475569; cursor:pointer; border-bottom:2px solid transparent; transition:all 0.2s; display:flex; align-items:center; gap:5px; }
        .bottom-tab:hover { color:#94a3b8; }
        .bottom-tab.active { color:#00d4ff; border-bottom-color:#00d4ff; }
        .bottom-content { flex:1; overflow-y:auto; padding:12px 14px; scrollbar-width:thin; }
        .case-tabs-row { display:flex; align-items:center; gap:6px; margin-bottom:12px; }
        .case-tab { padding:4px 10px; background:rgba(0,40,80,0.4); border:1px solid rgba(0,170,255,0.15); border-radius:5px; font-size:11.5px; font-family:'JetBrains Mono',monospace; color:#64748b; cursor:pointer; display:flex; align-items:center; gap:5px; transition:all 0.2s; }
        .case-tab.active { background:rgba(0,100,200,0.15); border-color:#00d4ff; color:#00d4ff; }
        .case-tab:hover { border-color:rgba(0,170,255,0.4); color:#94a3b8; }
        .input-row { display:flex; align-items:baseline; gap:8px; margin-bottom:6px; font-family:'JetBrains Mono',monospace; font-size:13px; }
        .input-label { color:#00d4ff; min-width:30px; }
        .input-value { color:#e2e8f0; }
        .result-pass { background:rgba(74,222,128,0.08); border:1px solid rgba(74,222,128,0.25); border-radius:8px; padding:12px 14px; }
        .result-fail { background:rgba(248,113,113,0.08); border:1px solid rgba(248,113,113,0.25); border-radius:8px; padding:12px 14px; }
        .result-err { background:rgba(251,191,36,0.08); border:1px solid rgba(251,191,36,0.25); border-radius:8px; padding:12px 14px; }
        .status-bar { height:24px; min-height:24px; border-top:1px solid rgba(0,170,255,0.08); background:rgba(2,4,10,0.9); display:flex; align-items:center; padding:0 14px; gap:16px; font-size:10.5px; color:#2d4460; font-family:'JetBrains Mono',monospace; flex-shrink:0; }
        .status-dot { display:inline-block; width:6px; height:6px; border-radius:50%; background:#4ade80; box-shadow:0 0 6px #4ade80; margin-right:5px; }
        .status-dot.blue { background:#00d4ff; box-shadow:0 0 6px #00d4ff; }
        .resize-handle { width:5px; background:transparent; cursor:col-resize; transition:background 0.2s; flex-shrink:0; }
        .resize-handle:hover { background:rgba(0,170,255,0.2); }
        .sub-row { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:7px; margin-bottom:4px; background:rgba(0,20,50,0.4); border:1px solid rgba(0,170,255,0.08); font-size:12px; }
        .accepts-label { font-size:11px; color:#2d4460; font-family:'JetBrains Mono',monospace; }
        .prob-breadcrumb { display:flex; align-items:center; gap:6px; font-size:12px; color:#475569; cursor:pointer; }
        .prob-breadcrumb:hover { color:#94a3b8; }
        .nav-prob-btn { padding:5px 10px; background:transparent; border:1px solid rgba(0,170,255,0.15); border-radius:6px; font-size:12px; color:#475569; cursor:pointer; transition:all 0.2s; }
        .nav-prob-btn:hover { border-color:rgba(0,170,255,0.4); color:#00d4ff; }
        .accepted-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; background:rgba(74,222,128,0.1); border:1px solid rgba(74,222,128,0.3); border-radius:5px; font-size:11px; color:#4ade80; font-weight:600; }
      `}</style>

      {/* Neural bg */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

      {/* Sub-navbar */}
      <div style={{ height: 42, minHeight: 42, display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid rgba(0,170,255,0.12)', background: 'rgba(3,6,15,0.92)', gap: 12, zIndex: 1, position: 'relative' }}>
        <div className="prob-breadcrumb" onClick={() => navigate('/problems')}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" /></svg>
          Problems
        </div>
        <span style={{ color: '#1e3050' }}>›</span>
        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{problem.title}</span>
        <div style={{ marginLeft: 8 }}>
          <span style={{ color: diffColor, background: `${diffColor}15`, border: `1px solid ${diffColor}30`, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{problem.difficulty}</span>
        </div>
        {solved && <span className="accepted-badge">✓ Solved</span>}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {['←', '→'].map((ch, i) => {
            const idx = Object.keys(PROBLEM_DATA).indexOf(slug)
            const slugs = Object.keys(PROBLEM_DATA)
            const target = i === 0 ? slugs[idx - 1] : slugs[idx + 1]
            return <button key={ch} className="nav-prob-btn" disabled={!target} onClick={() => target && navigate(`/problems/${target}`)} style={{ opacity: target ? 1 : 0.3 }}>{ch}</button>
          })}
        </div>
      </div>

      {/* Main split */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        {/* LEFT PANEL */}
        <div className="pd-left" style={{ width: `${leftWidth}%` }}>
          {/* Tabs */}
          <div className="panel-tabs">
            {[
              { id: 'description', label: '📋 Description' },
              { id: 'theory', label: '📐 Theory' },
              { id: 'visualization', label: '📊 Visualize' },
              { id: 'solution', label: '🔒 Solution' },
              { id: 'submissions', label: '📁 Submissions' },
            ].map(t => (
              <div key={t.id} className={`pd-tab${leftTab === t.id ? ' active' : ''}`} onClick={() => setLeftTab(t.id)}>{t.label}</div>
            ))}
          </div>

          {/* DESCRIPTION */}
          <div className={`panel-content tab-panel${leftTab === 'description' ? ' active' : ''}`}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {problem.topics?.map(t => <span key={t} className="topic-chip">{t}</span>)}
            </div>
            <div className="prob-desc" dangerouslySetInnerHTML={{
              __html: problem.description
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br/>')
            }} />

            {problem.examples && (
              <>
                <div className="section-heading">Examples</div>
                {problem.examples.map((ex, i) => (
                  <div key={i} className="ex-block">
                    <div className="label">Input</div>
                    <div className="val">{ex.input}</div>
                    <div className="label" style={{ marginTop: 8 }}>Output</div>
                    <div className="val" style={{ color: '#4ade80' }}>{ex.output}</div>
                    {ex.explanation && <div className="expl">// {ex.explanation}</div>}
                  </div>
                ))}
              </>
            )}

            {problem.requirements && (
              <>
                <div className="section-heading">Requirements</div>
                <ul className="req-list">
                  {problem.requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </>
            )}

            {problem.constraints && (
              <>
                <div className="section-heading">Constraints</div>
                <ul className="req-list">
                  {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </>
            )}
          </div>

          {/* THEORY */}
          <div className={`panel-content tab-panel${leftTab === 'theory' ? ' active' : ''}`}>
            {problem.theory?.sections?.map((sec, i) => (
              <div key={i} style={{ marginBottom: 4 }}>
                <div className="theory-h2">{sec.title}</div>
                {sec.body && <p className="theory-body">{sec.body}</p>}
                {sec.formula && <div className="formula-card">{sec.formula}</div>}
                {sec.table && (
                  <table className="mono-table">
                    <tbody>
                      <tr><th>x</th><th>σ(x)</th></tr>
                      {sec.table.map(([x, v]) => <tr key={x}><td>{x}</td><td className="val">{v}</td></tr>)}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>

          {/* VISUALIZATION */}
          <div className={`panel-content tab-panel${leftTab === 'visualization' ? ' active' : ''}`}>
            {VizComponent ? <VizComponent /> : (
              <div className="learn-first-card" style={{ marginTop: 20 }}>
                <div className="learn-first-label">📊</div>
                <div className="learn-first-text">Visualization coming soon for this problem.</div>
              </div>
            )}
          </div>

          {/* SOLUTION */}
          <div className={`panel-content tab-panel${leftTab === 'solution' ? ' active' : ''}`}>
            {solved ? (
              <div style={{ marginTop: 16 }}>
                <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                  <div style={{ color: '#4ade80', fontWeight: 700, marginBottom: 4, fontSize: 13 }}>✓ Unlocked — You solved this!</div>
                  <div style={{ color: '#64748b', fontSize: 12 }}>Reference solution available below.</div>
                </div>
                <div className="section-heading">Reference Solution</div>
                <div className="ex-block" style={{ fontSize: 12.5 }}>
                  <div className="label">Hint</div>
                  <div className="val">For {problem.slug === 'sigmoid-numpy' ? 'sigmoid' : problem.title}: use NumPy vectorized operations.</div>
                </div>
              </div>
            ) : (
              <div className="learn-first-card" style={{ marginTop: 20 }}>
                <div className="learn-first-label">🔒 Locked</div>
                <div className="learn-first-text">Solve the problem first to unlock the reference solution.</div>
              </div>
            )}
          </div>

          {/* SUBMISSIONS */}
          <div className={`panel-content tab-panel${leftTab === 'submissions' ? ' active' : ''}`}>
            {submissions.length === 0 ? (
              <p style={{ marginTop: 20, textAlign: 'center', color: '#2d4460', fontSize: 13, fontFamily: "'JetBrains Mono',monospace" }}>No submissions yet. Write your solution and hit Submit.</p>
            ) : submissions.map((sub, i) => (
              <div key={i} className="sub-row">
                <span style={{ fontWeight: 700, color: sub.status === 'Accepted' ? '#4ade80' : '#f87171', fontSize: 12.5 }}>{sub.status}</span>
                <span style={{ color: '#475569', flex: 1 }}>{sub.timestamp || 'just now'}</span>
                <span style={{ color: '#64748b', fontFamily: "'JetBrains Mono',monospace" }}>{sub.runtime}</span>
                <span style={{ color: '#1e3050', fontSize: 11 }}>{sub.passed}/{sub.total} cases</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resize handle */}
        <div className="resize-handle" onMouseDown={startResize} />

        {/* RIGHT PANEL — editor */}
        <div className="pd-right">
          {/* Editor toolbar */}
          <div className="editor-toolbar">
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { title: 'Reset', icon: '↺', action: () => setCode(problem.starterCode || '') },
                { title: 'Copy', icon: '⧉', action: () => navigator.clipboard.writeText(code) },
              ].map(b => (
                <div key={b.title} className="toolbar-btn" title={b.title} onClick={b.action}>{b.icon}</div>
              ))}
            </div>
            <div style={{ width: 1, height: 20, background: 'rgba(0,170,255,0.12)', margin: '0 6px' }} />
            <div className="lang-sel">🐍 Python 3 ▾</div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="btn-run" onClick={runCode}>{runLabel}</div>
              <div className="btn-submit" onClick={submitCode}>{submitLabel}</div>
            </div>
          </div>

          {/* Code editor */}
          <div className="code-area" style={{ flex: 1 }}>
            {/* Line numbers overlay */}
            <div style={{ position: 'absolute', left: 0, top: 0, paddingTop: 14, width: 44, userSelect: 'none', zIndex: 1 }}>
              {code.split('\n').map((_, i) => (
                <div key={i} style={{ height: '1.7em', lineHeight: '1.7', textAlign: 'right', paddingRight: 12, color: 'rgba(70,100,140,0.55)', fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>{i + 1}</div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              className="code-textarea"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Tab') {
                  e.preventDefault()
                  const s = e.target.selectionStart, end = e.target.selectionEnd
                  const newCode = code.substring(0, s) + '    ' + code.substring(end)
                  setCode(newCode)
                  requestAnimationFrame(() => { e.target.selectionStart = e.target.selectionEnd = s + 4 })
                }
              }}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
            />
          </div>

          {/* Bottom test panel */}
          <div className="bottom-panel">
            <div className="bottom-tabs">
              {[
                { id: 'testcase', label: '✓ Testcase' },
                { id: 'testresult', label: '≻_ Test Result' },
              ].map(t => (
                <div key={t.id} className={`bottom-tab${bottomTab === t.id ? ' active' : ''}`} onClick={() => setBottomTab(t.id)}>{t.label}</div>
              ))}
            </div>

            {/* Test case panel */}
            <div className={`bottom-content tab-panel${bottomTab === 'testcase' ? ' active' : ''}`}>
              <div className="case-tabs-row">
                {problem.testCases?.map((tc, i) => (
                  <div key={i} className={`case-tab${activeCaseTab === i ? ' active' : ''}`} onClick={() => setActiveCaseTab(i)}>
                    {tc.label} <span style={{ opacity: 0.5, fontSize: 10, marginLeft: 2 }}>×</span>
                  </div>
                ))}
              </div>
              {problem.testCases?.[activeCaseTab] && (
                <>
                  <div className="input-row">
                    <span className="input-label">Input =</span>
                    <span className="input-value">{problem.testCases[activeCaseTab].input}</span>
                  </div>
                  <div className="input-row">
                    <span className="input-label" style={{ color: '#4ade80' }}>Expected =</span>
                    <span className="input-value" style={{ color: '#4ade80' }}>{problem.testCases[activeCaseTab].expected}</span>
                  </div>
                  <div className="accepts-label">Accepts: numerical array or scalar</div>
                </>
              )}
            </div>

            {/* Test result panel */}
            <div className={`bottom-content tab-panel${bottomTab === 'testresult' ? ' active' : ''}`}>
              {!testResult ? (
                <p style={{ color: '#2d4460', fontSize: 12, fontFamily: "'JetBrains Mono',monospace", marginTop: 20, textAlign: 'center' }}>Run your code first to see output here.</p>
              ) : testResult.status === 'error' ? (
                <div className="result-err">
                  <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: 12.5, marginBottom: 6 }}>⚠ Error</div>
                  <pre style={{ color: '#f87171', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, whiteSpace: 'pre-wrap' }}>{testResult.message}</pre>
                </div>
              ) : testResult.status === 'passed' || testResult.status === 'Accepted' ? (
                <div className="result-pass">
                  <div style={{ color: '#4ade80', fontWeight: 700, fontSize: 12.5, marginBottom: 8 }}>
                    {testResult.status === 'Accepted' ? `✓ Accepted — ${testResult.passed}/${testResult.total} test cases passed` : '✓ Test Passed'}
                  </div>
                  {testResult.output && (
                    <div className="input-row"><span className="input-label" style={{ color: '#4ade80' }}>Output =</span><span className="input-value">{testResult.output}</span></div>
                  )}
                  {testResult.runtime && (
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>Runtime: {testResult.runtime} · Memory: {testResult.memory}</div>
                  )}
                </div>
              ) : testResult.status === 'wrong' ? (
                <div className="result-fail">
                  <div style={{ color: '#f87171', fontWeight: 700, fontSize: 12.5, marginBottom: 8 }}>✗ Wrong Answer</div>
                  <div className="input-row"><span className="input-label" style={{ color: '#f87171' }}>Got =</span><span className="input-value" style={{ color: '#f87171' }}>{testResult.output}</span></div>
                  <div className="input-row"><span className="input-label" style={{ color: '#4ade80' }}>Expected =</span><span className="input-value" style={{ color: '#4ade80' }}>{testResult.expected}</span></div>
                </div>
              ) : (
                <div className="result-fail">
                  <div style={{ color: '#f87171', fontWeight: 700, fontSize: 12.5, marginBottom: 6 }}>✗ Wrong Answer — {testResult.passed}/{testResult.total} passed</div>
                </div>
              )}
            </div>
          </div>

          {/* Status bar */}
          <div className="status-bar">
            <span><span className="status-dot" />Python 3.11</span>
            <span><span className="status-dot blue" />NeuralForge v2.4</span>
            <span style={{ marginLeft: 'auto' }}>UTF-8 · {slug}</span>
          </div>
        </div>
      </div>
    </div>
  )
}