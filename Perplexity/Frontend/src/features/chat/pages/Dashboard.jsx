import React, { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector, useDispatch } from 'react-redux'
import { useChat } from '../hooks/useChat'
import { useAuth } from '../../auth/hook/useAuth'
import { useNavigate } from 'react-router'
import { setCurrentChatId } from '../chat.slice'
import remarkGfm from 'remark-gfm'

const TypingDots = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '10px 4px' }}>
    {[0, 1, 2].map(i => (
      <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
)

export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const chat = useChat()
  const { handleLogout } = useAuth()

  const [chatInput, setChatInput]     = useState('')
  const [isThinking, setIsThinking]   = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loggingOut, setLoggingOut]   = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen]   = useState(false)
  const [deletingId, setDeletingId]   = useState(null)

  const chats         = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)
  const user          = useSelector((state) => state.auth.user)

  const messagesEndRef = useRef(null)
  const textareaRef    = useRef(null)
  const searchRef      = useRef(null)

  useEffect(() => {
    chat.initializeSocketConnection()
    chat.handleGetChats()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, currentChatId, isThinking])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const handleNewChat = () => {
    dispatch(setCurrentChatId(null))
    setChatInput('')
    setSearchQuery('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleSubmitMessage = async (e) => {
    e.preventDefault()
    const trimmed = chatInput.trim()
    if (!trimmed || isThinking) return
    setIsThinking(true)
    setChatInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    try {
      await chat.handleSendMessage({ message: trimmed, chatId: currentChatId })
    } catch (err) {
      console.error('Send message error:', err)
    } finally {
      setIsThinking(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitMessage(e)
    }
  }

  const handleTextareaChange = (e) => {
    setChatInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
  }

  const handleChipClick = (text) => {
    setChatInput(text)
    textareaRef.current?.focus()
  }

  const onLogout = async () => {
    setLoggingOut(true)
    try { await handleLogout() } catch { setLoggingOut(false) }
  }

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation()
    setDeletingId(chatId)
    try {
      await chat.handleDeleteChat(chatId)
      if (currentChatId === chatId) dispatch(setCurrentChatId(null))
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const chatList = Object.values(chats)
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    .filter(c =>
      searchQuery.trim() === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const currentMessages = chats[currentChatId]?.messages || []
  const isNewChat = !currentChatId

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #080c14; --surface: #0d1220; --surface2: #111827;
          --border: rgba(255,255,255,0.07); --border-hover: rgba(255,255,255,0.15);
          --accent: #20d9c0; --accent2: #3b82f6; --accent-glow: rgba(32,217,192,0.12);
          --text: #f0f4ff; --muted: rgba(240,244,255,0.45);
          --user-bubble: rgba(32,217,192,0.08);
          --danger: #ef4444; --danger-bg: rgba(239,68,68,0.08); --danger-border: rgba(239,68,68,0.2);
        }
        body { background: var(--bg); font-family: 'Inter', sans-serif; color: var(--text); }

        .dash-root { display: flex; height: 100vh; overflow: hidden; background: var(--bg); }
        .dash-root::before {
          content: ''; position: fixed; top: -20%; left: -10%;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(32,217,192,0.03) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        /* ── SIDEBAR ── */
        .sidebar {
          width: 240px; min-width: 240px; height: 100vh;
          background: var(--surface); border-right: 1px solid var(--border);
          display: flex; flex-direction: column; padding: 18px 12px;
          position: relative; z-index: 10;
          transition: width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s, padding 0.3s, opacity 0.3s;
          overflow: hidden;
        }
        .sidebar.closed { width: 0; min-width: 0; padding: 0; opacity: 0; }

        .sidebar-logo {
          font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800;
          letter-spacing: -0.5px; color: var(--text);
          padding: 4px 10px 16px; display: flex; align-items: center; gap: 9px; white-space: nowrap;
        }
        .logo-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--accent); box-shadow: 0 0 10px var(--accent); flex-shrink: 0;
        }

        .nav-section { display: flex; flex-direction: column; gap: 2px; margin-bottom: 6px; }
        .nav-link {
          display: flex; align-items: center; gap: 9px; padding: 9px 12px;
          border-radius: 10px; border: 1px solid transparent; background: transparent;
          color: var(--muted); font-size: 13px; font-family: 'Inter', sans-serif;
          cursor: pointer; transition: all 0.18s; text-align: left; white-space: nowrap; width: 100%;
        }
        .nav-link:hover { background: var(--surface2); color: var(--text); border-color: var(--border); }
        .nav-link.active { background: var(--accent-glow); border-color: rgba(32,217,192,0.22); color: var(--text); }
        .nav-divider { height: 1px; background: var(--border); margin: 10px 0; }

        .chat-actions-row { display: flex; gap: 6px; margin-bottom: 10px; }
        .new-chat-btn {
          flex: 1; display: flex; align-items: center; gap: 8px; padding: 9px 12px;
          border-radius: 10px; border: 1px solid var(--border); background: transparent;
          color: var(--muted); font-size: 13px; font-family: 'Inter', sans-serif;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .new-chat-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-glow); }

        .search-toggle-btn {
          width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border);
          background: transparent; color: var(--muted); cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: all 0.18s; flex-shrink: 0;
        }
        .search-toggle-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-glow); }
        .search-toggle-btn.active { border-color: rgba(32,217,192,0.35); color: var(--accent); background: var(--accent-glow); }

        .search-wrap {
          overflow: hidden; transition: max-height 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.25s;
          max-height: 0; opacity: 0; margin-bottom: 0;
        }
        .search-wrap.open { max-height: 50px; opacity: 1; margin-bottom: 8px; }
        .search-input-box {
          display: flex; align-items: center; gap: 8px;
          background: var(--surface2); border: 1px solid var(--border);
          border-radius: 10px; padding: 8px 12px; transition: border-color 0.18s;
        }
        .search-input-box:focus-within { border-color: rgba(32,217,192,0.35); }
        .search-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: var(--text); font-size: 13px; font-family: 'Inter', sans-serif;
        }
        .search-input::placeholder { color: var(--muted); }
        .search-clear {
          background: none; border: none; color: var(--muted); cursor: pointer;
          padding: 2px; display: flex; transition: color 0.15s; flex-shrink: 0;
        }
        .search-clear:hover { color: var(--text); }

        .sidebar-section-label {
          font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
          color: var(--muted); padding: 4px 12px; white-space: nowrap; margin-bottom: 4px;
        }
        .no-results { font-size: 12px; color: var(--muted); text-align: center; padding: 16px 0; }

        .chat-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; }
        .chat-list::-webkit-scrollbar { width: 3px; }
        .chat-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

        .chat-item {
          display: flex; align-items: center; gap: 8px; padding: 8px 10px 8px 12px;
          border-radius: 10px; border: 1px solid transparent; background: transparent;
          color: var(--muted); font-size: 13px; font-family: 'Inter', sans-serif;
          cursor: pointer; transition: all 0.18s; text-align: left; width: 100%; position: relative;
        }
        .chat-item:hover { background: var(--surface2); color: var(--text); border-color: var(--border); }
        .chat-item.active { background: var(--accent-glow); border-color: rgba(32,217,192,0.22); color: var(--text); }
        .chat-item-icon { font-size: 11px; opacity: 0.35; flex-shrink: 0; }
        .chat-item-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }

        .chat-delete-btn {
          width: 22px; height: 22px; border-radius: 6px; border: none;
          background: transparent; color: transparent; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s; flex-shrink: 0; font-size: 11px;
        }
        .chat-item:hover .chat-delete-btn { color: rgba(240,244,255,0.3); }
        .chat-delete-btn:hover { background: var(--danger-bg) !important; color: var(--danger) !important; }
        .chat-delete-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .sidebar-footer {
          margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 4px;
        }
        .user-pill { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 10px; white-space: nowrap; }
        .user-avatar {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #0d1220;
        }
        .user-info { flex: 1; min-width: 0; }
        .user-name { font-size: 13px; font-weight: 600; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .user-role { font-size: 11px; color: var(--muted); }
        .logout-btn {
          display: flex; align-items: center; gap: 8px; padding: 9px 12px;
          border-radius: 10px; border: 1px solid transparent; background: transparent;
          color: var(--muted); font-size: 13px; font-family: 'Inter', sans-serif;
          cursor: pointer; transition: all 0.18s; text-align: left; white-space: nowrap; width: 100%;
        }
        .logout-btn:hover { background: var(--danger-bg); border-color: var(--danger-border); color: #fca5a5; }
        .logout-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── MAIN ── */
        .main-area { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; z-index: 1; }
        .topbar {
          display: flex; align-items: center; gap: 12px; padding: 13px 20px;
          border-bottom: 1px solid var(--border);
          background: rgba(8,12,20,0.85); backdrop-filter: blur(12px); flex-shrink: 0;
        }
        .toggle-btn {
          width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border);
          background: transparent; color: var(--muted); cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: all 0.18s; flex-shrink: 0;
        }
        .toggle-btn:hover { border-color: var(--border-hover); color: var(--text); }
        .topbar-title {
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
          color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
        }

        .messages-area {
          flex: 1; overflow-y: auto; padding: 32px 20px 20px;
          display: flex; flex-direction: column; gap: 28px;
        }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 4px; }

        .msg-row {
          display: flex; gap: 14px; max-width: 760px; width: 100%; margin: 0 auto;
          animation: msgFadeIn 0.35s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes msgFadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .msg-row.user { justify-content: flex-end; }

        .msg-avatar {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0; margin-top: 2px;
          display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;
        }
        .ai-avatar { background: linear-gradient(135deg, #20d9c0, #3b82f6); color: #0d1220; }
        .user-avatar-msg { background: rgba(255,255,255,0.06); color: var(--muted); border: 1px solid var(--border); }

        .msg-bubble { max-width: 620px; }
        .user-bubble {
          background: var(--user-bubble); border: 1px solid rgba(32,217,192,0.15);
          border-radius: 18px 18px 4px 18px; padding: 12px 18px;
          font-size: 15px; line-height: 1.6; color: var(--text);
        }
        .ai-bubble { padding: 4px 0; font-size: 15px; line-height: 1.75; color: rgba(240,244,255,0.88); }
        .ai-bubble p { margin-bottom: 10px; }
        .ai-bubble p:last-child { margin-bottom: 0; }
        .ai-bubble ul,.ai-bubble ol { padding-left: 20px; margin-bottom: 10px; }
        .ai-bubble li { margin-bottom: 4px; }
        .ai-bubble code { background: rgba(255,255,255,0.07); border: 1px solid var(--border); border-radius: 5px; padding: 1px 6px; font-size: 13px; font-family: 'SF Mono','Fira Code',monospace; }
        .ai-bubble pre { background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 16px; overflow-x: auto; margin: 10px 0; }
        .ai-bubble pre code { background: none; border: none; padding: 0; font-size: 13px; }
        .ai-bubble h1,.ai-bubble h2,.ai-bubble h3 { font-family: 'Syne',sans-serif; font-weight: 700; margin: 16px 0 8px; color: var(--text); }
        .ai-bubble h1{font-size:20px} .ai-bubble h2{font-size:17px} .ai-bubble h3{font-size:15px}
        .ai-bubble strong { color: var(--text); }
        .ai-bubble a { color: var(--accent); text-decoration: none; }
        .ai-bubble a:hover { text-decoration: underline; }
        .ai-bubble blockquote { border-left: 3px solid var(--accent); padding-left: 14px; color: var(--muted); margin: 8px 0; }
        .ai-bubble table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 14px; }
        .ai-bubble th,.ai-bubble td { border: 1px solid var(--border); padding: 8px 12px; text-align: left; }
        .ai-bubble th { background: var(--surface2); font-weight: 600; }
        .ai-bubble hr { border: none; border-top: 1px solid var(--border); margin: 14px 0; }

        /* ── Streaming cursor ── */
        .streaming-cursor {
          display: inline-block; width: 2px; height: 1em;
          background: var(--accent); margin-left: 2px;
          animation: cursorBlink 0.8s ease infinite;
          vertical-align: text-bottom; border-radius: 1px;
        }
        @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }

        .typing-dot {
          display: inline-block; width: 7px; height: 7px; border-radius: 50%;
          background: var(--accent); animation: typingBounce 1.2s ease-in-out infinite; opacity: 0.7;
        }
        @keyframes typingBounce { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-6px);opacity:1} }

        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .empty-state {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 14px; text-align: center; padding: 40px 20px; max-width: 560px; margin: 0 auto;
          animation: msgFadeIn 0.5s ease both;
        }
        .empty-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          display: flex; align-items: center; justify-content: center; font-size: 22px;
          box-shadow: 0 0 40px rgba(32,217,192,0.2);
        }
        .empty-title { font-family: 'Syne',sans-serif; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .empty-sub { font-size: 14px; color: var(--muted); line-height: 1.6; max-width: 380px; }
        .suggestion-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 6px; }
        .chip {
          padding: 8px 14px; border-radius: 20px; border: 1px solid var(--border);
          background: var(--surface2); color: var(--muted); font-size: 13px;
          cursor: pointer; transition: all 0.18s; font-family: 'Inter',sans-serif;
        }
        .chip:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-glow); }

        .input-area {
          padding: 14px 20px 18px; background: rgba(8,12,20,0.9);
          backdrop-filter: blur(16px); border-top: 1px solid var(--border); flex-shrink: 0;
        }
        .input-form { max-width: 760px; margin: 0 auto; }
        .input-box {
          display: flex; align-items: flex-end; gap: 10px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 16px; padding: 10px 12px 10px 16px; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-box:focus-within { border-color: rgba(32,217,192,0.4); box-shadow: 0 0 0 3px rgba(32,217,192,0.06); }
        .input-textarea {
          flex: 1; background: transparent; border: none; outline: none;
          color: var(--text); font-size: 15px; font-family: 'Inter',sans-serif;
          line-height: 1.6; resize: none; min-height: 24px; max-height: 160px; overflow-y: auto;
        }
        .input-textarea::placeholder { color: var(--muted); }
        .send-btn {
          width: 36px; height: 36px; border-radius: 10px; border: none;
          background: var(--accent); color: #0d1220; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.18s; flex-shrink: 0;
        }
        .send-btn:disabled { background: var(--surface2); color: var(--muted); cursor: not-allowed; }
        .send-btn:not(:disabled):hover { background: #2ef0d6; transform: scale(1.05); }
        .input-hint { text-align: center; font-size: 11px; color: var(--muted); margin-top: 8px; opacity: 0.5; }

        @media (max-width: 768px) {
          .sidebar { position: fixed; z-index: 100; box-shadow: 4px 0 24px rgba(0,0,0,0.4); }
          .sidebar.closed { transform: translateX(-100%); width: 240px; min-width: 240px; opacity: 1; }
        }
      `}</style>

      <div className="dash-root">
        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>
          <div className="sidebar-logo">
            <span className="logo-dot" />
            Quick
          </div>

          <div className="nav-section">
            <button className="nav-link active">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Chat
            </button>
            <button className="nav-link" onClick={() => navigate('/lifeos')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              Life OS
            </button>
          </div>

          <div className="nav-divider" />

          <div className="chat-actions-row">
            <button className="new-chat-btn" onClick={handleNewChat}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Chat
            </button>
            <button
              className={`search-toggle-btn ${searchOpen ? 'active' : ''}`}
              onClick={() => { setSearchOpen(p => !p); if (searchOpen) setSearchQuery('') }}
              title="Search chats"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>

          <div className={`search-wrap ${searchOpen ? 'open' : ''}`}>
            <div className="search-input-box">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)', flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={searchRef}
                className="search-input"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery('')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {Object.values(chats).length > 0 && (
            <>
              <div className="sidebar-section-label">
                {searchQuery ? `Results for "${searchQuery}"` : 'Recent'}
              </div>
              <div className="chat-list">
                {chatList.length === 0 ? (
                  <div className="no-results">No chats found</div>
                ) : (
                  chatList.map((c) => (
                    <button
                      key={c.id}
                      className={`chat-item ${c.id === currentChatId ? 'active' : ''}`}
                      onClick={() => chat.handleOpenChat(c.id, chats)}
                    >
                      <span className="chat-item-icon">💬</span>
                      <span className="chat-item-title">{c.title}</span>
                      <button
                        className="chat-delete-btn"
                        onClick={(e) => handleDeleteChat(e, c.id)}
                        disabled={deletingId === c.id}
                        title="Delete chat"
                      >
                        {deletingId === c.id ? (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                          </svg>
                        ) : (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        )}
                      </button>
                    </button>
                  ))
                )}
              </div>
            </>
          )}

          <div className="sidebar-footer">
            <div className="user-pill">
              <div className="user-avatar">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="user-info">
                <div className="user-name">{user?.username || 'User'}</div>
                <div className="user-role">Free plan</div>
              </div>
            </div>
            <button className="logout-btn" onClick={onLogout} disabled={loggingOut}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {loggingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main-area">
          <div className="topbar">
            <button className="toggle-btn" onClick={() => setSidebarOpen(p => !p)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <span className="topbar-title">
              {currentChatId ? chats[currentChatId]?.title : 'New Conversation'}
            </span>
          </div>

          <div className="messages-area">
            {isNewChat && currentMessages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✦</div>
                <div className="empty-title">Ask me anything</div>
                <p className="empty-sub">Search the web, write code, analyze data, or just have a conversation.</p>
                <div className="suggestion-chips">
                  {['What is quantum computing?','Latest AI news today','Write a Python script','Explain black holes'].map(s => (
                    <button key={s} className="chip" onClick={() => handleChipClick(s)}>{s}</button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {currentMessages.map((msg, i) => (
                  <div key={i} className={`msg-row ${msg.role === 'user' ? 'user' : ''}`}>
                    {msg.role === 'ai' && <div className="msg-avatar ai-avatar">✦</div>}
                    <div className={`msg-bubble ${msg.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                      {msg.role === 'user' ? (
                        <p>{msg.content}</p>
                      ) : (
                        <>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p>{children}</p>,
                              ul: ({ children }) => <ul>{children}</ul>,
                              ol: ({ children }) => <ol>{children}</ol>,
                              li: ({ children }) => <li>{children}</li>,
                              code: ({ children }) => <code>{children}</code>,
                              pre: ({ children }) => <pre>{children}</pre>,
                              h1: ({ children }) => <h1>{children}</h1>,
                              h2: ({ children }) => <h2>{children}</h2>,
                              h3: ({ children }) => <h3>{children}</h3>,
                              strong: ({ children }) => <strong>{children}</strong>,
                              blockquote: ({ children }) => <blockquote>{children}</blockquote>,
                              a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer">{children}</a>,
                              table: ({ children }) => <table>{children}</table>,
                              th: ({ children }) => <th>{children}</th>,
                              td: ({ children }) => <td>{children}</td>,
                              hr: () => <hr />,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                          {/* ── Streaming cursor — only shown while streaming ── */}
                          {msg.isStreaming && (
                            <span className="streaming-cursor" />
                          )}
                        </>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="msg-avatar user-avatar-msg">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                ))}
                {isThinking && (
                  <div className="msg-row">
                    <div className="msg-avatar ai-avatar">✦</div>
                    <div className="msg-bubble ai-bubble"><TypingDots /></div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <form className="input-form" onSubmit={handleSubmitMessage}>
              <div className="input-box">
                <textarea
                  ref={textareaRef}
                  className="input-textarea"
                  value={chatInput}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  rows={1}
                />
                <button type="submit" className="send-btn" disabled={!chatInput.trim() || isThinking}>
                  {isThinking ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="6" width="12" height="12" rx="2"/>
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="19" x2="12" y2="5"/>
                      <polyline points="5 12 12 5 19 12"/>
                    </svg>
                  )}
                </button>
              </div>
              <div className="input-hint">Enter to send · Shift+Enter for new line</div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}