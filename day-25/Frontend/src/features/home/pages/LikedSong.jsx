import { useState, useEffect } from "react";
import { getLikedSongs, unlikeSong } from "../../home/service/like.api";
import { useSong } from "../hooks/useSong";
import "../style/LikedSong.scss";

const MOOD_CONFIG = {
  happy:     { color: "#F4C542" },
  sad:       { color: "#6C9FD4" },
  angry:     { color: "#FF4E4E" },
  surprised: { color: "#B06EFF" },
  neutral:   { color: "#A0A0B0" },
};

export default function LikedSongs() {
  const { handlePlaySong } = useSong();

  const [songs,     setSongs]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    fetchLiked();
  }, []);

  async function fetchLiked() {
    setLoading(true);
    try {
      const data = await getLikedSongs();
      setSongs(data.songs);
    } catch (err) {
      console.error("Failed to fetch liked songs:", err);
    } finally {
      setLoading(false);
    }
  }

  // Play the exact song clicked
  async function playSong(song) {
    setPlayingId(song._id);
    await handlePlaySong(song._id);
  }

  // Unlike and remove from list immediately
  async function handleUnlike(e, songId) {
    e.stopPropagation();
    setSongs((prev) => prev.filter((s) => s._id !== songId));
    try {
      await unlikeSong(songId);
    } catch (err) {
      console.error("Unlike failed:", err);
      fetchLiked();
    }
  }

  return (
    <div className="liked-page">

      <div className="liked-page__hero">
        <div className="liked-page__hero-icon">♥</div>
        <div>
          <div className="liked-page__label">Playlist</div>
          <h2 className="liked-page__title">Liked Songs</h2>
          <p className="liked-page__count">
            {loading ? "Loading..." : `${songs.length} songs`}
          </p>
        </div>
      </div>

      {loading && (
        <div className="liked-list">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="liked-row liked-row--skeleton">
              <div className="skeleton" style={{ width: 20, height: 14 }} />
              <div className="skeleton liked-row__poster-skeleton" />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <div className="skeleton" style={{ width: "55%", height: 13 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && songs.length === 0 && (
        <div className="liked-empty">
          <span>♡</span>
          <p>No liked songs yet</p>
          <small>Click the heart on any song to save it here</small>
        </div>
      )}

      {!loading && songs.length > 0 && (
        <div className="liked-list">
          <div className="liked-col-header">
            <span>#</span>
            <span></span>
            <span>Title</span>
            <span>Mood</span>
            <span></span>
          </div>
          <div className="liked-divider" />

          {songs.map((song, index) => {
            const moodInfo  = MOOD_CONFIG[song.mood] || MOOD_CONFIG.neutral;
            const isPlaying = playingId === song._id;

            return (
              <div
                key={song._id}
                className={`liked-row ${isPlaying ? "liked-row--playing" : ""}`}
                style={{ "--row-color": moodInfo.color }}
                onClick={() => playSong(song)}
              >
                <span className="liked-row__num">
                  {isPlaying ? "▶" : index + 1}
                </span>
                <img className="liked-row__poster" src={song.posterUrl} alt={song.title} />
                <div className="liked-row__info">
                  <span className="liked-row__title">
                    {song.title.replace(/&quot;/g, '"').replace(/&amp;/g, "&")}
                  </span>
                  {song.artist && song.artist !== "Unknown Artist" && (
                    <span className="liked-row__artist">{song.artist}</span>
                  )}
                </div>
                <span className="liked-row__mood">{song.mood}</span>
                <button
                  className="liked-row__heart liked-row__heart--filled"
                  onClick={(e) => handleUnlike(e, song._id)}
                  title="Remove from liked"
                >
                  ♥
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}