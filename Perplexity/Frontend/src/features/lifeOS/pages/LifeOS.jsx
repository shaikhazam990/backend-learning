import React, { useEffect, useState, useRef } from 'react'
import { useLifeOS } from '../hooks/useLifeOS'
import { useSelector } from 'react-redux'

const todayISO = () => new Date().toISOString().split('T')[0]
const MOOD_EMOJIS = ['','😞','😔','😕','😐','🙂','😊','😄','😁','🤩','🥳']
const SPEND_CATS  = ['food','transport','entertainment','health','shopping','bills','education','other']
const HABIT_ICONS = ['✅','💪','📚','🏃','🧘','💧','🎯','⚡','🌱','🎨']
const HABIT_CATS  = ['health','work','learning','fitness','mindfulness','other']

function ScoreArc({ score }) {
  const r = 34, circ = 2 * Math.PI * r
  const col = score >= 75 ? '#059669' : score >= 50 ? '#d97706' : '#dc2626'
  return (
    <div style={{ position:'relative', width:84, height:84 }}>
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={r} fill="none" stroke="#e5e7eb" strokeWidth="5"/>
        <circle cx="42" cy="42" r={r} fill="none" stroke={col} strokeWidth="5"
          strokeDasharray={`${(score/100)*circ} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 42 42)"
          style={{transition:'stroke-dasharray 1.4s cubic-bezier(0.22,1,0.36,1)'}}/>
        <text x="42" y="47" textAnchor="middle" fill={col} fontSize="17" fontWeight="800"
          fontFamily="'Plus Jakarta Sans',sans-serif">{score}</text>
      </svg>
    </div>
  )
}

function Sparkline({ moods }) {
  const data = [...moods].sort((a,b)=>a.date.localeCompare(b.date)).slice(-14)
  if (!data.length) return (
    <div style={{color:'#9ca3af',fontSize:12,padding:'12px 0',textAlign:'center'}}>no mood data yet</div>
  )
  const W=300, H=52, pad=4
  const xs = data.map((_,i)=>pad+(i/(data.length-1||1))*(W-2*pad))
  const ys = data.map(d=>H-pad-(((d.score-1)/9)*(H-2*pad)))
  const path = data.map((d,i)=>`${i===0?'M':'L'}${xs[i]},${ys[i]}`).join(' ')
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:'block',height:52}}>
      <defs>
        <linearGradient id="spg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${path} L${xs[xs.length-1]},${H} L${xs[0]},${H} Z`} fill="url(#spg)"/>
      <path d={path} fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      {data.map((d,i)=>(
        <circle key={i} cx={xs[i]} cy={ys[i]} r="3" fill="white" stroke="#10b981" strokeWidth="1.5"/>
      ))}
    </svg>
  )
}

function HBar({ pct, color='#10b981' }) {
  return (
    <div style={{height:6,background:'#f3f4f6',borderRadius:99,overflow:'hidden'}}>
      <div style={{height:'100%',width:`${pct}%`,background:color,borderRadius:99,transition:'width 1s cubic-bezier(0.22,1,0.36,1)'}}/>
    </div>
  )
}

export default function LifeOS() {
  const lifeOS = useLifeOS()
  const user = useSelector(s => s.auth.user)
  const [tab, setTab] = useState('overview')
  const [newHabit, setNewHabit] = useState({ name:'', icon:'💪', category:'health', frequency:'daily' })
  const [showHabitForm, setShowHabitForm] = useState(false)
  const [moodForm, setMoodForm] = useState({ score:7, energy:7, stress:3, note:'' })
  const [moodLogged, setMoodLogged] = useState(false)
  const [spendForm, setSpendForm] = useState({ amount:'', category:'food', description:'' })
  const [adviceFetched, setAdviceFetched] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => { lifeOS.loadAll() }, [])
  useEffect(() => { const t = setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(t) }, [])

  const todayStr = todayISO()
  const todayMood = lifeOS.moods.find(m=>m.date===todayStr)
  const todaySpend = lifeOS.spendings.filter(s=>s.date===todayStr).reduce((a,s)=>a+s.amount,0)
  const spendByCat = lifeOS.spendings.reduce((acc,s)=>{ acc[s.category]=(acc[s.category]||0)+s.amount; return acc },{})
  const totalSpend = Object.values(spendByCat).reduce((a,b)=>a+b,0)
  const habitsDone = lifeOS.habits.filter(h=>h.completedDates?.includes(todayStr)).length
  const completionPct = lifeOS.habits.length ? Math.round((habitsDone/lifeOS.habits.length)*100) : 0
  const moodAvg = lifeOS.moods.length
    ? (lifeOS.moods.slice(0,14).reduce((a,m)=>a+m.score,0)/Math.min(lifeOS.moods.length,14)).toFixed(1)
    : null

  const handleFetchAdvice = async () => { setAdviceFetched(true); await lifeOS.fetchAdvice() }
  const handleLogMood = async (e) => { e.preventDefault(); await lifeOS.handleLogMood({...moodForm,score:+moodForm.score,energy:+moodForm.energy,stress:+moodForm.stress}); setMoodLogged(true) }
  const handleAddSpend = async (e) => { e.preventDefault(); if(!spendForm.amount)return; await lifeOS.handleAddSpending({...spendForm,amount:+spendForm.amount}); setSpendForm({amount:'',category:'food',description:''}) }
  const handleCreateHabit = async (e) => { e.preventDefault(); if(!newHabit.name.trim())return; await lifeOS.handleCreateHabit(newHabit); setNewHabit({name:'',icon:'💪',category:'health',frequency:'daily'}); setShowHabitForm(false) }

  const timeStr = now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true})
  const dateStr = now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})

  const tabs = [
    {id:'overview', label:'Overview', icon:'◈'},
    {id:'habits',   label:'Habits',   icon:'◉'},
    {id:'mood',     label:'Mood',     icon:'◑'},
    {id:'spending', label:'Spending', icon:'◐'},
  ]

  return (
    <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      :root{
        --bg:#f8fafc;
        --surface:#ffffff;
        --surface2:#f1f5f9;
        --border:#e2e8f0;
        --border2:#cbd5e1;
        --green:#10b981;
        --green2:#059669;
        --green-light:#d1fae5;
        --green-pale:#ecfdf5;
        --text:#0f172a;
        --text2:#475569;
        --text3:#94a3b8;
        --amber:#f59e0b;
        --red:#ef4444;
        --blue:#3b82f6;
        --sans:'Plus Jakarta Sans',sans-serif;
        --mono:'DM Mono',monospace;
        --r:14px;
      }
      html,body{background:var(--bg);color:var(--text);font-family:var(--sans)}

      @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      @keyframes slideIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
      @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @keyframes dotPulse{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.4);opacity:1}}

      .los-root{min-height:100vh;background:var(--bg)}
      .los-inner{max-width:900px;margin:0 auto;padding:32px 24px}

      /* ── Header ── */
      .los-hdr{
        display:flex;align-items:flex-start;justify-content:space-between;
        margin-bottom:32px;flex-wrap:wrap;gap:16px
      }
      .hdr-left{display:flex;flex-direction:column;gap:4px}
      .hdr-tag{display:inline-flex;align-items:center;gap:6px;
        font-family:var(--mono);font-size:10px;font-weight:500;letter-spacing:.08em;
        color:var(--green2);background:var(--green-pale);border:1px solid var(--green-light);
        padding:4px 10px;border-radius:99px;width:fit-content;margin-bottom:6px}
      .hdr-tag-dot{width:5px;height:5px;border-radius:50%;background:var(--green);animation:dotPulse 2s ease-in-out infinite}
      .hdr-name{font-size:26px;font-weight:800;letter-spacing:-.04em;color:var(--text);line-height:1.1}
      .hdr-date{font-size:13px;color:var(--text3);font-weight:400;margin-top:3px}
      .hdr-right{display:flex;flex-direction:column;align-items:flex-end;gap:4px}
      .hdr-time{font-family:var(--mono);font-size:24px;font-weight:500;color:var(--text);letter-spacing:-.02em}
      .hdr-pct-pill{
        font-family:var(--mono);font-size:11px;font-weight:500;
        padding:4px 10px;border-radius:99px;
        background:var(--green-pale);color:var(--green2);border:1px solid var(--green-light)
      }

      /* ── Tabs ── */
      .los-tabs{
        display:flex;gap:4px;background:var(--surface);
        border:1px solid var(--border);border-radius:12px;
        padding:4px;margin-bottom:28px;width:fit-content;
        box-shadow:0 1px 3px rgba(0,0,0,0.04)
      }
      .los-tab{
        display:flex;align-items:center;gap:6px;
        padding:8px 16px;border-radius:9px;border:none;
        background:transparent;color:var(--text3);font-size:13px;
        font-family:var(--sans);font-weight:600;cursor:pointer;
        transition:all 0.18s;white-space:nowrap
      }
      .los-tab:hover:not(.active){background:var(--surface2);color:var(--text2)}
      .los-tab.active{background:var(--green);color:white;box-shadow:0 2px 8px rgba(16,185,129,0.3)}
      .los-tab .tab-ic{font-size:13px;opacity:0.7}
      .los-tab.active .tab-ic{opacity:1}

      /* ── Stat grid ── */
      .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
      .stat-card{
        background:var(--surface);border:1px solid var(--border);border-radius:var(--r);
        padding:18px 16px;position:relative;overflow:hidden;
        box-shadow:0 1px 3px rgba(0,0,0,0.04);
        animation:fadeUp .35s cubic-bezier(.22,1,.36,1) both;transition:box-shadow .2s,border-color .2s
      }
      .stat-card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.08);border-color:var(--border2)}
      .stat-card-accent{position:absolute;top:0;left:0;right:0;height:3px;border-radius:var(--r) var(--r) 0 0}
      .stat-lbl{font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text3);margin-bottom:8px}
      .stat-val{font-size:26px;font-weight:800;letter-spacing:-.03em;color:var(--text);line-height:1}
      .stat-sub{font-size:12px;color:var(--text3);margin-top:5px}

      /* ── Section card ── */
      .card{
        background:var(--surface);border:1px solid var(--border);border-radius:var(--r);
        overflow:hidden;margin-bottom:14px;
        box-shadow:0 1px 3px rgba(0,0,0,0.04);
        animation:fadeUp .35s cubic-bezier(.22,1,.36,1) both
      }
      .card-hdr{
        display:flex;align-items:center;justify-content:space-between;
        padding:14px 18px;border-bottom:1px solid var(--border);background:var(--surface2)
      }
      .card-ttl{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--text2);display:flex;align-items:center;gap:8px}
      .card-ttl-dot{width:6px;height:6px;border-radius:50%;background:var(--green)}
      .card-body{padding:20px}

      /* ── AI card ── */
      .ai-card{
        background:linear-gradient(135deg,#f0fdf4,#ecfdf5);
        border:1px solid #a7f3d0;border-radius:var(--r);
        margin-bottom:14px;overflow:hidden;
        box-shadow:0 1px 3px rgba(0,0,0,0.04);
        animation:fadeUp .4s ease both
      }
      .ai-card-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #a7f3d0}
      .ai-tag{font-family:var(--mono);font-size:10px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;
        color:var(--green2);background:white;border:1px solid #6ee7b7;
        padding:4px 10px;border-radius:99px;display:flex;align-items:center;gap:6px}
      .ai-tag-dot{width:4px;height:4px;border-radius:50%;background:var(--green);animation:dotPulse 1.5s ease-in-out infinite}
      .ai-run-btn{
        font-family:var(--sans);font-size:12px;font-weight:700;padding:8px 16px;
        border-radius:8px;border:none;background:var(--green);color:white;
        cursor:pointer;transition:all .18s;letter-spacing:.01em
      }
      .ai-run-btn:hover:not(:disabled){background:var(--green2);transform:translateY(-1px);box-shadow:0 4px 12px rgba(16,185,129,0.3)}
      .ai-run-btn:disabled{opacity:.4;cursor:not-allowed;transform:none}

      /* Loading dots */
      .load-wrap{display:flex;align-items:center;gap:6px;padding:8px 0}
      .load-d{width:5px;height:5px;border-radius:50%;background:var(--green);animation:dotPulse 1.2s ease-in-out infinite}
      .load-d:nth-child(2){animation-delay:.15s}.load-d:nth-child(3){animation-delay:.3s}

      /* Insights */
      .insight{display:flex;gap:12px;padding:11px 14px;border-radius:10px;
        background:white;border:1px solid #d1fae5;margin-bottom:7px;transition:all .15s}
      .insight:hover{border-color:#6ee7b7;box-shadow:0 2px 8px rgba(16,185,129,0.08)}
      .insight-type{font-family:var(--mono);font-size:9px;font-weight:500;letter-spacing:.1em;
        text-transform:uppercase;color:var(--green2);margin-bottom:3px}
      .insight-body{font-size:13px;color:var(--text2);line-height:1.5}
      .insight-body strong{color:var(--text)}

      /* Priority chips */
      .pchip{display:inline-block;font-size:12px;padding:5px 12px;border-radius:99px;
        background:white;border:1px solid #a7f3d0;color:var(--green2);margin:3px 3px}

      /* Habit items */
      .habit-item{display:flex;align-items:center;gap:12px;padding:12px 14px;
        border-radius:10px;border:1px solid transparent;transition:all .15s;cursor:default}
      .habit-item:hover{background:var(--surface2);border-color:var(--border)}
      .hchk{width:24px;height:24px;border-radius:6px;border:2px solid var(--border2);
        cursor:pointer;display:flex;align-items:center;justify-content:center;
        flex-shrink:0;transition:all .15s cubic-bezier(.22,1,.36,1);font-size:12px;color:white}
      .hchk.done{background:var(--green);border-color:var(--green)}
      .hchk:hover:not(.done){border-color:var(--green);background:var(--green-pale)}
      .streak-badge{font-family:var(--mono);font-size:11px;padding:3px 9px;border-radius:99px;
        background:#fef3c7;border:1px solid #fde68a;color:#92400e;flex-shrink:0;font-weight:500}
      .xbtn{background:none;border:none;color:var(--text3);cursor:pointer;
        padding:4px 7px;border-radius:6px;transition:all .12s;font-size:13px}
      .xbtn:hover{color:var(--red);background:#fee2e2}

      /* Forms */
      .fg{display:flex;flex-direction:column;gap:5px}
      .fl{font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text2)}
      .fi{background:var(--surface2);border:1.5px solid var(--border);border-radius:9px;
        padding:10px 13px;color:var(--text);font-size:14px;font-family:var(--sans);outline:none;
        transition:all .18s;width:100%}
      .fi:focus{border-color:var(--green);background:white;box-shadow:0 0 0 3px rgba(16,185,129,0.1)}
      .fi::placeholder{color:var(--text3)}
      select.fi option{background:white}
      .frow{display:flex;gap:10px;flex-wrap:wrap}
      .frow>.fg{flex:1;min-width:110px}

      /* Sliders */
      .sl{width:100%;height:4px;-webkit-appearance:none;background:#e2e8f0;border-radius:99px;outline:none;cursor:pointer}
      .sl::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;
        background:white;cursor:pointer;transition:transform .12s;
        box-shadow:0 1px 4px rgba(0,0,0,0.2),0 0 0 2px var(--green)}
      .sl::-webkit-slider-thumb:hover{transform:scale(1.2)}

      /* Buttons */
      .pbtn{font-family:var(--sans);font-size:13px;font-weight:700;
        padding:10px 20px;border-radius:9px;border:none;
        background:var(--green);color:white;cursor:pointer;
        transition:all .18s;letter-spacing:.01em}
      .pbtn:hover{background:var(--green2);transform:translateY(-1px);box-shadow:0 4px 12px rgba(16,185,129,0.3)}
      .pbtn:active{transform:translateY(0)}
      .pbtn.outline{background:transparent;color:var(--text2);border:1.5px solid var(--border2)}
      .pbtn.outline:hover{border-color:var(--green);color:var(--green);background:var(--green-pale)}
      .pbtn:disabled{opacity:.4;cursor:not-allowed;transform:none}

      .igrid{display:flex;flex-wrap:wrap;gap:6px}
      .iopt{width:36px;height:36px;border-radius:8px;border:1.5px solid var(--border);
        background:var(--surface2);cursor:pointer;font-size:16px;
        display:flex;align-items:center;justify-content:center;transition:all .12s}
      .iopt.sel{border-color:var(--green);background:var(--green-pale)}
      .iopt:hover{border-color:var(--green);transform:scale(1.08)}

      /* Spend bars */
      .sbar-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
      .sbar-lbl{font-size:12px;color:var(--text2);min-width:88px;text-transform:capitalize;font-weight:500}
      .sbar-bg{flex:1;height:5px;background:#f1f5f9;border-radius:99px;overflow:hidden}
      .sbar-fill{height:100%;border-radius:99px;background:var(--green);transition:width 1s cubic-bezier(.22,1,.36,1)}
      .sbar-amt{font-family:var(--mono);font-size:12px;color:var(--text);min-width:52px;text-align:right;font-weight:500}

      /* Transactions */
      .tx{display:flex;align-items:center;gap:10px;padding:10px 0;
        border-bottom:1px solid var(--border);transition:all .12s}
      .tx:last-child{border-bottom:none}
      .tx:hover{padding-left:4px}
      .tx-pill{font-size:11px;font-weight:600;padding:3px 9px;border-radius:99px;
        background:var(--green-pale);color:var(--green2);border:1px solid var(--green-light);
        white-space:nowrap;flex-shrink:0}

      /* Mood history */
      .mood-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)}
      .mood-row:last-child{border-bottom:none}

      @media(max-width:680px){
        .stat-grid{grid-template-columns:1fr 1fr}
        .los-hdr{flex-direction:column}
        .los-inner{padding:20px 14px}
        .los-tabs{overflow-x:auto;max-width:100%}
        .los-tab{padding:8px 12px;font-size:12px}
      }
    `}</style>

    <div className="los-root">
      <div className="los-inner">

        {/* ── Header ── */}
        <div className="los-hdr" style={{animation:'fadeUp .4s ease'}}>
          <div className="hdr-left">
            <div className="hdr-tag">
              <div className="hdr-tag-dot"/>
              life-os · active
            </div>
            <div className="hdr-name">
              {user ? `Hey, ${user.username} 👋` : 'Life OS'}
            </div>
            <div className="hdr-date">{dateStr}</div>
          </div>
          <div className="hdr-right">
            <div className="hdr-time">{timeStr}</div>
            <div className="hdr-pct-pill">{completionPct}% done today</div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="los-tabs" style={{animation:'fadeUp .4s .04s ease both'}}>
          {tabs.map(t=>(
            <button key={t.id} className={`los-tab ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>
              <span className="tab-ic">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab==='overview' && (
          <div style={{animation:'fadeUp .3s ease'}}>

            {/* Stats */}
            <div className="stat-grid">
              {[
                {lbl:'Habits Today', val:`${habitsDone}/${lifeOS.habits.length}`, sub:`${completionPct}% complete`, color:'#10b981', delay:'0s'},
                {lbl:"Today's Mood", val:todayMood?`${MOOD_EMOJIS[todayMood.score]} ${todayMood.score}`:'—', sub:todayMood?todayMood.label:'not logged', color:'#8b5cf6', delay:'0.05s'},
                {lbl:'Spent Today', val:`₹${todaySpend}`, sub:`₹${totalSpend} total`, color:todaySpend>500?'#ef4444':'#f59e0b', delay:'0.1s'},
                {lbl:'Tracking', val:lifeOS.habits.length, sub:'active habits', color:'#3b82f6', delay:'0.15s'},
              ].map((s,i)=>(
                <div key={i} className="stat-card" style={{animationDelay:s.delay}}>
                  <div className="stat-card-accent" style={{background:s.color}}/>
                  <div className="stat-lbl">{s.lbl}</div>
                  <div className="stat-val" style={{color:s.color}}>{s.val}</div>
                  <div className="stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Completion */}
            <div className="card" style={{animationDelay:'.05s'}}>
              <div className="card-hdr">
                <div className="card-ttl"><div className="card-ttl-dot"/>Today's progress</div>
                <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--green2)',fontWeight:600}}>{completionPct}%</span>
              </div>
              <div className="card-body">
                <HBar pct={completionPct}/>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
                  <span style={{fontSize:12,color:'var(--text3)'}}>{habitsDone} done</span>
                  <span style={{fontSize:12,color:'var(--text3)'}}>{lifeOS.habits.length} total</span>
                </div>
              </div>
            </div>

            {/* Mood trend */}
            <div className="card" style={{animationDelay:'.08s'}}>
              <div className="card-hdr">
                <div className="card-ttl"><div className="card-ttl-dot"/>Mood trend · 14 days</div>
                {moodAvg && <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--text3)'}}>{moodAvg}/10 avg</span>}
              </div>
              <div className="card-body"><Sparkline moods={lifeOS.moods}/></div>
            </div>

            {/* AI Advisor */}
            <div className="ai-card" style={{animationDelay:'.11s'}}>
              <div className="ai-card-hdr">
                <div className="ai-tag"><div className="ai-tag-dot"/>Gemini Advisor</div>
                <button className="ai-run-btn" onClick={handleFetchAdvice} disabled={lifeOS.adviceLoading}>
                  {lifeOS.adviceLoading?'Analyzing…':adviceFetched?'↺ Refresh':'Run Analysis'}
                </button>
              </div>
              <div style={{padding:'18px 20px'}}>
                {lifeOS.adviceLoading && (
                  <div className="load-wrap">
                    <div className="load-d"/><div className="load-d"/><div className="load-d"/>
                    <span style={{fontSize:13,color:'var(--text3)',marginLeft:8}}>Analyzing your patterns…</span>
                  </div>
                )}
                {lifeOS.advice && !lifeOS.adviceLoading && (
                  <div style={{animation:'fadeUp .3s ease'}}>
                    <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:16,flexWrap:'wrap'}}>
                      <ScoreArc score={lifeOS.advice.overallScore}/>
                      <div>
                        <div style={{fontSize:11,fontWeight:600,letterSpacing:'.04em',textTransform:'uppercase',color:'var(--text3)',marginBottom:5}}>Burnout Risk</div>
                        <div style={{fontSize:14,fontWeight:800,letterSpacing:'.02em',
                          color:lifeOS.advice.burnoutRisk==='low'?'#059669':lifeOS.advice.burnoutRisk==='medium'?'#d97706':'#dc2626'}}>
                          {lifeOS.advice.burnoutRisk?.charAt(0).toUpperCase()+lifeOS.advice.burnoutRisk?.slice(1)} Risk
                        </div>
                        {lifeOS.advice.burnoutReason && <div style={{fontSize:12,color:'var(--text3)',marginTop:3,maxWidth:300,lineHeight:1.5}}>{lifeOS.advice.burnoutReason}</div>}
                      </div>
                    </div>
                    {lifeOS.advice.greeting && <p style={{fontSize:14,color:'var(--text)',lineHeight:1.65,marginBottom:10,fontWeight:500}}>{lifeOS.advice.greeting}</p>}
                    {lifeOS.advice.advice && <p style={{fontSize:13,color:'var(--text2)',lineHeight:1.7,marginBottom:14}}>{lifeOS.advice.advice}</p>}
                    {lifeOS.advice.insights?.length>0 && (
                      <div style={{marginTop:12}}>
                        {lifeOS.advice.insights.map((ins,i)=>(
                          <div key={i} className="insight">
                            <div style={{flex:1}}>
                              <div className="insight-type">{ins.type}</div>
                              <div className="insight-body"><strong>{ins.title}</strong> — {ins.body}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {lifeOS.advice.todaysPriorities?.length>0 && (
                      <div style={{marginTop:14}}>
                        <div style={{fontSize:11,fontWeight:700,letterSpacing:'.04em',textTransform:'uppercase',color:'var(--text3)',marginBottom:8}}>Today's Priorities</div>
                        <div>{lifeOS.advice.todaysPriorities.map((p,i)=><span key={i} className="pchip">#{i+1} {p}</span>)}</div>
                      </div>
                    )}
                    {lifeOS.advice.predictions && (
                      <div style={{marginTop:14,padding:'11px 14px',borderRadius:10,background:'white',border:'1px solid #a7f3d0'}}>
                        <span style={{fontSize:12,color:'var(--green2)'}}>
                          🔮 Tomorrow: <strong>{lifeOS.advice.predictions.productivityTomorrow}</strong> — {lifeOS.advice.predictions.reason}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {!lifeOS.advice && !lifeOS.adviceLoading && (
                  <p style={{fontSize:13,color:'var(--text3)',lineHeight:1.6}}>
                    Click <strong style={{color:'var(--green2)'}}>Run Analysis</strong> to get personalized insights from Gemini based on your habits, mood, and spending.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── HABITS ── */}
        {tab==='habits' && (
          <div style={{animation:'fadeUp .3s ease'}}>
            <div className="card">
              <div className="card-hdr">
                <div className="card-ttl"><div className="card-ttl-dot"/>Habit Tracker</div>
                <button className="pbtn outline" style={{fontSize:12,padding:'6px 14px'}}
                  onClick={()=>setShowHabitForm(p=>!p)}>
                  {showHabitForm?'✕ Cancel':'+ New Habit'}
                </button>
              </div>
              <div className="card-body">

                {/* Completion bar */}
                {lifeOS.habits.length>0 && (
                  <div style={{marginBottom:20}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
                      <span style={{fontSize:12,fontWeight:600,color:'var(--text2)'}}>Today's completion</span>
                      <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--green2)',fontWeight:600}}>{habitsDone}/{lifeOS.habits.length}</span>
                    </div>
                    <HBar pct={completionPct}/>
                  </div>
                )}

                {/* Add form */}
                {showHabitForm && (
                  <form onSubmit={handleCreateHabit} style={{marginBottom:20,padding:16,borderRadius:12,border:'1.5px solid var(--green-light)',background:'#f0fdf4',animation:'slideIn .2s ease'}}>
                    <div style={{display:'grid',gap:12}}>
                      <div className="fg">
                        <label className="fl">Habit Name</label>
                        <input className="fi" placeholder="e.g. Morning workout"
                          value={newHabit.name} onChange={e=>setNewHabit(p=>({...p,name:e.target.value}))} required/>
                      </div>
                      <div className="frow">
                        <div className="fg"><label className="fl">Category</label>
                          <select className="fi" value={newHabit.category} onChange={e=>setNewHabit(p=>({...p,category:e.target.value}))}>
                            {HABIT_CATS.map(c=><option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="fg"><label className="fl">Frequency</label>
                          <select className="fi" value={newHabit.frequency} onChange={e=>setNewHabit(p=>({...p,frequency:e.target.value}))}>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                          </select>
                        </div>
                      </div>
                      <div className="fg">
                        <label className="fl">Icon</label>
                        <div className="igrid">
                          {HABIT_ICONS.map(ic=>(
                            <button key={ic} type="button" className={`iopt ${newHabit.icon===ic?'sel':''}`}
                              onClick={()=>setNewHabit(p=>({...p,icon:ic}))}>{ic}</button>
                          ))}
                        </div>
                      </div>
                      <button type="submit" className="pbtn" style={{width:'fit-content'}}>Create Habit</button>
                    </div>
                  </form>
                )}

                {/* Habit list */}
                {lifeOS.habits.length===0 ? (
                  <div style={{textAlign:'center',padding:'32px 0',color:'var(--text3)',fontSize:14}}>
                    <div style={{fontSize:32,marginBottom:10}}>💪</div>
                    No habits yet. Add your first one!
                  </div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:4}}>
                    {lifeOS.habits.map((h,i)=>{
                      const done = h.completedDates?.includes(todayStr)
                      return (
                        <div key={h._id} className="habit-item">
                          <div className={`hchk ${done?'done':''}`} onClick={()=>lifeOS.handleToggleHabit(h._id)}>
                            {done && '✓'}
                          </div>
                          <span style={{fontSize:20,flexShrink:0}}>{h.icon}</span>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:14,fontWeight:600,textDecoration:done?'line-through':'none',opacity:done?.4:1,color:'var(--text)',transition:'opacity .2s'}}>{h.name}</div>
                            <div style={{fontSize:12,color:'var(--text3)',marginTop:2,textTransform:'capitalize'}}>{h.category} · {h.frequency}</div>
                          </div>
                          {h.currentStreak>0 && <span className="streak-badge">🔥 {h.currentStreak}d</span>}
                          <button className="xbtn" onClick={()=>lifeOS.handleDeleteHabit(h._id)}>✕</button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── MOOD ── */}
        {tab==='mood' && (
          <div style={{animation:'fadeUp .3s ease'}}>
            <div className="card">
              <div className="card-hdr">
                <div className="card-ttl"><div className="card-ttl-dot"/>Log Today's Mood</div>
                {todayMood && !moodLogged && (
                  <span style={{fontSize:12,color:'var(--text3)'}}>
                    Logged: {MOOD_EMOJIS[todayMood.score]} {todayMood.score}/10
                  </span>
                )}
              </div>
              <div className="card-body">
                <form onSubmit={handleLogMood} style={{display:'grid',gap:18}}>
                  <div>
                    <div className="fl" style={{marginBottom:10}}>
                      Overall Mood &nbsp;
                      <span style={{color:'var(--green2)',fontWeight:700,textTransform:'none',letterSpacing:0}}>
                        {MOOD_EMOJIS[moodForm.score]} {moodForm.score}/10
                      </span>
                    </div>
                    <input type="range" min={1} max={10} step={1} value={moodForm.score} className="sl"
                      style={{accentColor:'#10b981'}}
                      onChange={e=>setMoodForm(p=>({...p,score:+e.target.value}))}/>
                  </div>
                  <div className="frow">
                    <div style={{flex:1}}>
                      <div className="fl" style={{marginBottom:8}}>
                        Energy &nbsp;<span style={{color:'#f59e0b',textTransform:'none',letterSpacing:0}}>{moodForm.energy}/10</span>
                      </div>
                      <input type="range" min={1} max={10} step={1} value={moodForm.energy} className="sl"
                        style={{accentColor:'#f59e0b'}}
                        onChange={e=>setMoodForm(p=>({...p,energy:+e.target.value}))}/>
                    </div>
                    <div style={{flex:1}}>
                      <div className="fl" style={{marginBottom:8}}>
                        Stress &nbsp;<span style={{color:'#ef4444',textTransform:'none',letterSpacing:0}}>{moodForm.stress}/10</span>
                      </div>
                      <input type="range" min={1} max={10} step={1} value={moodForm.stress} className="sl"
                        style={{accentColor:'#ef4444'}}
                        onChange={e=>setMoodForm(p=>({...p,stress:+e.target.value}))}/>
                    </div>
                  </div>
                  <div className="fg">
                    <label className="fl">Note (optional)</label>
                    <input className="fi" placeholder="How are you feeling?"
                      value={moodForm.note} onChange={e=>setMoodForm(p=>({...p,note:e.target.value}))}/>
                  </div>
                  <button type="submit" className="pbtn" style={{width:'fit-content'}}>
                    {moodLogged?'✓ Updated':'Log Mood'}
                  </button>
                </form>
              </div>
            </div>

            <div className="card">
              <div className="card-hdr">
                <div className="card-ttl"><div className="card-ttl-dot"/>Mood History</div>
                {moodAvg && <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--text3)'}}>{moodAvg}/10 avg</span>}
              </div>
              <div className="card-body">
                <Sparkline moods={lifeOS.moods}/>
                <div style={{marginTop:18}}>
                  {lifeOS.moods.slice(0,10).map((m,i)=>(
                    <div key={i} className="mood-row">
                      <span style={{fontSize:22,flexShrink:0}}>{MOOD_EMOJIS[m.score]}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{m.date}</div>
                        {m.note && <div style={{fontSize:12,color:'var(--text3)',marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.note}</div>}
                      </div>
                      <div style={{textAlign:'right',flexShrink:0}}>
                        <div style={{fontFamily:'var(--mono)',fontSize:14,fontWeight:700,
                          color:m.score>=7?'#059669':m.score>=5?'#d97706':'#dc2626'}}>{m.score}/10</div>
                        <div style={{fontSize:11,color:'var(--text3)',marginTop:1}}>⚡{m.energy} 😤{m.stress}</div>
                      </div>
                    </div>
                  ))}
                  {lifeOS.moods.length===0 && (
                    <div style={{textAlign:'center',padding:'20px 0',color:'var(--text3)',fontSize:13}}>No mood history yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SPENDING ── */}
        {tab==='spending' && (
          <div style={{animation:'fadeUp .3s ease'}}>

            {/* Stats */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
              {[
                {lbl:'Spent Today', val:`₹${todaySpend}`, sub:'today only', color:'#f59e0b'},
                {lbl:'Total Tracked', val:`₹${totalSpend}`, sub:`${lifeOS.spendings.length} transactions`, color:'#3b82f6'},
              ].map((s,i)=>(
                <div key={i} className="stat-card" style={{animationDelay:`${i*.05}s`}}>
                  <div className="stat-card-accent" style={{background:s.color}}/>
                  <div className="stat-lbl">{s.lbl}</div>
                  <div className="stat-val" style={{color:s.color}}>{s.val}</div>
                  <div className="stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Category breakdown */}
            {Object.keys(spendByCat).length>0 && (
              <div className="card">
                <div className="card-hdr">
                  <div className="card-ttl"><div className="card-ttl-dot"/>By Category</div>
                  <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--green2)',fontWeight:600}}>₹{totalSpend}</span>
                </div>
                <div className="card-body">
                  {Object.entries(spendByCat).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>(
                    <div key={cat} className="sbar-row">
                      <div className="sbar-lbl">{cat}</div>
                      <div className="sbar-bg">
                        <div className="sbar-fill" style={{width:`${(amt/totalSpend)*100}%`}}/>
                      </div>
                      <div className="sbar-amt">₹{amt}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add expense */}
            <div className="card">
              <div className="card-hdr">
                <div className="card-ttl"><div className="card-ttl-dot"/>Add Expense</div>
              </div>
              <div className="card-body">
                <form onSubmit={handleAddSpend} style={{display:'grid',gap:12}}>
                  <div className="frow">
                    <div className="fg"><label className="fl">Amount ₹</label>
                      <input className="fi" type="number" placeholder="0" min="0"
                        value={spendForm.amount} onChange={e=>setSpendForm(p=>({...p,amount:e.target.value}))} required/>
                    </div>
                    <div className="fg"><label className="fl">Category</label>
                      <select className="fi" value={spendForm.category} onChange={e=>setSpendForm(p=>({...p,category:e.target.value}))}>
                        {SPEND_CATS.map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="fg"><label className="fl">Description</label>
                    <input className="fi" placeholder="What did you spend on?"
                      value={spendForm.description} onChange={e=>setSpendForm(p=>({...p,description:e.target.value}))}/>
                  </div>
                  <button type="submit" className="pbtn" style={{width:'fit-content'}}>Add Expense</button>
                </form>
              </div>
            </div>

            {/* Transactions */}
            <div className="card">
              <div className="card-hdr">
                <div className="card-ttl"><div className="card-ttl-dot"/>Transactions</div>
              </div>
              <div className="card-body">
                {lifeOS.spendings.length===0 ? (
                  <div style={{textAlign:'center',padding:'20px 0',color:'var(--text3)',fontSize:13}}>No transactions yet</div>
                ) : lifeOS.spendings.slice(0,15).map((s,i)=>(
                  <div key={i} className="tx">
                    <span className="tx-pill">{s.category}</span>
                    <span style={{flex:1,fontSize:13,color:'var(--text2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.description||'—'}</span>
                    <span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--text3)',marginRight:8,flexShrink:0}}>{s.date}</span>
                    <span style={{fontFamily:'var(--mono)',fontSize:13,fontWeight:700,color:'var(--text)',flexShrink:0}}>₹{s.amount}</span>
                    <button className="xbtn" onClick={()=>lifeOS.handleDeleteSpending(s._id)}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
    </>
  )
}