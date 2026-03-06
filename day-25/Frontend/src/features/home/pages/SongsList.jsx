import { useState, useEffect } from "react";
import { getAllSongs } from "../../home/service/song.api";
import { likeSong, unlikeSong, getLikedSongs } from "../../home/service/like.api";
import { useSong } from "../hooks/useSong";
import "../style/SongsList.scss";

const MOOD_CONFIG = {
  happy:     { color: "#F4C542" },
  sad:       { color: "#6C9FD4" },
  angry:     { color: "#FF4E4E" },
  surprised: { color: "#B06EFF" },
  neutral:   { color: "#A0A0B0" },
};

const MOOD_FILTERS = ["all", "happy", "sad", "surprised", "angry", "neutral"];

export default function SongsList() {
  const { handlePlaySong } = useSong();

  const [songs,      setSongs]      = useState([]);
  const [likedIds,   setLikedIds]   = useState(new Set());
  const [loading,    setLoading]    = useState(true);
  const [playingId,  setPlayingId]  = useState(null);
  const [activeMood, setActiveMood] = useState("all");
  const [search,     setSearch]     = useState("");

  useEffect(() => {
    fetchSongs(activeMood);
    fetchLikedIds();
  }, [activeMood]);

  async function fetchSongs(mood) {
    setLoading(true);
    try {
      const data = await getAllSongs({ mood: mood === "all" ? null : mood });
      setSongs(data.songs);
    } catch (err) {
      console.error("Failed to fetch songs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLikedIds() {
    try {
      const data = await getLikedSongs();
      setLikedIds(new Set(data.songs.map((s) => s._id)));
    } catch (err) {
      console.error("Failed to fetch liked:", err);
    }
  }

  // Click on row → play that exact song
  async function playSong(song) {
    setPlayingId(song._id);
    await handlePlaySong(song._id);
  }

  // Heart click → like/unlike (don't trigger play)
  async function toggleLike(e, song) {
    e.stopPropagation();
    const isLiked = likedIds.has(song._id);
    setLikedIds((prev) => {
      const next = new Set(prev);
      isLiked ? next.delete(song._id) : next.add(song._id);
      return next;
    });
    try {
      isLiked ? await unlikeSong(song._id) : await likeSong(song._id);
    } catch {
      fetchLikedIds();
    }
  }

  const filtered = songs.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="songs-list">

      {/* Header */}
      <div className="songs-list__header">
        <h2 className="songs-list__title">Songs</h2>
        <input
          className="songs-list__search"
          type="text"
          placeholder="Search songs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Mood filter pills */}
      <div className="songs-list__filters">
        {MOOD_FILTERS.map((m) => (
          <button
            key={m}
            className={`filter-pill ${activeMood === m ? "active" : ""}`}
            onClick={() => setActiveMood(m)}
          >
            {m === "all" ? "All" : m}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="songs-list__body">

        {/* Column headers */}
        <div className="songs-list__col-header">
          <span>#</span>
          <span>Title</span>
          <span>Mood</span>
          <span></span>
        </div>
        <div className="songs-list__divider" />

        {/* Skeleton */}
        {loading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="song-row song-row--skeleton">
            <div className="skeleton" style={{ width: 20, height: 14 }} />
            <div className="skeleton" style={{ width: "60%", height: 14 }} />
          </div>
        ))}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="songs-list__empty">
            <span>🎵</span>
            <p>No songs found</p>
          </div>
        )}

        {/* Song rows */}
        {!loading && filtered.map((song, index) => {
          const moodInfo  = MOOD_CONFIG[song.mood] || MOOD_CONFIG.neutral;
          const isPlaying = playingId === song._id;
          const isLiked   = likedIds.has(song._id);

          return (
            <div
              key={song._id}
              className={`song-row ${isPlaying ? "song-row--playing" : ""}`}
              style={{ "--row-color": moodInfo.color }}
              onClick={() => playSong(song)}
            >
              {/* # */}
              <span className="song-row__num">
                {isPlaying ? "▶" : index + 1}
              </span>

              {/* Poster + Title */}
              <div className="song-row__left">
                <img className="song-row__poster" src={song.posterUrl} alt={song.title} />
                <span className="song-row__title">
                  {song.title.replace(/&quot;/g, '"').replace(/&amp;/g, "&")}
                </span>
              </div>

              {/* Mood */}
              <span className="song-row__mood">{song.mood}</span>

              {/* Heart — stop propagation so click doesn't play song */}
              <button
                className={`song-row__heart ${isLiked ? "song-row__heart--liked" : ""}`}
                style={{ "--heart-color": moodInfo.color }}
                onClick={(e) => toggleLike(e, song)}
                title={isLiked ? "Unlike" : "Like"}
              >
                {isLiked ? "♥" : "♡"}
              </button>
            </div>
          );
        })}

      </div>
    </div>
  );
}