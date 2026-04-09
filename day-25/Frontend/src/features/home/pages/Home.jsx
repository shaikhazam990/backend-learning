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
import YouTubeSearch  from "./YouTubeSearch";
import { getAllSongs } from "../service/song.api";
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
  { id: "home",    icon: "⊞",  label: "Home"            },
  { id: "liked",   icon: "♥",  label: "Liked Songs"     },
  { id: "recent",  icon: "🕐", label: "Recently Played" },
  { id: "youtube", icon: "▶",  label: "YouTube Music"   },
];

const LIBRARY_ITEMS = [
  { id: "artists", icon: "🎤", label: "Artists" },
  { id: "albums",  icon: "💿", label: "Albums"  },
  { id: "songs",   icon: "♪",  label: "Songs"   },
];

// ✅ Clean junk from song titles like [DownloadMing.WS], (www.xxx.com) etc.
function cleanTitle(title = "") {
  return title
    .replace(/\[.*?\]/g, "")         // remove [anything]
    .replace(/\(www\.[^)]*\)/gi, "") // remove (www.xyz.com)
    .replace(/\(https?[^)]*\)/gi, "") // remove (http://...)
    .replace(/\s{2,}/g, " ")         // collapse double spaces
    .trim();
}

export default function Home() {
  const { song, loading, handleGetSong, handlePlaySong } = useSong();
  const { user, handleLogout } = useAuth();

  const videoRef      = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef     = useRef(null);

  const [camActive,    setCamActive]    = useState(false);
  const [modelReady,   setModelReady]   = useState(false);
  const [detecting,    setDetecting]    = useState(false);
  const [expression,   setExpression]   = useState("Detecting...");
  const [currentMood,  setCurrentMood]  = useState(song?.mood || "sad");
  const [statusText,   setStatusText]   = useState("Start camera to detect your mood");
  const [activeNav,    setActiveNav]    = useState("home");
  const [moodSongs,    setMoodSongs]    = useState([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [isPlaying,    setIsPlaying]    = useState(false);

  const mood = MOOD_CONFIG[currentMood] || MOOD_CONFIG.neutral;

  useEffect(() => { fetchMoodSongs(currentMood); }, [currentMood]);

  useEffect(() => {
    return () => {
      landmarkerRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (song?.mood) setCurrentMood(song.mood);
    // When song changes, assume it starts playing
    if (song) setIsPlaying(true);
  }, [song]);

  async function fetchMoodSongs(moodKey) {
    setSongsLoading(true);
    try {
      const data = await getAllSongs({ mood: moodKey });
      setMoodSongs(data.songs || []);
    } catch (err) {
      console.error("Failed to fetch mood songs:", err);
    } finally {
      setSongsLoading(false);
    }
  }

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
    if (activeNav === "youtube") return <YouTubeSearch />;

    const cleanedTitle = cleanTitle(song?.title);

    return (
      <div className="home-body">

        {/* ── LEFT: Camera Panel ── */}
        <div className="camera-panel">
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
            {camActive && <div className="mood-badge">{mood.emoji} {mood.label}</div>}
            {camActive && <div className="expression-label">{expression}</div>}
          </div>
          <div className="camera-controls">
            {camActive ? (
              <button className="cam-btn cam-btn--stop" onClick={stopCamera}>✕ Stop</button>
            ) : (
              <button className="cam-btn cam-btn--start" onClick={startCamera}>📷 Start</button>
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

        {/* ── CENTER: Now Playing ── */}
        <div className="now-playing-panel">

          {/* ✅ Blurred bg poster — Spotify style */}
          {song?.posterUrl && (
            <div
              className="now-playing-bg"
              style={{ backgroundImage: `url(${song.posterUrl})` }}
            />
          )}
          <div className="now-playing-overlay" />

          {/* ✅ Rotating album art when playing */}
          <div className="album-art-wrap">
            {loading ? (
              <div className="skeleton" style={{ width: 220, height: 220, borderRadius: "50%" }} />
            ) : song?.posterUrl ? (
              <img
                className={`album-art ${isPlaying ? "album-art--spinning" : ""}`}
                src={song.posterUrl}
                alt={song.title || "Album art"}
              />
            ) : (
              <div className="album-placeholder">🎵</div>
            )}
            {song?.posterUrl && <div className="album-art-glow" />}
          </div>

          {/* Song info */}
          <div className="song-info">
            {loading ? (
              <>
                <div className="skeleton" style={{ width: 260, height: 28, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: 120, height: 16 }} />
              </>
            ) : (
              <>
                <div className="song-title">
                  {cleanedTitle || "Detect your mood to play a song"}
                </div>
                {song?.artist && song.artist !== "Unknown Artist" && (
                  <div className="song-artist">{song.artist}</div>
                )}
                <div className="song-mood-tag">{mood.emoji} {mood.label}</div>
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT: Mood Songs Queue ── */}
        <div className="mood-queue">
          <div className="mood-queue__header">
            <span className="mood-queue__title">{mood.emoji} {mood.label} Songs</span>
            <span className="mood-queue__count">
              {songsLoading ? "..." : `${moodSongs.length} songs`}
            </span>
          </div>
          <div className="mood-queue__list">
            {songsLoading && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="queue-row queue-row--skeleton">
                <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 8, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: "70%", height: 12, marginBottom: 6 }} />
                  <div className="skeleton" style={{ width: "45%", height: 10 }} />
                </div>
              </div>
            ))}
            {!songsLoading && moodSongs.length === 0 && (
              <div className="queue-empty">
                <p>No {mood.label} songs yet</p>
                <small>Upload some songs!</small>
              </div>
            )}
            {!songsLoading && moodSongs.map((s) => {
              const isActive = song?._id === s._id;
              return (
                <div
                  key={s._id}
                  className={`queue-row ${isActive ? "queue-row--active" : ""}`}
                  onClick={() => handlePlaySong(s._id)}
                >
                  <div className="queue-row__art-wrap">
                    <img className="queue-row__art" src={s.posterUrl} alt={s.title} />
                    <div className="queue-row__play-icon">{isActive ? "▐▐" : "▶"}</div>
                  </div>
                  <div className="queue-row__info">
                    <span className="queue-row__title">{cleanTitle(s.title)}</span>
                    {s.artist && s.artist !== "Unknown Artist" && (
                      <span className="queue-row__artist">{s.artist}</span>
                    )}
                  </div>
                  {isActive && <span className="queue-row__eq">♫</span>}
                </div>
              );
            })}
          </div>
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

      <div className={`main-content ${activeNav === "youtube" ? "main-content--scroll" : ""}`}>
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

        {activeNav !== "youtube" && <Player />}
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