import React, { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router'
import { useAuth } from '../hook/useAuth'
import { useSelector } from 'react-redux'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const { handleLogin } = useAuth()
  const navigate = useNavigate()
  const user = useSelector(s => s.auth.user)
  const loading = useSelector(s => s.auth.loading)
  const error = useSelector(s => s.auth.error)

  if (!loading && user) return <Navigate to="/" replace />

  const submitForm = async (e) => {
    e.preventDefault()
    try {
      await handleLogin({ email, password })
      navigate('/')
    } catch {}
  }

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/api/auth/google'
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          min-height: 100vh; background: #080c14;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Inter', sans-serif; color: #f0f4ff;
          padding: 20px; position: relative; overflow: hidden;
        }
        .auth-root::before {
          content: ''; position: fixed; top: -30%; right: -20%;
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(32,217,192,0.05) 0%, transparent 65%);
          pointer-events: none;
        }
        .auth-root::after {
          content: ''; position: fixed; bottom: -20%; left: -15%;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 65%);
          pointer-events: none;
        }

        .auth-card {
          width: 100%; max-width: 420px;
          background: #0d1220; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px; padding: 40px 36px;
          position: relative; z-index: 1;
          animation: cardIn 0.5s cubic-bezier(0.4,0,0.2,1) both;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .auth-logo { display: flex; align-items: center; gap: 9px; margin-bottom: 28px; }
        .auth-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: #20d9c0; box-shadow: 0 0 12px #20d9c0; }
        .auth-logo-text { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 800; letter-spacing: -0.3px; color: #f0f4ff; }

        .auth-heading { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #f0f4ff; line-height: 1.2; margin-bottom: 6px; }
        .auth-sub { font-size: 14px; color: rgba(240,244,255,0.45); margin-bottom: 24px; line-height: 1.5; }

        .auth-error {
          display: flex; align-items: center; gap: 8px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #fca5a5;
          margin-bottom: 18px; animation: errorIn 0.3s ease both;
        }
        @keyframes errorIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

        /* Google button */
        .google-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 12px 16px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04);
          color: #f0f4ff; font-size: 14px; font-weight: 500; font-family: 'Inter', sans-serif;
          cursor: pointer; transition: all 0.2s; margin-bottom: 20px;
        }
        .google-btn:hover {
          background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2);
          transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }
        .google-btn:active { transform: translateY(0); }

        .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .divider-text { font-size: 12px; color: rgba(240,244,255,0.25); white-space: nowrap; }

        .field { margin-bottom: 16px; }
        .field-label { display: block; font-size: 12px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; color: rgba(240,244,255,0.5); margin-bottom: 7px; }
        .field-wrap { position: relative; }
        .field-input {
          width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 12px 16px; color: #f0f4ff; font-size: 14px;
          font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .field-input.has-toggle { padding-right: 44px; }
        .field-input::placeholder { color: rgba(240,244,255,0.25); }
        .field-input:focus { border-color: rgba(32,217,192,0.4); background: rgba(32,217,192,0.03); box-shadow: 0 0 0 3px rgba(32,217,192,0.06); }

        .pass-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: rgba(240,244,255,0.35);
          cursor: pointer; padding: 4px; display: flex; transition: color 0.18s;
        }
        .pass-toggle:hover { color: rgba(240,244,255,0.7); }

        .submit-btn {
          width: 100%; padding: 13px; border-radius: 12px; border: none;
          background: #20d9c0; color: #0d1220; font-size: 15px; font-weight: 700;
          font-family: 'Syne', sans-serif; cursor: pointer; transition: all 0.2s;
          margin-top: 8px; letter-spacing: 0.2px;
        }
        .submit-btn:hover:not(:disabled) { background: #2ef0d6; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(32,217,192,0.25); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-footer-text { text-align: center; font-size: 13px; color: rgba(240,244,255,0.4); margin-top: 22px; }
        .auth-link { color: #20d9c0; text-decoration: none; font-weight: 500; transition: color 0.18s; }
        .auth-link:hover { color: #2ef0d6; }
      `}</style>

      <div className="auth-root">
        <div className="auth-card">
          <div className="auth-logo">
            <span className="auth-logo-dot" />
            <span className="auth-logo-text">Perplexity</span>
          </div>

          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-sub">Sign in to continue your conversations</p>

          {/* Google OAuth */}
          <button className="google-btn" onClick={handleGoogleLogin} type="button">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">or sign in with email</span>
            <div className="divider-line" />
          </div>

          {error && (
            <div className="auth-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={submitForm}>
            <div className="field">
              <label className="field-label">Email</label>
              <input className="field-input" type="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email"/>
            </div>
            <div className="field">
              <label className="field-label">Password</label>
              <div className="field-wrap">
                <input className="field-input has-toggle" type={showPass ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" required autoComplete="current-password"/>
                <button type="button" className="pass-toggle" onClick={() => setShowPass(p => !p)}>
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Create one</Link>
          </p>
        </div>
      </div>
    </>
  )
}