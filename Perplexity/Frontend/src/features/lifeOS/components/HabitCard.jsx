import React, { useState } from 'react'
import { useLifeOS } from '../hooks/useLifeOS'

const todayISO = () => new Date().toISOString().split('T')[0]

const HABIT_ICONS = ['✅','💪','📚','🏃','🧘','💧','🎯','⚡','🌱','🎨']
const HABIT_CATS  = ['health','work','learning','fitness','mindfulness','other']

export default function HabitCard() {
  const { habits, handleCreateHabit, handleToggleHabit, handleDeleteHabit } = useLifeOS()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', icon:'💪', category:'health', frequency:'daily' })
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const todayStr = todayISO()

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSubmitting(true)
    try {
      await handleCreateHabit(form)
      setForm({ name:'', icon:'💪', category:'health', frequency:'daily' })
      setShowForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async (id) => {
    setDeletingId(id)
    try { await handleDeleteHabit(id) }
    finally { setDeletingId(null) }
  }

  const completedToday = habits.filter(h => h.completedDates?.includes(todayStr)).length
  const pct = habits.length ? Math.round((completedToday / habits.length) * 100) : 0

  return (
    <>
      <style>{`
        .hc-root { font-family: 'Space Grotesk', 'Inter', sans-serif; }
        .hc-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .hc-title { font-size:13px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:rgba(212,255,230,0.5); display:flex; align-items:center; gap:8px; }
        .hc-title-dot { width:5px; height:5px; border-radius:50%; background:#4fffb0; animation:hcGlow 2s ease-in-out infinite; }
        @keyframes hcGlow { 0%,100%{opacity:0.5} 50%{opacity:1} }
        .hc-add-btn { font-family:inherit; font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:7px 14px; border-radius:6px; border:1px solid rgba(79,255,176,0.25); background:transparent; color:#4fffb0; cursor:pointer; transition:all .15s; }
        .hc-add-btn:hover { background:rgba(79,255,176,0.1); }
        .hc-add-btn.cancel { border-color:rgba(255,255,255,0.12); color:rgba(212,255,230,0.4); }
        .hc-add-btn.cancel:hover { background:rgba(255,255,255,0.04); color:rgba(212,255,230,0.7); }

        /* Progress */
        .hc-progress { margin-bottom:18px; }
        .hc-progress-row { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:7px; }
        .hc-progress-label { font-size:11px; color:rgba(212,255,230,0.35); letter-spacing:.06em; }
        .hc-progress-val { font-family:'Space Mono',monospace; font-size:12px; color:#4fffb0; font-weight:700; }
        .hc-bar-bg { height:3px; background:rgba(255,255,255,0.06); border-radius:2px; overflow:hidden; }
        .hc-bar-fill { height:100%; background:#4fffb0; border-radius:2px; transition:width .9s cubic-bezier(.22,1,.36,1); }

        /* Form */
        .hc-form { background:rgba(0,0,0,0.25); border:1px solid rgba(79,255,176,0.1); border-radius:10px; padding:14px; margin-bottom:14px; animation:hcSlide .2s ease; }
        @keyframes hcSlide { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
        .hc-form-grid { display:grid; gap:10px; }
        .hc-fg { display:flex; flex-direction:column; gap:5px; }
        .hc-fl { font-size:9px; font-weight:700; letter-spacing:.15em; text-transform:uppercase; color:rgba(212,255,230,0.3); }
        .hc-fi { background:rgba(0,0,0,0.3); border:1px solid rgba(79,255,176,0.1); border-radius:7px; padding:9px 11px; color:#d4ffe6; font-size:13px; font-family:inherit; outline:none; transition:border-color .15s; width:100%; }
        .hc-fi:focus { border-color:rgba(79,255,176,0.3); }
        .hc-fi::placeholder { color:rgba(212,255,230,0.2); }
        select.hc-fi option { background:#0a1410; }
        .hc-frow { display:flex; gap:8px; }
        .hc-frow > .hc-fg { flex:1; }
        .hc-igrid { display:flex; flex-wrap:wrap; gap:5px; }
        .hc-iopt { width:32px; height:32px; border-radius:6px; border:1px solid rgba(79,255,176,0.1); background:transparent; cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; transition:all .12s; }
        .hc-iopt.sel { border-color:#4fffb0; background:rgba(79,255,176,0.1); }
        .hc-iopt:hover { border-color:rgba(79,255,176,0.3); transform:scale(1.1); }
        .hc-submit { font-family:inherit; font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:9px 18px; border-radius:6px; border:none; background:#4fffb0; color:#060d09; cursor:pointer; transition:all .15s; width:fit-content; }
        .hc-submit:hover { background:#2de08e; }
        .hc-submit:disabled { opacity:.4; cursor:not-allowed; }

        /* Habit list */
        .hc-empty { text-align:center; padding:24px 0; font-size:12px; color:rgba(212,255,230,0.25); letter-spacing:.08em; font-family:'Space Mono',monospace; }
        .hc-list { display:flex; flex-direction:column; gap:3px; }
        .hc-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; border:1px solid transparent; transition:all .15s; cursor:default; }
        .hc-item:hover { border-color:rgba(79,255,176,0.08); background:rgba(79,255,176,0.03); }
        .hc-check { width:22px; height:22px; border-radius:5px; border:1.5px solid rgba(79,255,176,0.2); cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .15s; font-size:11px; color:#4fffb0; }
        .hc-check.done { background:rgba(79,255,176,0.12); border-color:#4fffb0; }
        .hc-check:hover { border-color:#4fffb0; }
        .hc-icon { font-size:17px; flex-shrink:0; }
        .hc-info { flex:1; min-width:0; }
        .hc-name { font-size:13px; font-weight:500; transition:opacity .2s; }
        .hc-name.done { text-decoration:line-through; opacity:.35; }
        .hc-meta { font-size:10px; color:rgba(212,255,230,0.3); margin-top:2px; text-transform:capitalize; letter-spacing:.04em; font-family:'Space Mono',monospace; }
        .hc-streak { font-family:'Space Mono',monospace; font-size:10px; padding:2px 7px; border-radius:3px; background:rgba(255,224,102,0.08); border:1px solid rgba(255,224,102,0.18); color:#ffe066; flex-shrink:0; }
        .hc-del { background:none; border:none; color:rgba(212,255,230,0.15); cursor:pointer; padding:3px 5px; border-radius:4px; transition:all .12s; font-size:11px; flex-shrink:0; font-family:'Space Mono',monospace; }
        .hc-del:hover { color:#ff6b6b; background:rgba(255,107,107,0.08); }
        .hc-del:disabled { opacity:.3; cursor:not-allowed; }
      `}</style>

      <div className="hc-root">
        <div className="hc-header">
          <div className="hc-title">
            <div className="hc-title-dot" />
            habit tracker
          </div>
          <button
            className={`hc-add-btn ${showForm ? 'cancel' : ''}`}
            onClick={() => setShowForm(p => !p)}
          >
            {showForm ? 'cancel' : '+ new'}
          </button>
        </div>

        {/* Progress bar */}
        {habits.length > 0 && (
          <div className="hc-progress">
            <div className="hc-progress-row">
              <span className="hc-progress-label">today's progress</span>
              <span className="hc-progress-val">{completedToday}/{habits.length} · {pct}%</span>
            </div>
            <div className="hc-bar-bg">
              <div className="hc-bar-fill" style={{ width:`${pct}%` }} />
            </div>
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <form className="hc-form" onSubmit={onSubmit}>
            <div className="hc-form-grid">
              <div className="hc-fg">
                <label className="hc-fl">habit name</label>
                <input className="hc-fi" placeholder="e.g. morning workout"
                  value={form.name} onChange={e => setForm(p => ({...p, name:e.target.value}))} required />
              </div>
              <div className="hc-frow">
                <div className="hc-fg">
                  <label className="hc-fl">category</label>
                  <select className="hc-fi" value={form.category} onChange={e => setForm(p => ({...p, category:e.target.value}))}>
                    {HABIT_CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="hc-fg">
                  <label className="hc-fl">frequency</label>
                  <select className="hc-fi" value={form.frequency} onChange={e => setForm(p => ({...p, frequency:e.target.value}))}>
                    <option value="daily">daily</option>
                    <option value="weekly">weekly</option>
                  </select>
                </div>
              </div>
              <div className="hc-fg">
                <label className="hc-fl">icon</label>
                <div className="hc-igrid">
                  {HABIT_ICONS.map(ic => (
                    <button key={ic} type="button"
                      className={`hc-iopt ${form.icon === ic ? 'sel' : ''}`}
                      onClick={() => setForm(p => ({...p, icon:ic}))}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="hc-submit" disabled={submitting}>
                {submitting ? 'creating…' : 'create habit'}
              </button>
            </div>
          </form>
        )}

        {/* List */}
        {habits.length === 0 ? (
          <div className="hc-empty">no habits yet → add your first</div>
        ) : (
          <div className="hc-list">
            {habits.map(h => {
              const done = h.completedDates?.includes(todayStr)
              return (
                <div key={h._id} className="hc-item">
                  <div className={`hc-check ${done ? 'done' : ''}`}
                    onClick={() => handleToggleHabit(h._id)}>
                    {done && '✓'}
                  </div>
                  <span className="hc-icon">{h.icon}</span>
                  <div className="hc-info">
                    <div className={`hc-name ${done ? 'done' : ''}`}>{h.name}</div>
                    <div className="hc-meta">{h.category} · {h.frequency}</div>
                  </div>
                  {h.currentStreak > 0 && (
                    <span className="hc-streak">×{h.currentStreak}</span>
                  )}
                  <button className="hc-del" disabled={deletingId === h._id}
                    onClick={() => onDelete(h._id)}>
                    {deletingId === h._id ? '…' : '✕'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}