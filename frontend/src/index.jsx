// visualizations/index.jsx — all 6 interactive visualizers
import { useEffect, useRef, useState } from 'react'

// ─── SIGMOID ──────────────────────────────────────────────────────────────────
export function SigmoidViz() {
  const canvasRef = useRef(null)
  const [x, setX] = useState(0)
  const sigmoid = v => 1 / (1 + Math.exp(-v))
  const grad = v => { const s = sigmoid(v); return s * (1 - s) }

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    const tX = v => ((v + 6) / 12) * W
    const tY = v => H - v * H
    ctx.strokeStyle = '#1a2638'; ctx.lineWidth = 0.5
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath(); ctx.moveTo(i * W / 10, 0); ctx.lineTo(i * W / 10, H); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, i * H / 10); ctx.lineTo(W, i * H / 10); ctx.stroke()
    }
    ctx.strokeStyle = '#2a3f5a'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(tX(0), 0); ctx.lineTo(tX(0), H); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, H)
    for (let px = 0; px < W; px++) ctx.lineTo(px, H - sigmoid((px / W) * 12 - 6) * H)
    ctx.lineTo(W, H); ctx.closePath()
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, 'rgba(236,72,153,0.25)'); g.addColorStop(1, 'rgba(236,72,153,0.02)')
    ctx.fillStyle = g; ctx.fill()
    ctx.beginPath(); ctx.strokeStyle = '#ec4899'; ctx.lineWidth = 2.5
    for (let px = 0; px < W; px++) {
      const v = sigmoid((px / W) * 12 - 6)
      px === 0 ? ctx.moveTo(px, H - v * H) : ctx.lineTo(px, H - v * H)
    }
    ctx.stroke()
    const cx = tX(x), cy = tY(sigmoid(x))
    ctx.setLineDash([4, 4]); ctx.strokeStyle = '#475569'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, H / 2); ctx.stroke()
    ctx.setLineDash([])
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#ec4899'; ctx.lineWidth = 2; ctx.stroke()
    ctx.fillStyle = '#475569'; ctx.font = '10px monospace'
    ctx.fillText('-6', tX(-6) + 2, H / 2 - 4); ctx.fillText('0', tX(0) + 4, H / 2 - 4)
    ctx.fillText('+6', tX(6) - 16, H / 2 - 4); ctx.fillText('1', tX(0) + 4, 12)
  }, [x])

  return (
    <div style={{ background: 'rgba(5,12,25,0.9)', border: '1px solid rgba(0,170,255,0.35)', borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 11, fontFamily: "'Orbitron',monospace", letterSpacing: '0.1em', color: '#00d4ff', textTransform: 'uppercase', marginBottom: 12 }}>Sigmoid Activation</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>x =</span>
        <input type="range" min="-6" max="6" step="0.1" value={x}
          onChange={e => setX(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: '#ec4899' }} />
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: '#e2e8f0', width: 40, textAlign: 'right' }}>{x.toFixed(1)}</span>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <canvas ref={canvasRef} width={340} height={160} style={{ borderRadius: 8, background: '#040810', flex: 1 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 130 }}>
          {[
            { label: 'Input (Logit)', val: x.toFixed(3), color: '#94a3b8', border: 'rgba(0,170,255,0.2)' },
            { label: 'σ(x)', val: sigmoid(x).toFixed(4), color: '#ec4899', border: 'rgba(236,72,153,0.3)' },
            { label: "σ'(x) Gradient", val: grad(x).toFixed(4), color: '#4ade80', border: 'rgba(74,222,128,0.3)' },
          ].map(m => (
            <div key={m.label} style={{ background: 'rgba(0,20,50,0.7)', border: `1px solid ${m.border}`, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', marginBottom: 2 }}>{m.label}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 600, color: m.color }}>{m.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── LOGISTIC REGRESSION ──────────────────────────────────────────────────────
export function LogisticViz() {
  const canvasRef = useRef(null), lossRef = useRef(null)
  const [epoch, setEpoch] = useState(0), [running, setRunning] = useState(false)
  const maxEpochs = 50, timerRef = useRef(null)
  const data = [
    { x1: -2, x2: -1, y: 0 }, { x1: -1.5, x2: -0.5, y: 0 }, { x1: -1, x2: -1.5, y: 0 },
    { x1: -0.5, x2: -0.5, y: 0 }, { x1: -2, x2: 0.5, y: 0 },
    { x1: 1, x2: 1, y: 1 }, { x1: 1.5, x2: 0.5, y: 1 }, { x1: 0.5, x2: 1.5, y: 1 },
    { x1: 2, x2: 1, y: 1 }, { x1: 1, x2: 2, y: 1 },
  ]
  const sig = z => 1 / (1 + Math.exp(-z))
  const getW = ep => { const t = ep / maxEpochs; return { w1: -0.437 + t * 1.8, w2: 0.552 + t * 1.2, b: t * 0.1 } }
  const getLoss = ep => ep === 0 ? 0.7208 : 0.7208 * Math.exp(-ep * 0.08) + 0.05

  useEffect(() => {
    if (running) { timerRef.current = setInterval(() => setEpoch(e => { if (e >= maxEpochs) { setRunning(false); return e } return e + 1 }), 100) }
    return () => clearInterval(timerRef.current)
  }, [running])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    const tX = v => ((v + 3) / 6) * W, tY = v => H - ((v + 2) / 5) * H
    ctx.strokeStyle = '#1a2638'; ctx.lineWidth = 0.5
    for (let i = 0; i <= 6; i++) {
      ctx.beginPath(); ctx.moveTo(i * W / 6, 0); ctx.lineTo(i * W / 6, H); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, i * H / 6); ctx.lineTo(W, i * H / 6); ctx.stroke()
    }
    const { w1, w2, b } = getW(epoch)
    if (Math.abs(w2) > 0.01) {
      ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(0,212,255,0.6)'; ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(tX(-3), tY(-(w1 * -3 + b) / w2)); ctx.lineTo(tX(3), tY(-(w1 * 3 + b) / w2))
      ctx.stroke(); ctx.setLineDash([])
    }
    data.forEach(pt => {
      ctx.beginPath(); ctx.arc(tX(pt.x1), tY(pt.x2), 5, 0, Math.PI * 2)
      ctx.fillStyle = pt.y === 0 ? '#f87171' : '#4ade80'; ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1; ctx.stroke()
    })
  }, [epoch])

  useEffect(() => {
    const c = lossRef.current; if (!c) return
    const ctx = c.getContext('2d'), W = c.width, H = c.height
    ctx.clearRect(0, 0, W, H)
    ctx.strokeStyle = '#1a2638'; ctx.lineWidth = 0.5
    for (let i = 0; i <= 5; i++) {
      ctx.beginPath(); ctx.moveTo(i * W / 5, 0); ctx.lineTo(i * W / 5, H); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, i * H / 5); ctx.lineTo(W, i * H / 5); ctx.stroke()
    }
    ctx.beginPath(); ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2
    for (let e = 0; e <= epoch; e++) {
      const px = (e / maxEpochs) * W, py = H - (getLoss(e) / 0.8) * H
      e === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
    }
    ctx.stroke()
  }, [epoch])

  const { w1, w2, b } = getW(epoch)
  return (
    <div style={{ background: 'rgba(5,12,25,0.9)', border: '1px solid rgba(0,170,255,0.35)', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontFamily: "'Orbitron',monospace", letterSpacing: '0.1em', color: '#00d4ff', textTransform: 'uppercase' }}>Logistic Regression Training</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => { setEpoch(0); setRunning(false) }} style={{ padding: '4px 10px', background: 'rgba(0,170,255,0.08)', border: '1px solid rgba(0,170,255,0.25)', borderRadius: 5, color: '#94a3b8', fontSize: 11, cursor: 'pointer' }}>Reset</button>
          <button onClick={() => setRunning(r => !r)} style={{ padding: '4px 12px', background: running ? 'rgba(248,113,113,0.15)' : 'rgba(74,222,128,0.15)', border: `1px solid ${running ? 'rgba(248,113,113,0.4)' : 'rgba(74,222,128,0.4)'}`, borderRadius: 5, color: running ? '#f87171' : '#4ade80', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
            {running ? '⏸ Pause' : '▶ Train'}
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>Decision Boundary</div>
          <canvas ref={canvasRef} width={220} height={160} style={{ borderRadius: 8, background: '#040810', width: '100%' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>Loss Curve</div>
          <canvas ref={lossRef} width={180} height={160} style={{ borderRadius: 8, background: '#040810', width: '100%' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {[
          { l: 'Epoch', v: `${epoch}/${maxEpochs}`, c: '#94a3b8' },
          { l: 'Loss', v: getLoss(epoch).toFixed(4), c: '#f59e0b' },
          { l: 'w1', v: w1.toFixed(3), c: '#c084fc' },
          { l: 'w2', v: w2.toFixed(3), c: '#67e8f9' },
        ].map(m => (
          <div key={m.l} style={{ flex: 1, background: 'rgba(0,20,50,0.7)', border: '1px solid rgba(0,170,255,0.15)', borderRadius: 7, padding: '6px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' }}>{m.l}</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: m.c }}>{m.v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MATRIX TRANSPOSE ─────────────────────────────────────────────────────────
export function MatrixViz() {
  const [mat, setMat] = useState([[1, 2, 3], [4, 5, 6]])
  const [flipped, setFlipped] = useState(false)
  const rows = mat.length, cols = mat[0].length
  const transposed = mat[0].map((_, c) => mat.map(r => r[c]))
  const display = flipped ? transposed : mat
  const CellStyle = (r, c, isT) => ({
    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: `rgba(${isT ? '0,170,255' : '168,85,247'},0.12)`, border: `1px solid rgba(${isT ? '0,170,255' : '168,85,247'},0.35)`,
    borderRadius: 6, fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 600,
    color: isT ? '#67e8f9' : '#c084fc', transition: 'all 0.3s',
  })
  return (
    <div style={{ background: 'rgba(5,12,25,0.9)', border: '1px solid rgba(0,170,255,0.35)', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontFamily: "'Orbitron',monospace", letterSpacing: '0.1em', color: '#00d4ff', textTransform: 'uppercase' }}>Matrix Transpose</div>
        <button onClick={() => setFlipped(f => !f)} style={{ padding: '4px 12px', background: 'rgba(0,170,255,0.1)', border: '1px solid rgba(0,170,255,0.35)', borderRadius: 5, color: '#00d4ff', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
          {flipped ? '← Original' : 'Transpose →'}
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: '#475569', marginBottom: 6, textAlign: 'center' }}>A ({rows}×{cols})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {mat.map((row, r) => (
              <div key={r} style={{ display: 'flex', gap: 4 }}>
                {row.map((v, c) => <div key={c} style={CellStyle(r, c, false)}>{v}</div>)}
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 20, color: '#475569' }}>→</div>
        <div>
          <div style={{ fontSize: 10, color: '#475569', marginBottom: 6, textAlign: 'center' }}>Aᵀ ({cols}×{rows})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {transposed.map((row, r) => (
              <div key={r} style={{ display: 'flex', gap: 4 }}>
                {row.map((v, c) => <div key={c} style={CellStyle(r, c, true)}>{v}</div>)}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: 11, color: '#475569', textAlign: 'center' }}>
        A[i][j] = {flipped ? 'shown as Aᵀ[j][i]' : 'A[i][j]'} · shape: ({flipped ? `${cols}×${rows}` : `${rows}×${cols}`})
      </div>
    </div>
  )
}

// ─── POSITIONAL ENCODING ──────────────────────────────────────────────────────
export function PositionalViz() {
  const canvasRef = useRef(null)
  const [seqLen, setSeqLen] = useState(16)
  const [dModel, setDModel] = useState(16)

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    const cW = W / dModel, cH = H / seqLen
    for (let pos = 0; pos < seqLen; pos++) {
      for (let i = 0; i < dModel; i++) {
        const freq = 1 / Math.pow(10000, (2 * Math.floor(i / 2)) / dModel)
        const v = i % 2 === 0 ? Math.sin(pos * freq) : Math.cos(pos * freq)
        const norm = (v + 1) / 2
        const r = Math.round(norm * 0 + (1 - norm) * 0)
        const g = Math.round(norm * 40 + (1 - norm) * 120)
        const b = Math.round(norm * 120 + (1 - norm) * 255)
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fillRect(i * cW, pos * cH, cW, cH)
      }
    }
  }, [seqLen, dModel])

  return (
    <div style={{ background: 'rgba(5,12,25,0.9)', border: '1px solid rgba(0,170,255,0.35)', borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 11, fontFamily: "'Orbitron',monospace", letterSpacing: '0.1em', color: '#00d4ff', textTransform: 'uppercase', marginBottom: 10 }}>Positional Encoding Heatmap</div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
        {[
          { label: 'Seq Length', val: seqLen, set: setSeqLen, min: 4, max: 32, step: 2 },
          { label: 'd_model', val: dModel, set: setDModel, min: 4, max: 32, step: 4 },
        ].map(s => (
          <div key={s.label} style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>{s.label}: <span style={{ color: '#67e8f9', fontFamily: "'JetBrains Mono',monospace" }}>{s.val}</span></div>
            <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
              onChange={e => s.set(+e.target.value)} style={{ width: '100%', accentColor: '#22d3ee' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: '#475569', marginBottom: 4 }}>← Embedding dimension ({dModel}) →</div>
          <canvas ref={canvasRef} width={320} height={200} style={{ borderRadius: 6, width: '100%' }} />
          <div style={{ fontSize: 9, color: '#475569', marginTop: 4 }}>↕ Position (0 → {seqLen - 1})</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
          {[
            { label: 'Low dim', sub: 'High freq · fast change', color: '#22d3ee' },
            { label: 'High dim', sub: 'Low freq · slow change', color: '#c084fc' },
          ].map(l => (
            <div key={l.label} style={{ background: 'rgba(0,20,50,0.7)', border: '1px solid rgba(0,170,255,0.15)', borderRadius: 7, padding: '7px 10px' }}>
              <div style={{ color: l.color, fontWeight: 600, fontSize: 11 }}>{l.label}</div>
              <div style={{ color: '#475569', fontSize: 10 }}>{l.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── GRADIENT DESCENT ─────────────────────────────────────────────────────────
export function GradientViz() {
  const canvasRef = useRef(null)
  const [a, setA] = useState(1), [b, setB] = useState(-4), [x0] = useState(0)
  const [lr, setLr] = useState(0.1), [step, setStep] = useState(0), [history, setHistory] = useState([0])
  const f = x => a * x * x + b * x
  const df = x => 2 * a * x + b
  const xMin = Math.abs(a) > 0.01 ? -b / (2 * a) : 0

  useEffect(() => {
    let x = x0; const hist = [x]
    for (let i = 0; i < 30; i++) { x = x - lr * df(x); hist.push(x) }
    setHistory(hist); setStep(0)
  }, [a, b, lr])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    const xRange = 8, fMin = f(xMin)
    const fMax = Math.max(f(-xRange / 2), f(xRange / 2))
    const yRange = Math.max(fMax - fMin, 1) * 1.2
    const tX = x => ((x + xRange / 2) / xRange) * W
    const tY = y => H - 10 - ((y - fMin + yRange * 0.1) / (yRange * 1.2)) * (H - 20)
    ctx.strokeStyle = '#1a2638'; ctx.lineWidth = 0.5
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath(); ctx.moveTo(i * W / 8, 0); ctx.lineTo(i * W / 8, H); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, i * H / 8); ctx.lineTo(W, i * H / 8); ctx.stroke()
    }
    ctx.beginPath(); ctx.moveTo(0, H)
    for (let px = 0; px < W; px++) ctx.lineTo(px, tY(f((px / W) * xRange - xRange / 2)))
    ctx.lineTo(W, H); ctx.closePath()
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, 'rgba(59,130,246,0.25)'); g.addColorStop(1, 'rgba(59,130,246,0.02)')
    ctx.fillStyle = g; ctx.fill()
    ctx.beginPath(); ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2.5
    for (let px = 0; px < W; px++) {
      const v = f((px / W) * xRange - xRange / 2)
      px === 0 ? ctx.moveTo(px, tY(v)) : ctx.lineTo(px, tY(v))
    }
    ctx.stroke()
    if (step > 0) {
      ctx.strokeStyle = 'rgba(251,191,36,0.5)'; ctx.lineWidth = 1; ctx.beginPath()
      history.slice(0, step + 1).forEach((x, i) => { i === 0 ? ctx.moveTo(tX(x), tY(f(x))) : ctx.lineTo(tX(x), tY(f(x))) })
      ctx.stroke()
    }
    ctx.beginPath(); ctx.arc(tX(xMin), tY(f(xMin)), 4, 0, Math.PI * 2)
    ctx.fillStyle = '#10b981'; ctx.fill()
    const cx = history[Math.min(step, history.length - 1)]
    ctx.beginPath(); ctx.arc(tX(cx), tY(f(cx)), 7, 0, Math.PI * 2)
    ctx.fillStyle = '#ef4444'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()
  }, [step, a, b, lr, history])

  const cx = history[Math.min(step, history.length - 1)]
  return (
    <div style={{ background: 'rgba(5,12,25,0.9)', border: '1px solid rgba(0,170,255,0.35)', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontFamily: "'Orbitron',monospace", letterSpacing: '0.1em', color: '#00d4ff', textTransform: 'uppercase' }}>Gradient Descent — f(x) = ax² + bx</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setStep(0)} style={{ padding: '3px 9px', background: 'rgba(0,170,255,0.08)', border: '1px solid rgba(0,170,255,0.25)', borderRadius: 5, color: '#94a3b8', fontSize: 11, cursor: 'pointer' }}>↺</button>
          <button onClick={() => setStep(s => Math.min(s + 1, 29))} style={{ padding: '3px 10px', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 5, color: '#fbbf24', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Step →</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <canvas ref={canvasRef} width={280} height={160} style={{ borderRadius: 8, background: '#040810', width: '100%' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap' }}>α (lr)</span>
            <input type="range" min="0.01" max="0.4" step="0.01" value={lr}
              onChange={e => setLr(+e.target.value)} style={{ flex: 1, accentColor: '#fbbf24' }} />
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#fbbf24', width: 36 }}>{lr.toFixed(2)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 110 }}>
          {[
            { l: 'Step', v: step, c: '#e2e8f0' },
            { l: 'x', v: cx.toFixed(3), c: '#3b82f6' },
            { l: 'f(x)', v: f(cx).toFixed(3), c: '#f87171' },
            { l: 'x*', v: xMin.toFixed(2), c: '#10b981' },
          ].map(m => (
            <div key={m.l} style={{ background: 'rgba(0,20,50,0.7)', border: '1px solid rgba(0,170,255,0.15)', borderRadius: 7, padding: '5px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' }}>{m.l}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 600, color: m.c }}>{m.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── CONVOLUTION PADDING ──────────────────────────────────────────────────────
export function PaddingViz() {
  const [mode, setMode] = useState('same')
  const inputSize = 5, kernelSize = 3
  const pad = mode === 'same' ? Math.floor(kernelSize / 2) : 0
  const outSize = mode === 'same' ? inputSize : inputSize - kernelSize + 1
  const [hovered, setHovered] = useState(null)

  const CellBase = (type) => ({
    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 4, fontSize: 11, fontFamily: "'JetBrains Mono',monospace",
    transition: 'all 0.2s',
    ...(type === 'pad' ? { background: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(0,170,255,0.15)', color: '#1e293b' }
      : type === 'in' ? { background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }
      : type === 'kernel' ? { background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.4)', color: '#c084fc' }
      : { background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }),
  })

  return (
    <div style={{ background: 'rgba(5,12,25,0.9)', border: '1px solid rgba(0,170,255,0.35)', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontFamily: "'Orbitron',monospace", letterSpacing: '0.1em', color: '#00d4ff', textTransform: 'uppercase' }}>Conv2D Padding</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['valid', 'same'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '4px 12px', borderRadius: 5, fontSize: 11, cursor: 'pointer', fontWeight: 600,
              background: mode === m ? 'rgba(0,170,255,0.15)' : 'rgba(0,170,255,0.05)',
              border: `1px solid ${mode === m ? 'rgba(0,170,255,0.5)' : 'rgba(0,170,255,0.15)'}`,
              color: mode === m ? '#00d4ff' : '#475569',
            }}>{m}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', justifyContent: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: '#475569', marginBottom: 6, textAlign: 'center' }}>
            Input {mode === 'same' ? `(padded ${inputSize + pad * 2}×${inputSize + pad * 2})` : `(${inputSize}×${inputSize})`}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {Array.from({ length: inputSize + pad * 2 }, (_, r) => (
              <div key={r} style={{ display: 'flex', gap: 3 }}>
                {Array.from({ length: inputSize + pad * 2 }, (_, c) => {
                  const isPad = r < pad || r >= inputSize + pad || c < pad || c >= inputSize + pad
                  return <div key={c} style={CellBase(isPad ? 'pad' : 'in')}>{isPad ? '0' : '·'}</div>
                })}
              </div>
            ))}
          </div>
        </div>
        <div style={{ paddingTop: 30 }}>
          <div style={{ fontSize: 18, color: '#475569' }}>⊛</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#475569', marginBottom: 6, textAlign: 'center' }}>Kernel (3×3)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {Array.from({ length: kernelSize }, (_, r) => (
              <div key={r} style={{ display: 'flex', gap: 3 }}>
                {Array.from({ length: kernelSize }, (_, c) => (
                  <div key={c} style={CellBase('kernel')}>w</div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ paddingTop: 30, fontSize: 18, color: '#475569' }}>=</div>
        <div>
          <div style={{ fontSize: 10, color: '#475569', marginBottom: 6, textAlign: 'center' }}>Output ({outSize}×{outSize})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {Array.from({ length: outSize }, (_, r) => (
              <div key={r} style={{ display: 'flex', gap: 3 }}>
                {Array.from({ length: outSize }, (_, c) => <div key={c} style={CellBase('out')}>y</div>)}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'center', fontSize: 11 }}>
        <span style={{ color: '#60a5fa' }}>● Input</span>
        <span style={{ color: '#475569' }}>○ Zero-pad</span>
        <span style={{ color: '#c084fc' }}>● Kernel</span>
        <span style={{ color: '#4ade80' }}>● Output ({outSize}×{outSize})</span>
      </div>
    </div>
  )
}

export const VISUALIZATIONS = {
  sigmoid: SigmoidViz,
  logistic: LogisticViz,
  matrix: MatrixViz,
  positional: PositionalViz,
  gradient: GradientViz,
  padding: PaddingViz,
}