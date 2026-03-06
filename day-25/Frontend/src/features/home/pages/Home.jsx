import { useRef, useState, useEffect } from "react";
import { useSong } from "../hooks/useSong";
import { useAuth } from "../../auth/hooks/useAuth";
import Player         from "../components/Player";
import SongsList      from "./SongsList";
import AlbumsPage     from "./AlbumsPage";
import ArtistsPage    from "./ArtistsPage";
import UploadPage     from "./UploadPage";
import LikedSongs     from "./LikedSong";
import RecentlyPlayed from "./RecentlyPlayed";
import { init, detect } from "../../Expression/utlis/utlis";
import "../style/Home.scss";

const MOOD_CONFIG = {
  happy:     { emoji: "😄", label: "Happy",     color: "#F4C542", glow: "rgba(244,197,66,0.2)",  border: "rgba(244,197,66,0.3)"  },
  sad:       { emoji: "😢", label: "Sad",       color: "#6C9FD4", glow: "rgba(108,159,212,0.2)", border: "rgba(108,159,212,0.3)" },
  angry:     { emoji: "😠", label: "Angry",     color: "#FF4E4E", glow: "rgba(255,78,78,0.2)",   border: "rgba(255,78,78,0.3)"   },
  surprised: { emoji: "😲", label: "Surprised", color: "#B06EFF", glow: "rgba(176,110,255,0.2)", border: "rgba(176,110,255,0.3)" },
  neutral:   { emoji: "😐", label: "Neutral",   color: "#A0A0B0", glow: "rgba(160,160,176,0.2)", border: "rgba(160,160,176,0.3)" },
};

const NAV_ITEMS = [
  { id: "home",   icon: "⊞",  label: "Home"             },
  { id: "liked",  icon: "♥",  label: "Liked Songs"      },
  { id: "recent", icon: "🕐", label: "Recently Played"  },
];

const LIBRARY_ITEMS = [
  { id: "artists", icon: "🎤", label: "Artists" },
  { id: "albums",  icon: "💿", label: "Albums"  },
  { id: "songs",   icon: "♪",  label: "Songs"   },
];

export default function Home() {
  const { song, loading, handleGetSong } = useSong();
  const { user, handleLogout } = useAuth();

  const videoRef      = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef     = useRef(null);

  const [camActive,   setCamActive]   = useState(false);
  const [modelReady,  setModelReady]  = useState(false);
  const [detecting,   setDetecting]   = useState(false);
  const [expression,  setExpression]  = useState("Detecting...");
  const [currentMood, setCurrentMood] = useState(song?.mood || "sad");
  const [statusText,  setStatusText]  = useState("Start camera to detect your mood");
  const [activeNav,   setActiveNav]   = useState("home");

  const mood = MOOD_CONFIG[currentMood] || MOOD_CONFIG.neutral;

  useEffect(() => {
    return () => {
      landmarkerRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (song?.mood) setCurrentMood(song.mood);
  }, [song]);

  async function startCamera() {
    try {
      setStatusText("Starting camera...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamActive(true);
      setStatusText("Loading face model...");
      await init({ landmarkerRef, videoRef, streamRef });
      setModelReady(true);
      setStatusText("Camera ready — click Detect Mood");
    } catch (err) {
      console.error("Camera start error:", err);
      setStatusText("Could not start camera. Check browser permissions.");
      setCamActive(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    setCamActive(false);
    setModelReady(false);
    setExpression("Detecting...");
    setStatusText("Start camera to detect your mood");
  }

  async function handleDetectMood() {
    if (!modelReady) { setStatusText("Please start the camera first!"); return; }
    setDetecting(true);
    setStatusText("Reading your expression...");
    const detectedMood = detect({ landmarkerRef, videoRef, setExpression });
    if (!detectedMood) {
      setStatusText("No face detected — make sure your face is visible");
      setDetecting(false);
      return;
    }
    const moodKey   = detectedMood.toLowerCase();
    const validMood = MOOD_CONFIG[moodKey] ? moodKey : "neutral";
    setCurrentMood(validMood);
    setStatusText(`Detected ${MOOD_CONFIG[validMood].label} — fetching songs...`);
    await handleGetSong({ mood: validMood });
    setStatusText(`Playing ${MOOD_CONFIG[validMood].label} songs 🎵`);
    setDetecting(false);
  }

  async function switchMood(moodKey) {
    setCurrentMood(moodKey);
    setStatusText(`Switched to ${MOOD_CONFIG[moodKey].label}`);
    await handleGetSong({ mood: moodKey });
  }

  const avatarLetter = user?.username?.charAt(0).toUpperCase() || "U";

  function renderContent() {
    if (activeNav === "artists") return <ArtistsPage />;
    if (activeNav === "albums")  return <AlbumsPage />;
    if (activeNav === "songs")   return <SongsList />;
    if (activeNav === "upload")  return <UploadPage />;
    if (activeNav === "liked")   return <LikedSongs />;
    if (activeNav === "recent")  return <RecentlyPlayed />;

    // ✅ HOME VIEW — Player removed from here
    return (
      <div className="home-body">
        <div className="camera-panel">
          <div>
            <p className="section-label">Face Camera</p>
            <div className="camera-box">
              <video ref={videoRef} autoPlay muted playsInline />
              {!camActive && (
                <div className="camera-placeholder">
                  <span className="cam-icon">📷</span>
                  Start camera below
                </div>
              )}
              {detecting && <div className="scan-line" />}
              {camActive  && <div className="mood-badge">{mood.emoji} {mood.label}</div>}
              {camActive  && <div className="expression-label">{expression}</div>}
            </div>
            <div className="camera-controls">
              {camActive ? (
                <button className="cam-btn cam-btn--stop" onClick={stopCamera}>✕ Stop</button>
              ) : (
                <button className="cam-btn cam-btn--start" onClick={startCamera}>📷 Start Camera</button>
              )}
              <button
                className="detect-btn"
                onClick={handleDetectMood}
                disabled={detecting || loading || !modelReady}
              >
                {detecting ? "..." : "✦ Detect"}
              </button>
            </div>
          </div>
        </div>

        <div className="now-playing-panel">
          <div className="ambient-bg" />
          {loading ? (
            <div className="skeleton" style={{ width: 180, height: 180, borderRadius: 18 }} />
          ) : song?.posterUrl ? (
            <img className="album-art" src={song.posterUrl} alt={song.title || "Album art"} />
          ) : (
            <div className="album-placeholder">🎵</div>
          )}
          <div className="song-info">
            {loading ? (
              <>
                <div className="skeleton" style={{ width: 240, height: 24 }} />
                <div className="skeleton" style={{ width: 90, height: 18 }} />
              </>
            ) : (
              <>
                <div className="song-title">
                  {song?.title
                    ? song.title.replace(/&quot;/g, '"').replace(/&amp;/g, "&")
                    : "Detect your mood to play a song"}
                </div>
                <div className="song-mood-tag">{mood.emoji} {mood.label}</div>
              </>
            )}
          </div>
          {/* ❌ Player removed from here */}
        </div>
      </div>
    );
  }

  return (
    <div
      className="home-root"
      style={{
        "--mood-color":  mood.color,
        "--mood-glow":   mood.glow,
        "--mood-border": mood.border,
      }}
    >
      <aside className="sidebar">
        <div className="sidebar__logo">
          <div className="logo-text"><span className="accent">mood</span>ify</div>
          <div className="logo-sub">Feel the music</div>
        </div>

        <nav className="sidebar__nav">
          <div className="sidebar__section-title">Menu</div>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`sidebar__item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="item-icon">{item.icon}</span>
              <span className="item-label">{item.label}</span>
            </div>
          ))}

          <div className="sidebar__divider" />

          <div className="sidebar__section-title">Library</div>
          {LIBRARY_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`sidebar__item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="item-icon">{item.icon}</span>
              <span className="item-label">{item.label}</span>
            </div>
          ))}

          <div className="sidebar__divider" />

          <div className="sidebar__section-title">Manage</div>
          <div
            className={`sidebar__item ${activeNav === "upload" ? "active" : ""}`}
            onClick={() => setActiveNav("upload")}
          >
            <span className="item-icon">⬆</span>
            <span className="item-label">Upload Song</span>
          </div>

          <div className="sidebar__divider" />

          <div className="sidebar__section-title">Mood</div>
          {Object.entries(MOOD_CONFIG).map(([key, m]) => (
            <div
              key={key}
              className={`sidebar__item ${currentMood === key ? "active" : ""}`}
              style={{ "--mood-color": m.color, "--mood-glow": m.glow, "--mood-border": m.border }}
              onClick={() => switchMood(key)}
            >
              <span className="item-icon">{m.emoji}</span>
              <span className="item-label">{m.label}</span>
              {currentMood === key && <span className="sidebar__mood-dot" />}
            </div>
          ))}
        </nav>

        <div className="sidebar__user" onClick={handleLogout} title="Click to logout">
          <div className="user-avatar">{avatarLetter}</div>
          <div className="user-info">
            <div className="user-name">{user?.username || "User"}</div>
            <div className="user-status">Click to logout</div>
          </div>
          <span className="logout-btn">→</span>
        </div>
      </aside>

      <div className="main-content">
        <div className="topbar">
          <div className="topbar__greeting">
            Good {getTimeOfDay()}, {user?.username || "there"} {mood.emoji}
          </div>
          <div className="topbar__status">{statusText}</div>
          <button
            className="topbar__detect-btn"
            onClick={handleDetectMood}
            disabled={detecting || loading || !modelReady}
          >
            {detecting ? "Detecting..." : "✦ Detect Mood"}
          </button>
        </div>

        {renderContent()}

        {/* ✅ Player yahan hai — har page pe dikhega, song hamesha play hoga */}
        <Player />
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}