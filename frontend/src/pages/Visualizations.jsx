// visualizations/index.jsx
// Each problem has its own unique interactive visualization component

import { useEffect, useRef, useState } from "react";

// ─── SIGMOID VISUALIZATION ─────────────────────────────────────────────────────
export function SigmoidViz() {
  const canvasRef = useRef(null);
  const [x, setX] = useState(0);

  const sigmoid = (v) => 1 / (1 + Math.exp(-v));
  const sigmoidGrad = (v) => { const s = sigmoid(v); return s * (1 - s); };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "#21262d";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath(); ctx.moveTo(i * W / 10, 0); ctx.lineTo(i * W / 10, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * H / 10); ctx.lineTo(W, i * H / 10); ctx.stroke();
    }

    const toCanvasX = (v) => ((v + 6) / 12) * W;
    const toCanvasY = (v) => H - v * H;

    // Axes
    ctx.strokeStyle = "#444d56";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(toCanvasX(0), 0); ctx.lineTo(toCanvasX(0), H); ctx.stroke();

    // Curve fill
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let px = 0; px < W; px++) {
      const xVal = (px / W) * 12 - 6;
      const yVal = sigmoid(xVal);
      ctx.lineTo(px, H - yVal * H);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(220, 38, 38, 0.3)");
    grad.addColorStop(1, "rgba(220, 38, 38, 0.02)");
    ctx.fillStyle = grad;
    ctx.fill();

    // Curve line
    ctx.beginPath();
    ctx.strokeStyle = "#ec4899";
    ctx.lineWidth = 2.5;
    for (let px = 0; px < W; px++) {
      const xVal = (px / W) * 12 - 6;
      const yVal = sigmoid(xVal);
      if (px === 0) ctx.moveTo(px, H - yVal * H);
      else ctx.lineTo(px, H - yVal * H);
    }
    ctx.stroke();

    // Current point
    const cx = toCanvasX(x);
    const cy = toCanvasY(sigmoid(x));
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#ec4899";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Vertical dashed line
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#8b949e";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, H / 2); ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = "#8b949e";
    ctx.font = "10px monospace";
    ctx.fillText("-6", toCanvasX(-6) + 2, H / 2 - 4);
    ctx.fillText("0", toCanvasX(0) + 4, H / 2 - 4);
    ctx.fillText("+6", toCanvasX(6) - 16, H / 2 - 4);
    ctx.fillText("1", toCanvasX(0) + 4, 12);
    ctx.fillText("0", toCanvasX(0) + 4, H - 4);
  }, [x]);

  return (
    <div className="bg-[#0d1117] rounded-xl border border-[#21262d] p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-pink-400 text-lg">〜</span>
        <span className="text-sm font-semibold text-[#e6edf3]">Sigmoid Activation</span>
      </div>
      <p className="text-xs text-[#8b949e] mb-3">Visualizing non-linearity and gradient saturation</p>
      <div className="flex items-center gap-3 mb-3">
        <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <input
          type="range" min="-6" max="6" step="0.1" value={x}
          onChange={(e) => setX(parseFloat(e.target.value))}
          className="flex-1 accent-pink-500"
        />
        <span className="text-sm font-mono text-[#e6edf3] w-10 text-right">{x.toFixed(1)}</span>
      </div>
      <div className="flex gap-3">
        <canvas ref={canvasRef} width={360} height={180} className="flex-1 rounded-lg bg-[#0a0e14]" style={{ maxWidth: 360 }} />
        <div className="flex flex-col gap-2 w-[140px]">
          <div className="bg-[#161b22] rounded-lg p-3 border border-[#21262d]">
            <p className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-1">Input (Logit)</p>
            <p className="text-xs text-[#8b949e]">x =</p>
            <p className="text-lg font-mono font-bold text-[#e6edf3]">{x.toFixed(2)}</p>
          </div>
          <div className="bg-[#0d1117] rounded-lg p-3 border border-pink-500/30">
            <p className="text-[10px] text-pink-400 uppercase tracking-wider mb-1">Activation</p>
            <p className="text-xs text-[#8b949e]">σ(x) =</p>
            <p className="text-lg font-mono font-bold text-pink-400">{sigmoid(x).toFixed(4)}</p>
          </div>
          <div className="bg-[#0d1117] rounded-lg p-3 border border-green-500/30">
            <p className="text-[10px] text-green-400 uppercase tracking-wider mb-1">Gradient</p>
            <p className="text-xs text-[#8b949e]">σ'(x) =</p>
            <p className="text-lg font-mono font-bold text-green-400">{sigmoidGrad(x).toFixed(4)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LOGISTIC REGRESSION VISUALIZATION ────────────────────────────────────────
export function LogisticViz() {
  const canvasRef = useRef(null);
  const lossRef = useRef(null);
  const [epoch, setEpoch] = useState(0);
  const [running, setRunning] = useState(false);
  const maxEpochs = 50;
  const timerRef = useRef(null);

  // Fixed dataset
  const data = [
    { x1: -2, x2: -1, y: 0 }, { x1: -1.5, x2: -0.5, y: 0 }, { x1: -1, x2: -1.5, y: 0 },
    { x1: -0.5, x2: -0.5, y: 0 }, { x1: -2, x2: 0.5, y: 0 },
    { x1: 1, x2: 1, y: 1 }, { x1: 1.5, x2: 0.5, y: 1 }, { x1: 0.5, x2: 1.5, y: 1 },
    { x1: 2, x2: 1, y: 1 }, { x1: 1, x2: 2, y: 1 },
  ];

  const sigmoid = (z) => 1 / (1 + Math.exp(-z));
  
  // Simulate weights at each epoch
  const getWeights = (ep) => {
    const t = ep / maxEpochs;
    return { w1: -0.437 + t * 1.8, w2: 0.552 + t * 1.2, b: 0 + t * 0.1 };
  };

  const getLoss = (ep) => {
    if (ep === 0) return 0.7208;
    return 0.7208 * Math.exp(-ep * 0.08) + 0.05;
  };

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setEpoch(e => {
          if (e >= maxEpochs) { setRunning(false); return e; }
          return e + 1;
        });
      }, 100);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const toX = (v) => ((v + 3) / 6) * W;
    const toY = (v) => H - ((v + 2) / 5) * H;

    // Grid
    ctx.strokeStyle = "#21262d"; ctx.lineWidth = 0.5;
    for (let i = 0; i <= 6; i++) {
      ctx.beginPath(); ctx.moveTo(i * W / 6, 0); ctx.lineTo(i * W / 6, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * H / 6); ctx.lineTo(W, i * H / 6); ctx.stroke();
    }

    const { w1, w2, b } = getWeights(epoch);

    // Decision boundary: w1*x1 + w2*x2 + b = 0 → x2 = -(w1*x1 + b)/w2
    if (Math.abs(w2) > 0.01) {
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = "#8b949e";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const x1_a = -3, x2_a = -(w1 * x1_a + b) / w2;
      const x1_b = 3, x2_b = -(w1 * x1_b + b) / w2;
      ctx.moveTo(toX(x1_a), toY(x2_a));
      ctx.lineTo(toX(x1_b), toY(x2_b));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Data points
    data.forEach(({ x1, x2, y }) => {
      ctx.beginPath();
      ctx.arc(toX(x1), toY(x2), 6, 0, Math.PI * 2);
      ctx.fillStyle = y === 1 ? "rgba(99,102,241,0.8)" : "rgba(236,72,153,0.8)";
      ctx.fill();
    });

    // Labels
    ctx.font = "9px sans-serif";
    ctx.fillStyle = "#ec4899";
    ctx.fillText("CLASS 1", 4, H - 4);
    ctx.fillStyle = "#6366f1";
    ctx.fillText("CLASS 0", 50, H - 4);
  }, [epoch]);

  useEffect(() => {
    const canvas = lossRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = "#21262d"; ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      ctx.beginPath(); ctx.moveTo(0, i * H / 5); ctx.lineTo(W, i * H / 5); ctx.stroke();
    }

    ctx.strokeStyle = "#10b981"; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let e = 0; e <= epoch; e++) {
      const x = (e / maxEpochs) * W;
      const y = H - (getLoss(e) / 0.8) * H * 0.9;
      if (e === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.font = "9px monospace";
    ctx.fillStyle = "#8b949e";
    ctx.fillText("Epoch 0", 4, H - 4);
    ctx.fillText(`${maxEpochs}`, W - 16, H - 4);
  }, [epoch]);

  const { w1, w2, b } = getWeights(epoch);

  return (
    <div className="bg-[#0d1117] rounded-xl border border-[#21262d] p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-blue-400 text-lg">⊕</span>
        <span className="text-sm font-semibold text-[#e6edf3]">Logistic Regression Training</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => { setEpoch(0); setRunning(false); }}
            className="w-6 h-6 flex items-center justify-center rounded text-[#8b949e] hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={() => setRunning(r => !r)}
            className="flex items-center gap-1 px-3 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs transition-colors"
          >
            {running ? (
              <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>Pause</>
            ) : (
              <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/></svg>Play</>
            )}
          </button>
          <span className="text-xs font-mono text-yellow-400">EPOCH {epoch}</span>
          <span className="text-xs text-[#8b949e]">LOSS: {getLoss(epoch).toFixed(4)}</span>
        </div>
      </div>
      <p className="text-xs text-[#8b949e] mb-3">Visualizing Gradient Descent fitting a decision boundary</p>
      <div className="flex gap-3">
        <canvas ref={canvasRef} width={260} height={180} className="rounded-lg bg-[#0a0e14]" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="bg-[#161b22] rounded-lg p-3 border border-[#21262d]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-green-400 uppercase">〜 Loss Curve</span>
              <span className="ml-auto text-xs font-mono text-green-400">{getLoss(epoch).toFixed(3)}</span>
            </div>
            <canvas ref={lossRef} width={160} height={60} className="w-full rounded bg-[#0a0e14]" />
            <div className="flex justify-between text-[9px] text-[#8b949e] mt-1">
              <span>Epoch 0</span>
              <span>{epoch}</span>
            </div>
          </div>
          <div className="bg-[#161b22] rounded-lg p-3 border border-[#21262d]">
            <p className="text-[10px] text-[#8b949e] uppercase mb-2">Learned Parameters</p>
            <div className="flex gap-3 text-xs font-mono">
              <span className="text-blue-400">w₁: {w1.toFixed(3)}</span>
              <span className="text-purple-400">w₂: {w2.toFixed(3)}</span>
            </div>
            <div className="text-xs font-mono text-[#8b949e] mt-1">bias: {b.toFixed(3)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PADDING VISUALIZATION ────────────────────────────────────────────────────
export function PaddingViz() {
  const [sequences, setSequences] = useState([[1, 2], [3, 4, 5], [6]]);
  const [padValue, setPadValue] = useState(0);
  const [padding, setPadding] = useState("right");

  const maxLen = Math.max(...sequences.map(s => s.length));
  const padded = sequences.map(seq => {
    const pad = Array(Math.max(0, maxLen - seq.length)).fill(padValue);
    return padding === "right" ? [...seq, ...pad] : [...pad, ...seq];
  });

  const addSeq = () => {
    const newSeq = [Math.floor(Math.random() * 9) + 1, Math.floor(Math.random() * 9) + 1];
    setSequences([...sequences, newSeq]);
  };

  const cellColor = (val, isPad) => isPad
    ? "bg-[#161b22] border-[#30363d] text-[#444d56]"
    : "bg-[#1f3a52] border-[#58a6ff]/40 text-[#58a6ff]";

  return (
    <div className="bg-[#0d1117] rounded-xl border border-[#21262d] p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-blue-400 text-lg">▦</span>
        <span className="text-sm font-semibold text-[#e6edf3]">Sequence Padding</span>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8b949e]">Pad Value:</span>
            <input
              type="number"
              value={padValue}
              onChange={e => setPadValue(parseInt(e.target.value) || 0)}
              className="w-12 px-2 py-0.5 bg-[#161b22] border border-[#30363d] rounded text-xs text-[#e6edf3] text-center focus:outline-none"
            />
          </div>
          <button
            onClick={() => setPadding("left")}
            className={`px-2 py-0.5 rounded text-xs border transition-colors ${padding === "left" ? "bg-[#58a6ff]/20 border-[#58a6ff] text-[#58a6ff]" : "border-[#30363d] text-[#8b949e]"}`}
          >Left</button>
          <button
            onClick={() => setPadding("right")}
            className={`px-2 py-0.5 rounded text-xs border transition-colors ${padding === "right" ? "bg-[#58a6ff]/20 border-[#58a6ff] text-[#58a6ff]" : "border-[#30363d] text-[#8b949e]"}`}
          >Right</button>
        </div>
      </div>
      <p className="text-xs text-[#8b949e] mb-4">PADDED (ALL LENGTH = {maxLen})</p>
      <div className="flex flex-col gap-2 mb-3">
        {padded.map((seq, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="text-xs text-[#8b949e] w-4">{i}</span>
            <div className="flex gap-1">
              {seq.map((val, j) => {
                const origLen = sequences[i].length;
                const isPad = padding === "right" ? j >= origLen : j < maxLen - origLen;
                return (
                  <div
                    key={j}
                    className={`w-8 h-8 flex items-center justify-center rounded border text-sm font-mono font-bold transition-all ${cellColor(val, isPad)}`}
                  >
                    {val}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={addSeq}
        className="flex items-center gap-1 text-xs text-[#58a6ff] hover:text-blue-300 transition-colors"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add sequence
      </button>
    </div>
  );
}

// ─── MATRIX TRANSPOSE VISUALIZATION ──────────────────────────────────────────
export function MatrixViz() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [showTranspose, setShowTranspose] = useState(false);

  const matrix = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => i * cols + j + 1)
  );
  const transposed = Array.from({ length: cols }, (_, j) =>
    Array.from({ length: rows }, (_, i) => matrix[i][j])
  );
  const display = showTranspose ? transposed : matrix;
  const dRows = showTranspose ? cols : rows;
  const dCols = showTranspose ? rows : cols;

  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

  return (
    <div className="bg-[#0d1117] rounded-xl border border-[#21262d] p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-yellow-400 text-lg">⊟</span>
        <span className="text-sm font-semibold text-[#e6edf3]">Matrix Transpose</span>
        <p className="text-xs text-[#8b949e] ml-2">Row → Column Swap</p>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setShowTranspose(false)}
            className={`px-3 py-1 rounded text-xs border transition-all ${!showTranspose ? "bg-[#d97706]/20 border-yellow-500 text-yellow-400" : "border-[#30363d] text-[#8b949e]"}`}
          >
            Original (A)
          </button>
          <button
            onClick={() => setShowTranspose(true)}
            className={`px-3 py-1 rounded text-xs border transition-all ${showTranspose ? "bg-[#d97706]/20 border-yellow-500 text-yellow-400" : "border-[#30363d] text-[#8b949e]"}`}
          >
            Transpose (Aᵀ)
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-3 mt-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8b949e]">Rows:</span>
          {[2, 3, 4].map(v => (
            <button key={v} onClick={() => setRows(v)}
              className={`w-6 h-6 rounded text-xs border transition-colors ${rows === v ? "bg-green-500/20 border-green-500 text-green-400" : "border-[#30363d] text-[#8b949e]"}`}
            >{v}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8b949e]">Cols:</span>
          {[2, 3, 4].map(v => (
            <button key={v} onClick={() => setCols(v)}
              className={`w-6 h-6 rounded text-xs border transition-colors ${cols === v ? "bg-green-500/20 border-green-500 text-green-400" : "border-[#30363d] text-[#8b949e]"}`}
            >{v}</button>
          ))}
        </div>
        <span className="text-xs text-[#8b949e] ml-auto">
          Shape: {showTranspose ? `(${cols}×${rows})` : `(${rows}×${cols})`}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {display.map((row, i) => (
          <div key={i} className="flex gap-1.5">
            {row.map((val, j) => (
              <div
                key={j}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-sm font-mono font-bold transition-all duration-300"
                style={{
                  background: `${colors[(showTranspose ? j : i) % colors.length]}22`,
                  border: `1px solid ${colors[(showTranspose ? j : i) % colors.length]}44`,
                  color: colors[(showTranspose ? j : i) % colors.length],
                }}
              >
                {val}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── POSITIONAL ENCODING VISUALIZATION ───────────────────────────────────────
export function PositionalViz() {
  const canvasRef = useRef(null);
  const [seqLen, setSeqLen] = useState(20);
  const [dModel, setDModel] = useState(16);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cellW = W / dModel;
    const cellH = H / seqLen;

    for (let pos = 0; pos < seqLen; pos++) {
      for (let i = 0; i < dModel; i++) {
        const angle = pos / Math.pow(10000, (2 * Math.floor(i / 2)) / dModel);
        const val = i % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
        const normalized = (val + 1) / 2;

        const r = Math.round(normalized < 0.5 ? normalized * 2 * 120 : 120 + (normalized - 0.5) * 2 * 135);
        const g = Math.round(normalized < 0.5 ? normalized * 2 * 40 : 40 + (normalized - 0.5) * 2 * 95);
        const b = Math.round(normalized < 0.5 ? 120 + normalized * 2 * 50 : 170 - (normalized - 0.5) * 2 * 70);

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(Math.round(i * cellW), Math.round(pos * cellH), Math.ceil(cellW), Math.ceil(cellH));
      }
    }
  }, [seqLen, dModel]);

  return (
    <div className="bg-[#0d1117] rounded-xl border border-[#21262d] p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-cyan-400 text-lg">〰</span>
        <span className="text-sm font-semibold text-[#e6edf3]">Positional Encoding</span>
        <p className="text-xs text-[#8b949e] ml-2">Sinusoidal Frequency Decay</p>
      </div>
      <div className="flex gap-6 mb-3 mt-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8b949e]">Sequence Length (T)</span>
          <input type="range" min="5" max="50" value={seqLen} onChange={e => setSeqLen(+e.target.value)} className="accent-cyan-500 w-24"/>
          <span className="text-xs font-mono text-cyan-400 w-6">{seqLen}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8b949e]">Embedding Dim (d_model)</span>
          <input type="range" min="4" max="32" step="2" value={dModel} onChange={e => setDModel(+e.target.value)} className="accent-cyan-500 w-24"/>
          <span className="text-xs font-mono text-cyan-400 w-6">{dModel}</span>
        </div>
      </div>
      <div className="flex gap-3 items-start">
        <div>
          <p className="text-[10px] text-[#8b949e] mb-1 text-center">Position →</p>
          <canvas ref={canvasRef} width={320} height={200} className="rounded-lg" />
          <div className="flex justify-between text-[9px] text-[#8b949e] mt-1">
            <span>dim 0</span>
            <span>← Embedding dimension →</span>
            <span>dim {dModel-1}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-xs text-[#8b949e]">
          <div className="bg-[#161b22] rounded p-2 border border-[#21262d]">
            <p className="text-cyan-400 font-semibold mb-1">Low dim</p>
            <p>High freq</p>
            <p>Fast change</p>
          </div>
          <div className="bg-[#161b22] rounded p-2 border border-[#21262d]">
            <p className="text-purple-400 font-semibold mb-1">High dim</p>
            <p>Low freq</p>
            <p>Slow change</p>
          </div>
          <div className="bg-[#161b22] rounded p-2 border border-[#21262d]">
            <div className="w-full h-3 rounded" style={{background: "linear-gradient(90deg, rgb(0,40,120), rgb(120,40,170), rgb(255,135,100))"}}/>
            <p className="mt-1">-1 → 0 → +1</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GRADIENT DESCENT VISUALIZATION ──────────────────────────────────────────
export function GradientViz() {
  const canvasRef = useRef(null);
  const [a, setA] = useState(1);
  const [b, setB] = useState(-4);
  const [x0, setX0] = useState(0);
  const [lr, setLr] = useState(0.1);
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState([0]);

  const f = (x) => a * x * x + b * x;
  const df = (x) => 2 * a * x + b;
  const xMin = Math.abs(a) > 0.01 ? -b / (2 * a) : 0;

  useEffect(() => {
    let x = x0;
    const hist = [x];
    for (let i = 0; i < 30; i++) {
      x = x - lr * df(x);
      hist.push(x);
    }
    setHistory(hist);
    setStep(0);
  }, [a, b, x0, lr]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const xRange = 8;
    const toCanvasX = (x) => ((x + xRange / 2) / xRange) * W;
    const fMin = f(xMin);
    const fMax = Math.max(f(-xRange / 2), f(xRange / 2));
    const yRange = Math.max(fMax - fMin, 1) * 1.2;
    const toCanvasY = (y) => H - 10 - ((y - fMin + yRange * 0.1) / (yRange * 1.2)) * (H - 20);

    // Grid
    ctx.strokeStyle = "#21262d"; ctx.lineWidth = 0.5;
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath(); ctx.moveTo(i * W / 8, 0); ctx.lineTo(i * W / 8, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * H / 8); ctx.lineTo(W, i * H / 8); ctx.stroke();
    }

    // Curve fill
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let px = 0; px < W; px++) {
      const xVal = (px / W) * xRange - xRange / 2;
      ctx.lineTo(px, toCanvasY(f(xVal)));
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    const grad2 = ctx.createLinearGradient(0, 0, 0, H);
    grad2.addColorStop(0, "rgba(59,130,246,0.3)");
    grad2.addColorStop(1, "rgba(59,130,246,0.02)");
    ctx.fillStyle = grad2;
    ctx.fill();

    // Curve
    ctx.beginPath();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.5;
    for (let px = 0; px < W; px++) {
      const xVal = (px / W) * xRange - xRange / 2;
      if (px === 0) ctx.moveTo(px, toCanvasY(f(xVal)));
      else ctx.lineTo(px, toCanvasY(f(xVal)));
    }
    ctx.stroke();

    // History path
    if (step > 0) {
      ctx.strokeStyle = "rgba(251,191,36,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      history.slice(0, step + 1).forEach((x, i) => {
        const px = toCanvasX(x);
        const py = toCanvasY(f(x));
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }

    // Minimum marker
    ctx.beginPath();
    ctx.arc(toCanvasX(xMin), toCanvasY(fMin), 4, 0, Math.PI * 2);
    ctx.fillStyle = "#10b981";
    ctx.fill();

    // Current point
    const cx = history[Math.min(step, history.length - 1)];
    ctx.beginPath();
    ctx.arc(toCanvasX(cx), toCanvasY(f(cx)), 7, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Arrow showing gradient direction
    const gDir = -df(cx) * lr;
    const arrowLen = Math.min(Math.abs(gDir), 1) * 30 * Math.sign(gDir);
    ctx.beginPath();
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 1.5;
    ctx.moveTo(toCanvasX(cx), toCanvasY(f(cx)));
    ctx.lineTo(toCanvasX(cx) + arrowLen * W / xRange, toCanvasY(f(cx)));
    ctx.stroke();
  }, [step, a, b, x0, lr, history]);

  const currentX = history[Math.min(step, history.length - 1)];

  return (
    <div className="bg-[#0d1117] rounded-xl border border-[#21262d] p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-yellow-400 text-lg">〜</span>
        <span className="text-sm font-semibold text-[#e6edf3]">Gradient Descent</span>
        <p className="text-xs text-[#8b949e] ml-2">f(x) = ax² + bx + c</p>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setStep(s => Math.min(s + 1, 29))}
            className="px-3 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs transition-colors"
          >Step</button>
          <button
            onClick={() => setStep(0)}
            className="px-2 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] text-xs transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex gap-3 mt-3">
        <div className="flex-1">
          <canvas ref={canvasRef} width={300} height={180} className="w-full rounded-lg bg-[#0a0e14]" />
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-[#8b949e]">Learning Rate (α)</span>
            <input type="range" min="0.01" max="0.4" step="0.01" value={lr} onChange={e => setLr(+e.target.value)} className="flex-1 accent-yellow-500"/>
            <span className="text-xs font-mono text-yellow-400">{lr.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-[120px]">
          <div className="bg-[#161b22] rounded-lg p-2 border border-[#21262d] text-center">
            <p className="text-[10px] text-[#8b949e]">Step</p>
            <p className="text-xl font-mono font-bold text-[#e6edf3]">{step}</p>
          </div>
          <div className="bg-[#161b22] rounded-lg p-2 border border-blue-500/30 text-center">
            <p className="text-[10px] text-blue-400">x</p>
            <p className="text-base font-mono font-bold text-blue-400">{currentX.toFixed(2)}</p>
          </div>
          <div className="bg-[#161b22] rounded-lg p-2 border border-red-500/30 text-center">
            <p className="text-[10px] text-red-400">f(x)</p>
            <p className="text-base font-mono font-bold text-red-400">{f(currentX).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const VISUALIZATIONS = {
  sigmoid: SigmoidViz,
  logistic: LogisticViz,
  padding: PaddingViz,
  matrix: MatrixViz,
  positional: PositionalViz,
  gradient: GradientViz,
};