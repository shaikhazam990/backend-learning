import { useState, useEffect } from "react";
import { getRecentlyPlayed } from "../service/recent.api";
import { useSong } from "../hooks/useSong";
import "../style/RecentlyPlayed.scss";

const MOOD_CONFIG = {
  happy:     { color: "#F4C542" },
  sad:       { color: "#6C9FD4" },
  angry:     { color: "#FF4E4E" },
  surprised: { color: "#B06EFF" },
  neutral:   { color: "#A0A0B0" },
};

export default function RecentlyPlayed() {
  const { handlePlaySong } = useSong();

  const [songs,     setSongs]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    fetchRecent();
  }, []);

  async function fetchRecent() {
    setLoading(true);
    try {
      const data = await getRecentlyPlayed();
      setSongs(data.songs);
    } catch (err) {
      console.error("Failed to fetch recently played:", err);
    } finally {
      setLoading(false);
    }
  }

  async function playSong(song) {
    setPlayingId(song._id);
    await handlePlaySong(song._id);
  }

  return (
    <div className="recent-page">

      {/* Hero header */}
      <div className="recent-page__hero">
        <div className="recent-page__hero-icon">🕐</div>
        <div>
          <div className="recent-page__label">History</div>
          <h2 className="recent-page__title">Recently Played</h2>
          <p className="recent-page__count">
            {loading ? "Loading..." : `${songs.length} songs`}
          </p>
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="recent-list">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="recent-row recent-row--skeleton">
              <div className="skeleton" style={{ width: 20, height: 14 }} />
              <div className="skeleton recent-row__poster-skeleton" />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <div className="skeleton" style={{ width: "55%", height: 13 }} />
                <div className="skeleton" style={{ width: "25%", height: 11 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && songs.length === 0 && (
        <div className="recent-empty">
          <span>🕐</span>
          <p>No recently played songs</p>
          <small>Play a song and it will appear here</small>
        </div>
      )}

      {/* Songs list */}
      {!loading && songs.length > 0 && (
        <div className="recent-list">

          <div className="recent-col-header">
            <span>#</span>
            <span></span>
            <span>Title</span>
            <span>Mood</span>
          </div>
          <div className="recent-divider" />

          {songs.map((song, index) => {
            const moodInfo  = MOOD_CONFIG[song.mood] || MOOD_CONFIG.neutral;
            const isPlaying = playingId === song._id;

            return (
              <div
                key={song._id}
                className={`recent-row ${isPlaying ? "recent-row--playing" : ""}`}
                style={{ "--row-color": moodInfo.color }}
                onClick={() => playSong(song)}
              >
                <span className="recent-row__num">
                  {isPlaying ? "▶" : index + 1}
                </span>

                <img
                  className="recent-row__poster"
                  src={song.posterUrl}
                  alt={song.title}
                />

                <div className="recent-row__info">
                  <span className="recent-row__title">
                    {song.title.replace(/&quot;/g, '"').replace(/&amp;/g, "&")}
                  </span>
                  {song.artist && song.artist !== "Unknown Artist" && (
                    <span className="recent-row__artist">{song.artist}</span>
                  )}
                </div>

                <span className="recent-row__mood">{song.mood}</span>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}