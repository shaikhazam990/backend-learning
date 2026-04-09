import React, { useEffect, useState, useRef } from 'react'
import { useLifeOS } from '../hooks/useLifeOS'
import { useSelector } from 'react-redux'

const todayISO = () => new Date().toISOString().split('T')[0]
const MOOD_EMOJIS = ['','😞','😔','😕','😐','🙂','😊','😄','😁','🤩','🥳']
const SPEND_CATS  = ['food','transport','entertainment','health','shopping','bills','education','other']
const HABIT_ICONS = ['✅','💪','📚','🏃','🧘','💧','🎯','⚡','🌱','🎨']
const HABIT_CATS  = ['health','work','learning','fitness','mindfulness','other']

function NoiseLayer() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')
    const W = c.width = 256, H = c.height = 256
    const img = ctx.createImageData(W, H)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255
      img.data[i] = img.data[i+1] = img.data[i+2] = v
      img.data[i+3] = 16
    }
    ctx.putImageData(img, 0, 0)
  }, [])
  return <canvas ref={ref} style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:1, opacity:0.4, imageRendering:'pixelated' }} />
}

function ScoreArc({ score }) {
  const r = 36, circ = 2 * Math.PI * r
  const col = score >= 75 ? '#4fffb0' : score >= 50 ? '#ffe066' : '#ff6b6b'
  return (
    <div style={{ position:'relative', width:88, height:88 }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5"/>
        <circle cx="44" cy="44" r={r} fill="none" stroke={col} strokeWidth="5"
          strokeDasharray={`${(score/100)*circ} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 44 44)"
          style={{transition:'stroke-dasharray 1.4s cubic-bezier(0.22,1,0.36,1)'}}/>
        <text x="44" y="49" textAnchor="middle" fill={col} fontSize="18" fontWeight="900" fontFamily="'Space Mono',monospace">{score}</text>
      </svg>
    </div>
  )
}

function Sparkline({ moods }) {
  const data = [...moods].sort((a,b)=>a.date.localeCompare(b.date)).slice(-14)
  if (!data.length) return <div style={{color:'rgba(255,255,255,0.15)',fontSize:12,padding:'16px 0',textAlign:'center',fontFamily:'monospace',letterSpacing:'.08em'}}>no data yet</div>
  const W=280, H=48, pad=4
  const xs = data.map((_,i)=>pad + (i/(data.length-1||1))*(W-2*pad))
  const ys = data.map(d=>H-pad-(((d.score-1)/9)*(H-2*pad)))
  const path = data.map((d,i)=>`${i===0?'M':'L'}${xs[i]},${ys[i]}`).join(' ')
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:'block',height:48}}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4fffb0" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#4fffb0" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${path} L${xs[xs.length-1]},${H} L${xs[0]},${H} Z`} fill="url(#sg)"/>
      <path d={path} fill="none" stroke="#4fffb0" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
      {data.map((d,i)=><circle key={i} cx={xs[i]} cy={ys[i]} r="2.5" fill="#4fffb0"/>)}
    </svg>
  )
}

function HBar({ pct, color='#4fffb0' }) {
  return (
    <div style={{height:4,background:'rgba(255,255,255,0.06)',borderRadius:2,overflow:'hidden'}}>
      <div style={{height:'100%',width:`${pct}%`,background:color,borderRadius:2,transition:'width 0.9s cubic-bezier(0.22,1,0.36,1)'}}/>
    </div>
  )
}

function Ticker({ text }) {
  return (
    <div style={{overflow:'hidden',whiteSpace:'nowrap'}}>
      <span style={{display:'inline-block',animation:'ticker 20s linear infinite',fontSize:10,letterSpacing:'.18em',color:'rgba(79,255,176,0.25)',textTransform:'uppercase',fontWeight:700,fontFamily:"'Space Mono',monospace"}}>
        {text} &nbsp;&nbsp;&nbsp;&nbsp; {text} &nbsp;&nbsp;&nbsp;&nbsp; {text}
      </span>
    </div>
  )
}

export default function LifeOS() {
  const lifeOS = useLifeOS()
  const user = useSelector(s => s.auth.user)
  const [tab, setTab] = useState('overview')
  const [newHabit, setNewHabit] = useState({ name:'', icon:'', category:'health', frequency:'daily' })
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

  const handleFetchAdvice = async () => { setAdviceFetched(true); await lifeOS.fetchAdvice() }
  const handleLogMood = async (e) => { e.preventDefault(); await lifeOS.handleLogMood({...moodForm,score:+moodForm.score,energy:+moodForm.energy,stress:+moodForm.stress}); setMoodLogged(true) }
  const handleAddSpend = async (e) => { e.preventDefault(); if(!spendForm.amount)return; await lifeOS.handleAddSpending({...spendForm,amount:+spendForm.amount}); setSpendForm({amount:'',category:'food',description:''}) }
  const handleCreateHabit = async (e) => { e.preventDefault(); if(!newHabit.name.trim())return; await lifeOS.handleCreateHabit(newHabit); setNewHabit({name:'',icon:'',category:'health',frequency:'daily'}); setShowHabitForm(false) }

  const timeStr = now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})
  const dateStr = now.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}).toUpperCase()

  return (
    <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      :root{
        --ink:#060d09;
        --s1:#0a1410;
        --s2:#0e1c14;
        --sage:#4fffb0;
        --sage2:#2de08e;
        --teal:#00e5cc;
        --amber:#ffe066;
        --red:#ff6b6b;
        --line:rgba(79,255,176,0.09);
        --line2:rgba(79,255,176,0.16);
        --dim:rgba(79,255,176,0.1);
        --dimb:rgba(79,255,176,0.05);
        --text:#d4ffe6;
        --muted:rgba(212,255,230,0.38);
        --muted2:rgba(212,255,230,0.16);
        --mono:'Space Mono',monospace;
        --sans:'Space Grotesk',sans-serif;
      }
      html,body{background:var(--ink);color:var(--text);font-family:var(--sans)}

      @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-33.333%)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      @keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
      @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
      @keyframes scan{0%{transform:translateY(-100%)}100%{transform:translateY(200vh)}}
      @keyframes glow{0%,100%{opacity:0.5}50%{opacity:1}}

      .los-root{min-height:100vh;background:var(--ink);position:relative;overflow-x:hidden}

      .bg-grid{
        position:fixed;inset:0;z-index:0;pointer-events:none;
        background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);
        background-size:44px 44px;
        mask-image:radial-gradient(ellipse 90% 90% at 50% 40%,black 30%,transparent 100%);
      }
      .scan-line{position:fixed;left:0;right:0;height:120px;z-index:2;pointer-events:none;
        background:linear-gradient(transparent,rgba(79,255,176,0.025),transparent);
        animation:scan 12s linear infinite}

      .los-inner{max-width:940px;margin:0 auto;padding:30px 24px;position:relative;z-index:10}

      /* Header */
      .los-hdr{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:20px;
        border-bottom:1px solid var(--line2);padding-bottom:22px;margin-bottom:0}
      .hdr-left{display:flex;flex-direction:column;gap:4px}
      .hdr-sys{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.2em;
        color:var(--sage);text-transform:uppercase;display:flex;align-items:center;gap:7px}
      .sys-dot{width:5px;height:5px;border-radius:50%;background:var(--sage);animation:glow 2s ease-in-out infinite}
      .hdr-title{font-family:var(--sans);font-size:20px;font-weight:700;letter-spacing:-.03em;color:var(--text)}
      .hdr-clock{font-family:var(--mono);font-size:26px;font-weight:700;letter-spacing:.04em;
        color:var(--sage);text-align:center;text-shadow:0 0 24px rgba(79,255,176,0.35)}
      .hdr-right{display:flex;flex-direction:column;gap:4px;align-items:flex-end}
      .hdr-date{font-family:var(--mono);font-size:10px;letter-spacing:.12em;color:var(--muted)}
      .hdr-pct{font-family:var(--mono);font-size:10px;color:var(--sage);letter-spacing:.06em;opacity:0.7}

      /* Ticker bar */
      .ticker-bar{border-top:1px solid var(--line);border-bottom:1px solid var(--line);
        padding:7px 0;margin:0 0 26px}

      /* Tabs */
      .los-tabs{display:flex;gap:0;margin-bottom:28px;width:fit-content;
        border:1px solid var(--line2);border-radius:10px;overflow:hidden;background:var(--s1)}
      .los-tab{padding:9px 20px;border:none;background:transparent;
        font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.12em;
        text-transform:uppercase;color:var(--muted);cursor:pointer;transition:all 0.16s;
        border-right:1px solid var(--line);position:relative}
      .los-tab:last-child{border-right:none}
      .los-tab.active{color:var(--sage);background:var(--dim)}
      .los-tab.active::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--sage)}
      .los-tab:hover:not(.active){color:var(--text);background:var(--dimb)}

      /* Stats */
      .stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;
        background:var(--line);border:1px solid var(--line2);border-radius:12px;
        overflow:hidden;margin-bottom:16px}
      .stat-cell{background:var(--s1);padding:18px 16px;position:relative;transition:background 0.15s}
      .stat-cell:hover{background:var(--s2)}
      .stat-cell::before{content:'';position:absolute;top:0;left:0;width:2px;height:100%;background:var(--sage);opacity:0.35}
      .stat-lbl{font-family:var(--mono);font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted2);margin-bottom:10px}
      .stat-val{font-family:var(--mono);font-size:24px;font-weight:700;letter-spacing:-.02em;color:var(--sage);line-height:1}
      .stat-sub{font-size:11px;color:var(--muted);margin-top:6px;font-weight:400}

      /* Panel */
      .panel{background:var(--s1);border:1px solid var(--line2);border-radius:12px;
        overflow:hidden;margin-bottom:14px;animation:fadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both}
      .panel-hdr{display:flex;align-items:center;justify-content:space-between;
        padding:13px 18px;border-bottom:1px solid var(--line);background:var(--dimb)}
      .panel-ttl{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.14em;
        text-transform:uppercase;color:var(--sage);display:flex;align-items:center;gap:8px}
      .panel-dot{width:5px;height:5px;border-radius:50%;background:var(--sage);flex-shrink:0;animation:glow 2.5s ease infinite}
      .panel-body{padding:18px}

      /* AI panel */
      .ai-panel{background:linear-gradient(135deg,#08120e,#0c1c14);
        border:1px solid rgba(79,255,176,0.18);border-radius:12px;
        margin-bottom:14px;overflow:hidden;animation:fadeUp 0.4s ease both}
      .ai-hdr{display:flex;align-items:center;justify-content:space-between;
        padding:13px 18px;border-bottom:1px solid rgba(79,255,176,0.1)}
      .ai-badge{font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:.2em;
        text-transform:uppercase;color:var(--sage);background:rgba(79,255,176,0.08);
        border:1px solid rgba(79,255,176,0.18);padding:4px 10px;border-radius:4px;
        display:flex;align-items:center;gap:6px}
      .ai-dot{width:4px;height:4px;border-radius:50%;background:var(--sage);animation:glow 1.5s ease-in-out infinite}
      .ai-btn{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.1em;
        text-transform:uppercase;padding:8px 16px;border-radius:6px;cursor:pointer;
        border:1px solid var(--sage);background:transparent;color:var(--sage);transition:all 0.15s}
      .ai-btn:hover:not(:disabled){background:var(--sage);color:var(--ink)}
      .ai-btn:disabled{opacity:0.3;cursor:not-allowed}

      .load-row{display:flex;gap:5px;padding:8px 0;align-items:center}
      .ld{width:4px;height:4px;border-radius:50%;background:var(--sage);animation:blink 1.2s ease-in-out infinite}
      .ld:nth-child(2){animation-delay:.2s}.ld:nth-child(3){animation-delay:.4s}

      /* Insight */
      .ins{display:flex;gap:10px;padding:10px 12px;border-left:2px solid transparent;
        margin-bottom:5px;border-radius:0 6px 6px 0;background:rgba(79,255,176,0.03);transition:all 0.15s}
      .ins:hover{background:rgba(79,255,176,0.06);border-left-color:var(--sage)}
      .ins-type{font-family:var(--mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--sage);margin-bottom:2px}
      .ins-body{font-size:12px;color:rgba(212,255,230,0.55);line-height:1.5}
      .ins-body strong{color:var(--text)}

      /* Habits */
      .habit{display:flex;align-items:center;gap:11px;padding:11px 12px;border-radius:8px;
        border:1px solid transparent;transition:all 0.15s}
      .habit:hover{border-color:var(--line);background:var(--dimb)}
      .hchk{width:22px;height:22px;border-radius:5px;border:1.5px solid rgba(79,255,176,0.22);
        cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;
        flex-shrink:0;font-size:11px;color:var(--sage)}
      .hchk.done{background:rgba(79,255,176,0.12);border-color:var(--sage)}
      .hchk:hover{border-color:var(--sage)}
      .streak{font-family:var(--mono);font-size:10px;padding:2px 7px;border-radius:3px;
        background:rgba(255,224,102,0.08);border:1px solid rgba(255,224,102,0.18);color:var(--amber)}
      .xbtn{background:none;border:none;color:var(--muted2);cursor:pointer;padding:3px 6px;
        border-radius:4px;transition:all 0.12s;font-size:11px;font-family:var(--mono)}
      .xbtn:hover{color:var(--red);background:rgba(255,107,107,0.08)}

      /* Forms */
      .fg{display:flex;flex-direction:column;gap:5px}
      .fl{font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--muted2)}
      .fi{background:rgba(0,0,0,0.35);border:1px solid var(--line2);border-radius:7px;
        padding:10px 12px;color:var(--text);font-size:13px;font-family:var(--sans);outline:none;transition:border-color 0.15s}
      .fi:focus{border-color:rgba(79,255,176,0.3);background:rgba(79,255,176,0.03)}
      .fi::placeholder{color:var(--muted2)}
      select.fi option{background:#0a1410}
      .frow{display:flex;gap:10px;flex-wrap:wrap}
      .frow>.fg{flex:1;min-width:110px}

      .sl{width:100%;height:3px;-webkit-appearance:none;background:rgba(255,255,255,0.07);border-radius:3px;outline:none;cursor:pointer}
      .sl::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;background:var(--sage);cursor:pointer;transition:transform 0.12s;box-shadow:0 0 8px rgba(79,255,176,0.35)}
      .sl::-webkit-slider-thumb:hover{transform:scale(1.3)}

      .pbtn{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
        padding:9px 18px;border-radius:6px;border:1px solid var(--sage);background:var(--sage);
        color:var(--ink);cursor:pointer;transition:all 0.15s}
      .pbtn:hover{background:var(--sage2)}
      .pbtn.ghost{background:transparent;color:var(--sage)}
      .pbtn.ghost:hover{background:var(--dim)}
      .pbtn:disabled{opacity:0.3;cursor:not-allowed}

      .igrid{display:flex;flex-wrap:wrap;gap:6px}
      .iopt{width:33px;height:33px;border-radius:6px;border:1px solid var(--line2);background:transparent;
        cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all 0.12s}
      .iopt.sel{border-color:var(--sage);background:var(--dim)}
      .iopt:hover{border-color:rgba(79,255,176,0.3);transform:scale(1.1)}

      .sbar-row{display:flex;align-items:center;gap:10px;margin-bottom:9px}
      .sbar-lbl{font-family:var(--mono);font-size:9px;letter-spacing:.06em;color:var(--muted);min-width:80px;text-transform:capitalize}
      .sbar-bg{flex:1;height:3px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden}
      .sbar-fill{height:100%;border-radius:2px;background:var(--sage);transition:width 1s cubic-bezier(0.22,1,0.36,1)}
      .sbar-amt{font-family:var(--mono);font-size:10px;color:var(--text);min-width:52px;text-align:right}

      .tx{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(79,255,176,0.05);transition:padding-left 0.12s}
      .tx:last-child{border-bottom:none}
      .tx:hover{padding-left:3px}
      .tx-tag{font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;
        padding:2px 7px;border-radius:3px;background:var(--dimb);border:1px solid var(--line);color:var(--sage)}

      .pchip{font-family:var(--mono);font-size:10px;letter-spacing:.04em;
        padding:4px 11px;border-radius:4px;border:1px solid rgba(0,229,204,0.18);
        background:rgba(0,229,204,0.05);color:rgba(0,229,204,0.65);display:inline-block;margin:2px 2px}

      @media(max-width:680px){
        .stat-row{grid-template-columns:1fr 1fr}
        .los-hdr{grid-template-columns:1fr 1fr;grid-template-rows:auto auto}
        .hdr-clock{grid-column:1/-1;font-size:20px}
        .los-inner{padding:18px 14px}
        .los-tabs{overflow-x:auto;max-width:100%}
        .los-tab{padding:8px 13px}
      }
    `}</style>

    <div className="los-root">
      <div className="bg-grid"/>
      <NoiseLayer/>
      <div className="scan-line"/>

      <div className="los-inner">

        {/* Header */}
        <div className="los-hdr" style={{animation:'fadeUp 0.4s ease'}}>
          <div className="hdr-left">
            <div className="hdr-sys"><div className="sys-dot"/>system / life-os</div>
            <div className="hdr-title">{user ? user.username : 'dashboard'}</div>
          </div>
          <div className="hdr-clock">{timeStr}</div>
          <div className="hdr-right">
            <div className="hdr-date">{dateStr}</div>
            <div className="hdr-pct">{completionPct}% complete</div>
          </div>
        </div>

        {/* Ticker */}
        <div className="ticker-bar" style={{margin:'0 0 26px'}}>
          <Ticker text={`habits ${habitsDone}/${lifeOS.habits.length} · mood ${todayMood ? todayMood.score+'/10' : '—'} · spent ₹${todaySpend} today · life-os active · streaks running`}/>
        </div>

        {/* Tabs */}
        <div className="los-tabs" style={{animation:'fadeUp 0.4s 0.04s ease both'}}>
          {[['overview','00 overview'],['habits','01 habits'],['mood','02 mood'],['spending','03 spending']].map(([id,label])=>(
            <button key={id} className={`los-tab ${tab===id?'active':''}`} onClick={()=>setTab(id)}>{label}</button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab==='overview' && (
          <div style={{animation:'fadeUp 0.3s ease'}}>

            <div className="stat-row">
              {[
                {lbl:'habits/today', val:`${habitsDone}/${lifeOS.habits.length}`, sub:`${completionPct}% done`},
                {lbl:'mood/today', val:todayMood?`${MOOD_EMOJIS[todayMood.score]} ${todayMood.score}`:'—', sub:todayMood?todayMood.label:'not logged'},
                {lbl:'spent/today', val:`₹${todaySpend}`, sub:`₹${totalSpend} period`},
                {lbl:'tracking', val:lifeOS.habits.length, sub:'active habits'},
              ].map((s,i)=>(
                <div key={i} className="stat-cell">
                  <div className="stat-lbl">{s.lbl}</div>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>

            <div className="panel" style={{animationDelay:'0.04s'}}>
              <div className="panel-hdr">
                <div className="panel-ttl"><div className="panel-dot"/>completion today</div>
                <span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--sage)'}}>{completionPct}%</span>
              </div>
              <div className="panel-body">
                <HBar pct={completionPct}/>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
                  <span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--muted)',letterSpacing:'.1em'}}>0 habits</span>
                  <span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--muted)',letterSpacing:'.1em'}}>{lifeOS.habits.length} total</span>
                </div>
              </div>
            </div>

            <div className="panel" style={{animationDelay:'0.07s'}}>
              <div className="panel-hdr">
                <div className="panel-ttl"><div className="panel-dot"/>mood / 14-day trend</div>
                <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)'}}>
                  avg {lifeOS.moods.length ? (lifeOS.moods.slice(0,14).reduce((a,m)=>a+m.score,0)/Math.min(lifeOS.moods.length,14)).toFixed(1) : '—'}/10
                </span>
              </div>
              <div className="panel-body"><Sparkline moods={lifeOS.moods}/></div>
            </div>

            <div className="ai-panel" style={{animationDelay:'0.1s'}}>
              <div className="ai-hdr">
                <div className="ai-badge"><div className="ai-dot"/>gemini advisor</div>
                <button className="ai-btn" onClick={handleFetchAdvice} disabled={lifeOS.adviceLoading}>
                  {lifeOS.adviceLoading?'processing…':adviceFetched?'↺ refresh':'run analysis'}
                </button>
              </div>
              <div style={{padding:18}}>
                {lifeOS.adviceLoading && (
                  <div className="load-row">
                    <div className="ld"/><div className="ld"/><div className="ld"/>
                    <span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--muted)',marginLeft:8,letterSpacing:'.06em'}}>analyzing patterns…</span>
                  </div>
                )}
                {lifeOS.advice && !lifeOS.adviceLoading && (
                  <div style={{animation:'fadeUp 0.3s ease'}}>
                    <div style={{display:'flex',gap:14,alignItems:'center',marginBottom:14,flexWrap:'wrap'}}>
                      <ScoreArc score={lifeOS.advice.overallScore}/>
                      <div>
                        <div style={{fontFamily:'var(--mono)',fontSize:9,letterSpacing:'.15em',color:'var(--muted)',textTransform:'uppercase',marginBottom:5}}>burnout risk</div>
                        <div style={{fontFamily:'var(--mono)',fontSize:12,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',
                          color:lifeOS.advice.burnoutRisk==='low'?'#4fffb0':lifeOS.advice.burnoutRisk==='medium'?'#ffe066':'#ff6b6b'}}>
                          {lifeOS.advice.burnoutRisk}
                        </div>
                        {lifeOS.advice.burnoutReason && <div style={{fontSize:12,color:'var(--muted)',marginTop:3,maxWidth:280,lineHeight:1.4}}>{lifeOS.advice.burnoutReason}</div>}
                      </div>
                    </div>
                    {lifeOS.advice.greeting && <p style={{fontSize:14,color:'var(--text)',lineHeight:1.6,marginBottom:10}}>{lifeOS.advice.greeting}</p>}
                    {lifeOS.advice.advice && <p style={{fontSize:13,color:'rgba(212,255,230,0.5)',lineHeight:1.65,marginBottom:12}}>{lifeOS.advice.advice}</p>}
                    {lifeOS.advice.insights?.length>0 && (
                      <div style={{marginTop:10}}>
                        {lifeOS.advice.insights.map((ins,i)=>(
                          <div key={i} className="ins">
                            <div style={{flex:1}}>
                              <div className="ins-type">{ins.type}</div>
                              <div className="ins-body"><strong>{ins.title}</strong> — {ins.body}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {lifeOS.advice.todaysPriorities?.length>0 && (
                      <div style={{marginTop:12}}>
                        <div style={{fontFamily:'var(--mono)',fontSize:9,letterSpacing:'.15em',color:'var(--muted)',textTransform:'uppercase',marginBottom:7}}>today's priorities</div>
                        <div>{lifeOS.advice.todaysPriorities.map((p,i)=><span key={i} className="pchip">/{i+1} {p}</span>)}</div>
                      </div>
                    )}
                    {lifeOS.advice.predictions && (
                      <div style={{marginTop:12,padding:'9px 12px',borderRadius:5,background:'rgba(0,229,204,0.04)',border:'1px solid rgba(0,229,204,0.1)'}}>
                        <span style={{fontFamily:'var(--mono)',fontSize:10,color:'rgba(0,229,204,0.55)',letterSpacing:'.04em'}}>
                          predict → {lifeOS.advice.predictions.productivityTomorrow} · {lifeOS.advice.predictions.reason}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {!lifeOS.advice && !lifeOS.adviceLoading && (
                  <p style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--muted)',letterSpacing:'.06em'}}>→ run analysis to get ai insights on your patterns</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── HABITS ── */}
        {tab==='habits' && (
          <div style={{animation:'fadeUp 0.3s ease'}}>
            <div className="panel">
              <div className="panel-hdr">
                <div className="panel-ttl"><div className="panel-dot"/>habit tracker</div>
                <button className="pbtn ghost" style={{fontSize:10,padding:'6px 13px'}} onClick={()=>setShowHabitForm(p=>!p)}>
                  {showHabitForm?'cancel':'+ new habit'}
                </button>
              </div>
              <div className="panel-body">
                {showHabitForm && (
                  <form onSubmit={handleCreateHabit} style={{marginBottom:18,padding:14,borderRadius:8,border:'1px solid var(--line2)',background:'rgba(0,0,0,0.2)',animation:'slideIn 0.2s ease'}}>
                    <div style={{display:'grid',gap:11}}>
                      <div className="fg">
                        <label className="fl">habit name</label>
                        <input className="fi" placeholder="e.g. morning workout" value={newHabit.name} onChange={e=>setNewHabit(p=>({...p,name:e.target.value}))} required/>
                      </div>
                      <div className="frow">
                        <div className="fg"><label className="fl">category</label>
                          <select className="fi" value={newHabit.category} onChange={e=>setNewHabit(p=>({...p,category:e.target.value}))}>
                            {HABIT_CATS.map(c=><option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="fg"><label className="fl">frequency</label>
                          <select className="fi" value={newHabit.frequency} onChange={e=>setNewHabit(p=>({...p,frequency:e.target.value}))}>
                            <option value="daily">daily</option><option value="weekly">weekly</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <div className="fl" style={{marginBottom:7}}>icon</div>
                        <div className="igrid">{HABIT_ICONS.map(ic=><button key={ic} type="button" className={`iopt ${newHabit.icon===ic?'sel':''}`} onClick={()=>setNewHabit(p=>({...p,icon:ic}))}>{ic}</button>)}</div>
                      </div>
                      <button type="submit" className="pbtn" style={{width:'fit-content'}}>create habit</button>
                    </div>
                  </form>
                )}
                {lifeOS.habits.length===0 ? (
                  <div style={{textAlign:'center',padding:'28px 0',fontFamily:'var(--mono)',fontSize:11,color:'var(--muted)',letterSpacing:'.1em'}}>no habits tracked yet</div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:3}}>
                    {lifeOS.habits.map((h,i)=>{
                      const done = h.completedDates?.includes(todayStr)
                      return (
                        <div key={h._id} className="habit">
                          <div className={`hchk ${done?'done':''}`} onClick={()=>lifeOS.handleToggleHabit(h._id)}>{done&&'✓'}</div>
                          <span style={{fontSize:17,flexShrink:0}}>{h.icon}</span>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:14,fontWeight:500,textDecoration:done?'line-through':'none',opacity:done?0.35:1,transition:'opacity 0.2s'}}>{h.name}</div>
                            <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--muted)',marginTop:2,letterSpacing:'.06em'}}>{h.category} · {h.frequency}</div>
                          </div>
                          {h.currentStreak>0 && <div className="streak">×{h.currentStreak}</div>}
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
          <div style={{animation:'fadeUp 0.3s ease'}}>
            <div className="panel">
              <div className="panel-hdr">
                <div className="panel-ttl"><div className="panel-dot"/>log mood</div>
                {todayMood && <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)'}}>{MOOD_EMOJIS[todayMood.score]} {todayMood.score}/10 logged</span>}
              </div>
              <div className="panel-body">
                <form onSubmit={handleLogMood} style={{display:'grid',gap:16}}>
                  <div>
                    <div className="fl" style={{marginBottom:10}}>mood — <span style={{color:'var(--sage)'}}>{MOOD_EMOJIS[moodForm.score]} {moodForm.score}/10</span></div>
                    <input type="range" min={1} max={10} step={1} value={moodForm.score} className="sl" style={{accentColor:'#4fffb0'}} onChange={e=>setMoodForm(p=>({...p,score:+e.target.value}))}/>
                  </div>
                  <div className="frow">
                    <div style={{flex:1}}>
                      <div className="fl" style={{marginBottom:8}}>energy — <span style={{color:'var(--amber)'}}>{moodForm.energy}/10</span></div>
                      <input type="range" min={1} max={10} step={1} value={moodForm.energy} className="sl" style={{accentColor:'#ffe066'}} onChange={e=>setMoodForm(p=>({...p,energy:+e.target.value}))}/>
                    </div>
                    <div style={{flex:1}}>
                      <div className="fl" style={{marginBottom:8}}>stress — <span style={{color:'var(--red)'}}>{moodForm.stress}/10</span></div>
                      <input type="range" min={1} max={10} step={1} value={moodForm.stress} className="sl" style={{accentColor:'#ff6b6b'}} onChange={e=>setMoodForm(p=>({...p,stress:+e.target.value}))}/>
                    </div>
                  </div>
                  <div className="fg">
                    <label className="fl">note (optional)</label>
                    <input className="fi" placeholder="how are you feeling?" value={moodForm.note} onChange={e=>setMoodForm(p=>({...p,note:e.target.value}))}/>
                  </div>
                  <button type="submit" className="pbtn" style={{width:'fit-content'}}>{moodLogged?'✓ updated':'log mood'}</button>
                </form>
              </div>
            </div>
            <div className="panel">
              <div className="panel-hdr"><div className="panel-ttl"><div className="panel-dot"/>mood history</div></div>
              <div className="panel-body">
                <Sparkline moods={lifeOS.moods}/>
                <div style={{marginTop:16}}>
                  {lifeOS.moods.slice(0,10).map((m,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 0',borderBottom:'1px solid rgba(79,255,176,0.05)'}}>
                      <span style={{fontSize:20,flexShrink:0}}>{MOOD_EMOJIS[m.score]}</span>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',letterSpacing:'.06em'}}>{m.date}</div>
                        {m.note && <div style={{fontSize:12,color:'rgba(212,255,230,0.4)',marginTop:2}}>{m.note}</div>}
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontFamily:'var(--mono)',fontSize:13,fontWeight:700,color:m.score>=7?'#4fffb0':m.score>=5?'#ffe066':'#ff6b6b'}}>{m.score}/10</div>
                        <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--muted)',marginTop:1}}>e:{m.energy} s:{m.stress}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SPENDING ── */}
        {tab==='spending' && (
          <div style={{animation:'fadeUp 0.3s ease'}}>
            <div className="panel">
              <div className="panel-hdr"><div className="panel-ttl"><div className="panel-dot"/>add expense</div></div>
              <div className="panel-body">
                <form onSubmit={handleAddSpend} style={{display:'grid',gap:11}}>
                  <div className="frow">
                    <div className="fg"><label className="fl">amount ₹</label>
                      <input className="fi" type="number" placeholder="0" value={spendForm.amount} onChange={e=>setSpendForm(p=>({...p,amount:e.target.value}))} required/>
                    </div>
                    <div className="fg"><label className="fl">category</label>
                      <select className="fi" value={spendForm.category} onChange={e=>setSpendForm(p=>({...p,category:e.target.value}))}>
                        {SPEND_CATS.map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="fg"><label className="fl">description</label>
                    <input className="fi" placeholder="what did you spend on?" value={spendForm.description} onChange={e=>setSpendForm(p=>({...p,description:e.target.value}))}/>
                  </div>
                  <button type="submit" className="pbtn" style={{width:'fit-content'}}>add expense</button>
                </form>
              </div>
            </div>
            {Object.keys(spendByCat).length>0 && (
              <div className="panel">
                <div className="panel-hdr">
                  <div className="panel-ttl"><div className="panel-dot"/>by category</div>
                  <span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--sage)'}}>₹{totalSpend}</span>
                </div>
                <div className="panel-body">
                  {Object.entries(spendByCat).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>(
                    <div key={cat} className="sbar-row">
                      <div className="sbar-lbl">{cat}</div>
                      <div className="sbar-bg"><div className="sbar-fill" style={{width:`${(amt/totalSpend)*100}%`}}/></div>
                      <div className="sbar-amt">₹{amt}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="panel">
              <div className="panel-hdr"><div className="panel-ttl"><div className="panel-dot"/>transactions</div></div>
              <div className="panel-body">
                {lifeOS.spendings.length===0 ? (
                  <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',padding:'12px 0',letterSpacing:'.1em'}}>no transactions yet</div>
                ) : lifeOS.spendings.slice(0,15).map((s,i)=>(
                  <div key={i} className="tx">
                    <span className="tx-tag">{s.category}</span>
                    <span style={{flex:1,fontSize:12,color:'var(--muted)'}}>{s.description||'—'}</span>
                    <span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--muted2)',marginRight:8}}>{s.date}</span>
                    <span style={{fontFamily:'var(--mono)',fontSize:12,fontWeight:700}}>₹{s.amount}</span>
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