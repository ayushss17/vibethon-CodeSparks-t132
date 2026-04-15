import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORY_CARDS, TOPIC_FILTERS, ALL_PROBLEMS } from '../data/problemsData'

const difficultyStyle = {
  Easy: { color:'#4ade80', background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.25)' },
  Medium: { color:'#fbbf24', background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.25)' },
  Hard: { color:'#f87171', background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.25)' },
}

const StatusIcon = ({ status }) => {
  if (status === 'solved') return (
    <svg width="16" height="16" fill="none" viewBox="0 0 20 20" style={{ color:'#4ade80' }}>
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" fill="rgba(74,222,128,0.1)"/>
      <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
  if (status === 'attempted') return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ color:'#fbbf24' }}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="rgba(251,191,36,0.08)"/>
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
  return <span style={{ color:'#475569', fontSize:13 }}>–</span>
}

export default function Problems() {
  const navigate = useNavigate()
  const [selectedTopic, setSelectedTopic] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [comingSoonCard, setComingSoonCard] = useState(null)
  const [showAllTopics, setShowAllTopics] = useState(false)

  const userProgress = { easy: 0, medium: 0, hard: 0, total: 0 }

  const filteredProblems = useMemo(() => {
    return ALL_PROBLEMS.filter(p => {
      const matchesTopic = selectedTopic === 'All' || p.topics?.includes(selectedTopic)
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'All' ||
        (statusFilter === 'Solved' && p.status === 'solved') ||
        (statusFilter === 'Unsolved' && p.status !== 'solved')
      const matchesDifficulty = difficultyFilter === 'All' || p.difficulty === difficultyFilter
      return matchesTopic && matchesSearch && matchesStatus && matchesDifficulty
    })
  }, [selectedTopic, searchQuery, statusFilter, difficultyFilter])

  const visibleTopics = showAllTopics ? TOPIC_FILTERS : TOPIC_FILTERS.slice(0, 7)

  return (
    <div style={{ display:'flex', minHeight:'calc(100vh - 54px)', background:'var(--bg-deep)' }}>

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
      <aside className="problems-sidebar">

        {/* AI Model shortcuts */}
        <div>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.08em', color:'var(--text-dim)', textTransform:'uppercase', marginBottom:10 }}>Models</div>
          {[
            { name:'Transformers', icon:'⚡', color:'#f59e0b' },
            { name:'LLaMA', icon:'🦙', color:'#10b981' },
            { name:'ResNet', icon:'🔷', color:'#3b82f6' },
            { name:'GPT-2', icon:'🛡️', color:'#8b5cf6' },
            { name:'Gemma 3', icon:'💎', color:'#ec4899' },
          ].map(m => (
            <div key={m.name} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'9px 12px', borderRadius:9,
              background:'rgba(10,22,40,0.7)', border:'1px solid var(--border)',
              cursor:'pointer', marginBottom:6, transition:'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-bright)'; e.currentTarget.style.background='rgba(42,159,255,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='rgba(10,22,40,0.7)' }}>
              <div style={{ width:30, height:30, borderRadius:7, background:`${m.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>{m.icon}</div>
              <span style={{ fontSize:13, fontWeight:500, color:'#c9d1d9' }}>{m.name}</span>
            </div>
          ))}
        </div>

        {/* Your Progress */}
        <div style={{ background:'rgba(10,22,40,0.7)', border:'1px solid var(--border)', borderRadius:12, padding:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#4ade80" strokeWidth="2">
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            <span style={{ fontSize:13, fontWeight:600 }}>Your Progress</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:12 }}>
            {[{l:'Easy',v:userProgress.easy,c:'#4ade80'},{l:'Medium',v:userProgress.medium,c:'#fbbf24'},{l:'Hard',v:userProgress.hard,c:'#f87171'}].map(s => (
              <div key={s.l} style={{ background:'rgba(2,8,23,0.8)', borderRadius:8, padding:'8px', textAlign:'center' }}>
                <p style={{ fontSize:10, color:'var(--text-dim)', marginBottom:4 }}>{s.l}</p>
                <p style={{ fontSize:22, fontWeight:800, color:s.c, lineHeight:1, fontFamily:"'Syne',sans-serif" }}>{s.v}</p>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
            <span style={{ color:'var(--text-dim)' }}>Total Solved</span>
            <span style={{ color:'#4ade80', fontWeight:700 }}>{userProgress.total}</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background:'rgba(10,22,40,0.7)', border:'1px solid var(--border)', borderRadius:12, padding:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="var(--text-dim)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            <span style={{ fontSize:13, fontWeight:600 }}>Recent Activity</span>
          </div>
          <p style={{ fontSize:12, color:'var(--text-dim)' }}>No activity yet. Start solving!</p>
        </div>

        {/* GitHub connect */}
        <div style={{ background:'rgba(10,22,40,0.7)', border:'1px solid var(--border)', borderRadius:12, padding:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <svg width="16" height="16" fill="#e6edf3" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58V20.7c-3.34.72-4.03-1.42-4.03-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 013.01-.4c1.02 0 2.05.14 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.19.7.8.58C20.56 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z"/>
            </svg>
            <span style={{ fontSize:13, fontWeight:600 }}>Connect GitHub</span>
          </div>
          <p style={{ fontSize:11.5, color:'var(--text-dim)', marginBottom:12 }}>Auto-backup your solutions</p>
          <button className="btn-ghost" style={{ width:'100%', padding:'7px', fontSize:12, textAlign:'center' }}>
            Connect →
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="problems-main">

        {/* Category cards */}
        <div style={{ padding:'20px 24px 12px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10 }}>
            {CATEGORY_CARDS.map(card => (
              <div key={card.id}
                onClick={() => { if (!card.comingSoon) navigate('/problems') }}
                style={{
                  display:'flex', alignItems:'center', gap:12,
                  background:'rgba(10,22,40,0.7)', border:'1px solid var(--border)',
                  borderRadius:12, padding:'14px', cursor: card.comingSoon ? 'default' : 'pointer',
                  opacity: card.comingSoon ? 0.5 : 1, transition:'all 0.2s',
                  position:'relative',
                }}
                onMouseEnter={e => { if (!card.comingSoon) { e.currentTarget.style.borderColor='var(--border-bright)'; e.currentTarget.style.transform='translateY(-2px)' } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)' }}
              >
                {card.comingSoon && (
                  <span style={{ position:'absolute', top:8, right:8, fontSize:9, fontWeight:700, background:'rgba(42,159,255,0.15)', color:'var(--accent)', padding:'2px 6px', borderRadius:4, letterSpacing:'0.06em' }}>SOON</span>
                )}
                <div style={{ width:36, height:36, borderRadius:9, background:`${card.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>{card.icon}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:2 }}>{card.title}</div>
                  <div style={{ fontSize:11.5, color:'var(--text-secondary)' }}>{card.count} problems</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic filters */}
        <div style={{ padding:'14px 24px 10px', borderBottom:'1px solid var(--border)', display:'flex', flexWrap:'wrap', gap:6, alignItems:'center' }}>
          {visibleTopics.map(topic => (
            <button key={topic} onClick={() => setSelectedTopic(topic)} style={{
              padding:'4px 14px', borderRadius:40, fontSize:12, fontWeight:500,
              cursor:'pointer', transition:'all 0.15s', border:'1px solid',
              borderColor: selectedTopic === topic ? 'var(--accent)' : 'rgba(42,159,255,0.15)',
              background: selectedTopic === topic ? 'rgba(42,159,255,0.15)' : 'transparent',
              color: selectedTopic === topic ? 'var(--accent)' : 'var(--text-secondary)',
              fontFamily:"'Space Grotesk',sans-serif",
            }}>
              {topic}
            </button>
          ))}
          {!showAllTopics && (
            <button onClick={() => setShowAllTopics(true)} style={{
              padding:'4px 12px', borderRadius:40, fontSize:12, cursor:'pointer',
              background:'transparent', border:'1px solid rgba(42,159,255,0.12)',
              color:'var(--text-dim)', display:'flex', alignItems:'center', gap:4,
              fontFamily:"'Space Grotesk',sans-serif",
            }}>
              +{TOPIC_FILTERS.length - 7} more
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          )}
        </div>

        {/* Search + Filters */}
        <div style={{ padding:'12px 24px', borderBottom:'1px solid var(--border)', display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ flex:1, position:'relative' }}>
            <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)' }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width:'100%', paddingLeft:36, paddingRight:14, paddingTop:8, paddingBottom:8,
                background:'rgba(10,22,40,0.8)', border:'1px solid var(--border)',
                borderRadius:8, fontSize:13, color:'var(--text-primary)', outline:'none',
                fontFamily:"'Space Grotesk',sans-serif",
              }}
              onFocus={e => e.target.style.borderColor='var(--accent)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
          </div>
          {[
            { val:statusFilter, set:setStatusFilter, opts:['All','Solved','Unsolved'] },
            { val:difficultyFilter, set:setDifficultyFilter, opts:['All','Easy','Medium','Hard'] },
          ].map((sel, i) => (
            <select key={i} value={sel.val} onChange={e => sel.set(e.target.value)}
              style={{
                padding:'8px 12px', background:'rgba(10,22,40,0.8)', border:'1px solid var(--border)',
                borderRadius:8, fontSize:13, color:'#c9d1d9', cursor:'pointer', outline:'none',
                fontFamily:"'Space Grotesk',sans-serif",
              }}>
              {sel.opts.map(o => <option key={o}>{o}</option>)}
            </select>
          ))}
        </div>

        {/* Problems table */}
        <div style={{ padding:'16px 24px', flex:1 }}>
          <div className="prob-table">
            <div className="prob-table-header">
              <span>Status</span><span>Problem</span><span>Topics</span><span>Difficulty</span>
            </div>
            {filteredProblems.length === 0 ? (
              <div style={{ padding:'40px', textAlign:'center', color:'var(--text-dim)', fontSize:13 }}>
                No problems match your filters
              </div>
            ) : filteredProblems.map(p => (
              <div key={p.id} className="prob-row" onClick={() => navigate(`/problems/${p.slug}`)}>
                <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
                  <StatusIcon status={p.status} />
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span className="prob-id">{p.id}.</span>
                  <span className="prob-title">{p.title}</span>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {p.topics?.map(t => (
                    <span key={t} className="topic-tag">{t}</span>
                  ))}
                </div>
                <div>
                  {p.difficulty ? (
                    <span style={{ ...difficultyStyle[p.difficulty], padding:'2px 10px', borderRadius:5, fontSize:12, fontWeight:600 }}>
                      {p.difficulty}
                    </span>
                  ) : <span style={{ color:'var(--text-dim)', fontSize:12 }}>–</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:20, alignItems:'center' }}>
            {[1,2,3].map(page => (
              <button key={page} style={{
                width:32, height:32, borderRadius:7, fontSize:13, cursor:'pointer',
                background: page === 1 ? 'rgba(42,159,255,0.15)' : 'transparent',
                border: page === 1 ? '1px solid var(--accent)' : '1px solid var(--border)',
                color: page === 1 ? 'var(--accent)' : 'var(--text-secondary)',
                fontFamily:"'Space Grotesk',sans-serif",
              }}>{page}</button>
            ))}
            <span style={{ color:'var(--text-dim)', fontSize:13 }}>...</span>
          </div>
        </div>
      </main>
    </div>
  )
}