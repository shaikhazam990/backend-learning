import React, { useState } from 'react'
import { useLifeOS } from '../hooks/useLifeOS'

const todayISO = () => new Date().toISOString().split('T')[0]
const SPEND_CATS = ['food','transport','entertainment','health','shopping','bills','education','other']

const CAT_COLORS = {
  food:'#4fffb0', transport:'#00e5cc', entertainment:'#9f7aea',
  health:'#68d391', shopping:'#ffe066', bills:'#ff6b6b',
  education:'#63b3ed', other:'rgba(212,255,230,0.4)'
}

export default function SpendingCard() {
  const { spendings, handleAddSpending, handleDeleteSpending } = useLifeOS()
  const [form, setForm] = useState({ amount:'', category:'food', description:'' })
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const todayStr = todayISO()

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount) return
    setSubmitting(true)
    try {
      await handleAddSpending({ ...form, amount: +form.amount })
      setForm({ amount:'', category:'food', description:'' })
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async (id) => {
    setDeletingId(id)
    try { await handleDeleteSpending(id) }
    finally { setDeletingId(null) }
  }

  // Aggregations
  const todaySpend = spendings.filter(s => s.date === todayStr).reduce((a,s) => a+s.amount, 0)
  const totalSpend = spendings.reduce((a,s) => a+s.amount, 0)

  const byCat = spendings.reduce((acc,s) => {
    acc[s.category] = (acc[s.category] || 0) + s.amount
    return acc
  }, {})
  const topCats = Object.entries(byCat).sort((a,b) => b[1]-a[1]).slice(0,4)
  const maxAmt = topCats[0]?.[1] || 1

  const visibleTx = showAll ? spendings : spendings.slice(0, 6)

  return (
    <>
      <style>{`
        .sc-root { font-family:'Space Grotesk','Inter',sans-serif; }
        .sc-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .sc-title { font-size:13px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:rgba(212,255,230,0.5); display:flex; align-items:center; gap:8px; }
        .sc-title-dot { width:5px; height:5px; border-radius:50%; background:#4fffb0; animation:scGlow 2.5s ease-in-out infinite; }
        @keyframes scGlow { 0%,100%{opacity:.5} 50%{opacity:1} }

        /* Stats row */
        .sc-stats { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:rgba(79,255,176,0.08); border:1px solid rgba(79,255,176,0.08); border-radius:8px; overflow:hidden; margin-bottom:16px; }
        .sc-stat { background:#0a1410; padding:12px 14px; position:relative; }
        .sc-stat::before { content:''; position:absolute; top:0; left:0; width:2px; height:100%; background:#4fffb0; opacity:.3; }
        .sc-stat-lbl { font-family:'Space Mono',monospace; font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:rgba(212,255,230,0.3); margin-bottom:6px; }
        .sc-stat-val { font-family:'Space Mono',monospace; font-size:18px; font-weight:700; color:#4fffb0; line-height:1; }
        .sc-stat-sub { font-size:11px; color:rgba(212,255,230,0.35); margin-top:4px; }

        /* Category bars */
        .sc-cats { margin-bottom:16px; }
        .sc-cats-title { font-family:'Space Mono',monospace; font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:rgba(212,255,230,0.3); margin-bottom:10px; }
        .sc-cat-row { display:flex; align-items:center; gap:8px; margin-bottom:7px; }
        .sc-cat-lbl { font-size:11px; color:rgba(212,255,230,0.45); min-width:80px; text-transform:capitalize; letter-spacing:.03em; }
        .sc-cat-bg { flex:1; height:3px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden; }
        .sc-cat-fill { height:100%; border-radius:2px; transition:width .9s cubic-bezier(.22,1,.36,1); }
        .sc-cat-amt { font-family:'Space Mono',monospace; font-size:10px; color:rgba(212,255,230,0.6); min-width:48px; text-align:right; }

        /* Add form */
        .sc-form { background:rgba(0,0,0,0.2); border:1px solid rgba(79,255,176,0.08); border-radius:10px; padding:13px; margin-bottom:16px; }
        .sc-form-title { font-family:'Space Mono',monospace; font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:rgba(212,255,230,0.3); margin-bottom:10px; }
        .sc-form-grid { display:grid; gap:9px; }
        .sc-fg { display:flex; flex-direction:column; gap:4px; }
        .sc-fl { font-size:9px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:rgba(212,255,230,0.25); }
        .sc-fi { background:rgba(0,0,0,0.3); border:1px solid rgba(79,255,176,0.1); border-radius:6px; padding:8px 10px; color:#d4ffe6; font-size:13px; font-family:inherit; outline:none; transition:border-color .15s; width:100%; }
        .sc-fi:focus { border-color:rgba(79,255,176,0.28); }
        .sc-fi::placeholder { color:rgba(212,255,230,0.18); }
        select.sc-fi option { background:#0a1410; }
        .sc-frow { display:flex; gap:8px; }
        .sc-frow > .sc-fg { flex:1; }
        .sc-submit { font-family:inherit; font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:8px 16px; border-radius:5px; border:none; background:#4fffb0; color:#060d09; cursor:pointer; transition:all .15s; width:fit-content; }
        .sc-submit:hover { background:#2de08e; }
        .sc-submit:disabled { opacity:.4; cursor:not-allowed; }

        /* Transaction list */
        .sc-tx-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
        .sc-tx-title { font-family:'Space Mono',monospace; font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:rgba(212,255,230,0.3); }
        .sc-show-more { font-family:inherit; font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; padding:4px 10px; border-radius:4px; border:1px solid rgba(79,255,176,0.15); background:transparent; color:rgba(79,255,176,0.5); cursor:pointer; transition:all .15s; }
        .sc-show-more:hover { color:#4fffb0; border-color:rgba(79,255,176,0.3); }

        .sc-empty { font-family:'Space Mono',monospace; font-size:11px; color:rgba(212,255,230,0.2); text-align:center; padding:16px 0; letter-spacing:.08em; }
        .sc-tx { display:flex; align-items:center; gap:9px; padding:8px 0; border-bottom:1px solid rgba(79,255,176,0.05); transition:padding-left .12s; }
        .sc-tx:last-child { border-bottom:none; }
        .sc-tx:hover { padding-left:3px; }
        .sc-tx-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
        .sc-tx-tag { font-family:'Space Mono',monospace; font-size:9px; letter-spacing:.08em; text-transform:uppercase; padding:2px 7px; border-radius:3px; background:rgba(79,255,176,0.06); border:1px solid rgba(79,255,176,0.1); color:rgba(79,255,176,0.7); flex-shrink:0; }
        .sc-tx-desc { flex:1; font-size:12px; color:rgba(212,255,230,0.45); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .sc-tx-date { font-family:'Space Mono',monospace; font-size:9px; color:rgba(212,255,230,0.2); flex-shrink:0; }
        .sc-tx-amt { font-family:'Space Mono',monospace; font-size:12px; font-weight:700; color:#d4ffe6; flex-shrink:0; }
        .sc-tx-del { background:none; border:none; color:rgba(212,255,230,0.12); cursor:pointer; padding:2px 5px; border-radius:3px; transition:all .12s; font-size:10px; flex-shrink:0; font-family:'Space Mono',monospace; }
        .sc-tx-del:hover { color:#ff6b6b; background:rgba(255,107,107,0.08); }
        .sc-tx-del:disabled { opacity:.3; cursor:not-allowed; }
      `}</style>

      <div className="sc-root">
        <div className="sc-header">
          <div className="sc-title">
            <div className="sc-title-dot" />
            spending tracker
          </div>
        </div>

        {/* Stats */}
        <div className="sc-stats">
          <div className="sc-stat">
            <div className="sc-stat-lbl">today</div>
            <div className="sc-stat-val">₹{todaySpend}</div>
            <div className="sc-stat-sub">spent today</div>
          </div>
          <div className="sc-stat">
            <div className="sc-stat-lbl">total</div>
            <div className="sc-stat-val">₹{totalSpend}</div>
            <div className="sc-stat-sub">{spendings.length} transactions</div>
          </div>
        </div>

        {/* Category breakdown */}
        {topCats.length > 0 && (
          <div className="sc-cats">
            <div className="sc-cats-title">by category</div>
            {topCats.map(([cat, amt]) => (
              <div key={cat} className="sc-cat-row">
                <div className="sc-cat-lbl">{cat}</div>
                <div className="sc-cat-bg">
                  <div className="sc-cat-fill"
                    style={{ width:`${(amt/maxAmt)*100}%`, background: CAT_COLORS[cat] || CAT_COLORS.other }}/>
                </div>
                <div className="sc-cat-amt">₹{amt}</div>
              </div>
            ))}
          </div>
        )}

        {/* Add expense form */}
        <div className="sc-form">
          <div className="sc-form-title">add expense</div>
          <form className="sc-form-grid" onSubmit={onSubmit}>
            <div className="sc-frow">
              <div className="sc-fg">
                <label className="sc-fl">amount ₹</label>
                <input className="sc-fi" type="number" placeholder="0" min="0"
                  value={form.amount} onChange={e => setForm(p => ({...p, amount:e.target.value}))} required/>
              </div>
              <div className="sc-fg">
                <label className="sc-fl">category</label>
                <select className="sc-fi" value={form.category}
                  onChange={e => setForm(p => ({...p, category:e.target.value}))}>
                  {SPEND_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="sc-fg">
              <label className="sc-fl">description</label>
              <input className="sc-fi" placeholder="what did you spend on?"
                value={form.description} onChange={e => setForm(p => ({...p, description:e.target.value}))}/>
            </div>
            <button type="submit" className="sc-submit" disabled={submitting}>
              {submitting ? 'adding…' : 'add expense'}
            </button>
          </form>
        </div>

        {/* Transaction list */}
        <div className="sc-tx-header">
          <div className="sc-tx-title">transactions</div>
          {spendings.length > 6 && (
            <button className="sc-show-more" onClick={() => setShowAll(p => !p)}>
              {showAll ? 'show less' : `+${spendings.length - 6} more`}
            </button>
          )}
        </div>

        {spendings.length === 0 ? (
          <div className="sc-empty">no transactions yet</div>
        ) : (
          visibleTx.map((s, i) => (
            <div key={s._id || i} className="sc-tx">
              <div className="sc-tx-dot" style={{ background: CAT_COLORS[s.category] || CAT_COLORS.other }}/>
              <span className="sc-tx-tag">{s.category}</span>
              <span className="sc-tx-desc">{s.description || '—'}</span>
              <span className="sc-tx-date">{s.date}</span>
              <span className="sc-tx-amt">₹{s.amount}</span>
              <button className="sc-tx-del" disabled={deletingId === s._id}
                onClick={() => onDelete(s._id)}>
                {deletingId === s._id ? '…' : '✕'}
              </button>
            </div>
          ))
        )}
      </div>
    </>
  )
}