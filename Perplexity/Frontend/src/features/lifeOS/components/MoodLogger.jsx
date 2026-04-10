import React, { useState } from 'react'
import { useLifeOS } from '../hooks/useLifeOS'

const todayISO = () => new Date().toISOString().split('T')[0]
const MOOD_EMOJIS = ['','😞','😔','😕','😐','🙂','😊','😄','😁','🤩','🥳']
const MOOD_LABELS = ['','terrible','bad','poor','low','okay','fine','good','great','excellent','amazing']

function Sparkline({ moods }) {
  const data = [...moods].sort((a,b) => a.date.localeCompare(b.date)).slice(-10)
  if (!data.length) return null
  const W = 200, H = 36, pad = 3
  const xs = data.map((_,i) => pad + (i / (data.length - 1 || 1)) * (W - 2*pad))
  const ys = data.map(d => H - pad - (((d.score-1)/9) * (H - 2*pad)))
  const path = data.map((d,i) => `${i===0?'M':'L'}${xs[i]},${ys[i]}`).join(' ')
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:'block',height:36}}>
      <defs>
        <linearGradient id="mlGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4fffb0" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#4fffb0" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${path} L${xs[xs.length-1]},${H} L${xs[0]},${H} Z`} fill="url(#mlGrad)"/>
      <path d={path} fill="none" stroke="#4fffb0" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
      {data.map((d,i) => <circle key={i} cx={xs[i]} cy={ys[i]} r="2" fill="#4fffb0"/>)}
    </svg>
  )
}

export default function MoodLogger() {
  const { moods, handleLogMood } = useLifeOS()
  const todayStr = todayISO()
  const todayMood = moods.find(m => m.date === todayStr)

  const [form, setForm] = useState({ score:7, energy:7, stress:3, note:'' })
  const [submitting, setSubmitting] = useState(false)
  const [logged, setLogged] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await handleLogMood({ ...form, score:+form.score, energy:+form.energy, stress:+form.stress })
      setLogged(true)
    } finally {
      setSubmitting(false)
    }
  }

  const avg = moods.length
    ? (moods.slice(0,14).reduce((a,m) => a+m.score, 0) / Math.min(moods.length,14)).toFixed(1)
    : null

  return (
    <>
      <style>{`
        .ml-root { font-family:'Space Grotesk','Inter',sans-serif; }
        .ml-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .ml-title { font-size:13px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:rgba(212,255,230,0.5); display:flex; align-items:center; gap:8px; }
        .ml-title-dot { width:5px; height:5px; border-radius:50%; background:#4fffb0; animation:mlGlow 2s ease-in-out infinite; }
        @keyframes mlGlow { 0%,100%{opacity:.5} 50%{opacity:1} }
        .ml-hist-btn { font-family:inherit; font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:6px 12px; border-radius:5px; border:1px solid rgba(79,255,176,0.15); background:transparent; color:rgba(79,255,176,0.5); cursor:pointer; transition:all .15s; }
        .ml-hist-btn:hover { border-color:rgba(79,255,176,0.3); color:#4fffb0; }
        .ml-hist-btn.active { border-color:rgba(79,255,176,0.3); color:#4fffb0; background:rgba(79,255,176,0.06); }

        /* Today badge */
        .ml-today { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; background:rgba(79,255,176,0.05); border:1px solid rgba(79,255,176,0.12); margin-bottom:14px; }
        .ml-today-emoji { font-size:24px; }
        .ml-today-info { flex:1; }
        .ml-today-score { font-family:'Space Mono',monospace; font-size:13px; font-weight:700; color:#4fffb0; }
        .ml-today-label { font-size:11px; color:rgba(212,255,230,0.4); margin-top:1px; text-transform:capitalize; }
        .ml-today-tag { font-family:'Space Mono',monospace; font-size:9px; letter-spacing:.1em; text-transform:uppercase; padding:3px 8px; border-radius:3px; background:rgba(79,255,176,0.08); border:1px solid rgba(79,255,176,0.15); color:#4fffb0; }

        /* Form */
        .ml-form { display:grid; gap:14px; }
        .ml-fg { display:flex; flex-direction:column; gap:6px; }
        .ml-fl { font-size:9px; font-weight:700; letter-spacing:.15em; text-transform:uppercase; color:rgba(212,255,230,0.3); display:flex; align-items:center; justify-content:space-between; }
        .ml-fl-val { color:#4fffb0; font-family:'Space Mono',monospace; }
        .ml-sl { width:100%; height:3px; -webkit-appearance:none; background:rgba(255,255,255,0.07); border-radius:3px; outline:none; cursor:pointer; }
        .ml-sl::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; cursor:pointer; transition:transform .12s; box-shadow:0 0 6px currentColor; }
        .ml-frow { display:flex; gap:12px; }
        .ml-frow > .ml-fg { flex:1; }
        .ml-fi { background:rgba(0,0,0,0.3); border:1px solid rgba(79,255,176,0.1); border-radius:7px; padding:9px 11px; color:#d4ffe6; font-size:13px; font-family:inherit; outline:none; transition:border-color .15s; width:100%; }
        .ml-fi:focus { border-color:rgba(79,255,176,0.3); }
        .ml-fi::placeholder { color:rgba(212,255,230,0.2); }
        .ml-submit { font-family:inherit; font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:9px 18px; border-radius:6px; border:none; background:#4fffb0; color:#060d09; cursor:pointer; transition:all .15s; width:fit-content; }
        .ml-submit:hover { background:#2de08e; }
        .ml-submit:disabled { opacity:.4; cursor:not-allowed; }

        /* Sparkline + avg */
        .ml-spark-row { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
        .ml-spark-wrap { flex:1; }
        .ml-avg-block { text-align:right; flex-shrink:0; }
        .ml-avg-num { font-family:'Space Mono',monospace; font-size:18px; font-weight:700; color:#4fffb0; line-height:1; }
        .ml-avg-label { font-size:9px; color:rgba(212,255,230,0.3); letter-spacing:.1em; text-transform:uppercase; margin-top:2px; }

        /* History */
        .ml-history { margin-top:14px; animation:mlFade .2s ease; }
        @keyframes mlFade { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
        .ml-hist-item { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid rgba(79,255,176,0.05); }
        .ml-hist-item:last-child { border-bottom:none; }
        .ml-hist-emoji { font-size:18px; flex-shrink:0; }
        .ml-hist-info { flex:1; min-width:0; }
        .ml-hist-date { font-family:'Space Mono',monospace; font-size:10px; color:rgba(212,255,230,0.4); letter-spacing:.05em; }
        .ml-hist-note { font-size:12px; color:rgba(212,255,230,0.5); margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .ml-hist-score { font-family:'Space Mono',monospace; font-size:13px; font-weight:700; }
        .ml-hist-sub { font-family:'Space Mono',monospace; font-size:9px; color:rgba(212,255,230,0.3); margin-top:1px; }
      `}</style>

      <div className="ml-root">
        <div className="ml-header">
          <div className="ml-title">
            <div className="ml-title-dot" />
            mood logger
          </div>
          {moods.length > 0 && (
            <button className={`ml-hist-btn ${showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(p => !p)}>
              {showHistory ? 'hide history' : 'history'}
            </button>
          )}
        </div>

        {/* Sparkline + avg */}
        {moods.length > 1 && (
          <div className="ml-spark-row">
            <div className="ml-spark-wrap"><Sparkline moods={moods}/></div>
            <div className="ml-avg-block">
              <div className="ml-avg-num">{avg}</div>
              <div className="ml-avg-label">14-day avg</div>
            </div>
          </div>
        )}

        {/* Today's mood badge */}
        {todayMood && !logged && (
          <div className="ml-today">
            <span className="ml-today-emoji">{MOOD_EMOJIS[todayMood.score]}</span>
            <div className="ml-today-info">
              <div className="ml-today-score">{todayMood.score}/10 — {MOOD_LABELS[todayMood.score]}</div>
              <div className="ml-today-label">logged today · update below</div>
            </div>
            <span className="ml-today-tag">today</span>
          </div>
        )}

        {/* Form */}
        <form className="ml-form" onSubmit={onSubmit}>
          <div className="ml-fg">
            <label className="ml-fl">
              <span>mood score</span>
              <span className="ml-fl-val">{MOOD_EMOJIS[form.score]} {form.score}/10</span>
            </label>
            <input type="range" min={1} max={10} step={1} value={form.score}
              className="ml-sl"
              style={{ accentColor:'#4fffb0' }}
              onChange={e => setForm(p => ({...p, score:+e.target.value}))}/>
          </div>
          <div className="ml-frow">
            <div className="ml-fg">
              <label className="ml-fl">
                <span>energy</span>
                <span className="ml-fl-val" style={{color:'#ffe066'}}>{form.energy}/10</span>
              </label>
              <input type="range" min={1} max={10} step={1} value={form.energy}
                className="ml-sl" style={{accentColor:'#ffe066'}}
                onChange={e => setForm(p => ({...p, energy:+e.target.value}))}/>
            </div>
            <div className="ml-fg">
              <label className="ml-fl">
                <span>stress</span>
                <span className="ml-fl-val" style={{color:'#ff6b6b'}}>{form.stress}/10</span>
              </label>
              <input type="range" min={1} max={10} step={1} value={form.stress}
                className="ml-sl" style={{accentColor:'#ff6b6b'}}
                onChange={e => setForm(p => ({...p, stress:+e.target.value}))}/>
            </div>
          </div>
          <div className="ml-fg">
            <label className="ml-fl"><span>note (optional)</span></label>
            <input className="ml-fi" placeholder="how are you feeling?"
              value={form.note} onChange={e => setForm(p => ({...p, note:e.target.value}))}/>
          </div>
          <button type="submit" className="ml-submit" disabled={submitting}>
            {submitting ? 'logging…' : logged ? '✓ updated' : 'log mood'}
          </button>
        </form>

        {/* History */}
        {showHistory && moods.length > 0 && (
          <div className="ml-history">
            {moods.slice(0, 10).map((m, i) => (
              <div key={i} className="ml-hist-item">
                <span className="ml-hist-emoji">{MOOD_EMOJIS[m.score]}</span>
                <div className="ml-hist-info">
                  <div className="ml-hist-date">{m.date}</div>
                  {m.note && <div className="ml-hist-note">{m.note}</div>}
                </div>
                <div style={{textAlign:'right'}}>
                  <div className="ml-hist-score"
                    style={{color: m.score>=7?'#4fffb0':m.score>=5?'#ffe066':'#ff6b6b'}}>
                    {m.score}/10
                  </div>
                  <div className="ml-hist-sub">e:{m.energy} s:{m.stress}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}