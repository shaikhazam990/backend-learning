import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'

export default function Protected({ children }) {
  const user = useSelector(s => s.auth.user)
  const loading = useSelector(s => s.auth.loading)

  if (loading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');
          .splash {
            min-height: 100vh;
            background: #080c14;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
          }
          .splash-logo {
            font-family: 'Syne', sans-serif;
            font-size: 22px;
            font-weight: 800;
            color: #f0f4ff;
            display: flex;
            align-items: center;
            gap: 9px;
            letter-spacing: -0.3px;
            animation: splashFade 0.5s ease both;
          }
          @keyframes splashFade {
            from { opacity: 0; transform: scale(0.95); }
            to   { opacity: 1; transform: scale(1); }
          }
          .splash-dot {
            width: 9px; height: 9px;
            border-radius: 50%;
            background: #20d9c0;
            box-shadow: 0 0 14px #20d9c0;
            animation: splashPulse 1.4s ease-in-out infinite;
          }
          @keyframes splashPulse {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
          }
          .splash-bar {
            width: 120px;
            height: 2px;
            background: rgba(255,255,255,0.07);
            border-radius: 2px;
            overflow: hidden;
            animation: splashFade 0.5s 0.2s ease both;
          }
          .splash-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #20d9c0, #3b82f6);
            border-radius: 2px;
            animation: barSlide 1.6s ease-in-out infinite;
          }
          @keyframes barSlide {
            0% { width: 0%; margin-left: 0%; }
            50% { width: 60%; margin-left: 20%; }
            100% { width: 0%; margin-left: 100%; }
          }
        `}</style>
        <div className="splash">
          <div className="splash-logo">
            <span className="splash-dot" />
            Perplexity
          </div>
          <div className="splash-bar">
            <div className="splash-bar-fill" />
          </div>
        </div>
      </>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return children
}