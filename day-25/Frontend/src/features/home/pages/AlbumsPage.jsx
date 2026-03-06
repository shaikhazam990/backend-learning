import { useState, useEffect } from "react";
import { getAlbums } from "../../home/service/song.api";
import { useSong } from "../hooks/useSong";
import "../style/AlbumsPage.scss";

const MOOD_CONFIG = {
  happy:     { color: "#F4C542", glow: "rgba(244,197,66,0.25)"  },
  sad:       { color: "#6C9FD4", glow: "rgba(108,159,212,0.25)" },
  angry:     { color: "#FF4E4E", glow: "rgba(255,78,78,0.25)"   },
  surprised: { color: "#B06EFF", glow: "rgba(176,110,255,0.25)" },
  neutral:   { color: "#A0A0B0", glow: "rgba(160,160,176,0.25)" },
};

const MOOD_FILTERS = ["all", "happy", "sad", "surprised", "angry", "neutral"];

export default function AlbumsPage() {
  const { handlePlaySong } = useSong();

  const [albums,     setAlbums]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [playingId,  setPlayingId]  = useState(null);
  const [search,     setSearch]     = useState("");
  const [activeMood, setActiveMood] = useState("all");
  const [hoveredId,  setHoveredId]  = useState(null);

  useEffect(() => {
    fetchAlbums();
  }, []);

  async function fetchAlbums() {
    setLoading(true);
    try {
      const data = await getAlbums();
      setAlbums(data.albums);
    } catch (err) {
      console.error("Failed to fetch albums:", err);
    } finally {
      setLoading(false);
    }
  }

  // Play the exact song/album clicked by its ID
  async function playAlbum(album) {
    setPlayingId(album._id);
    await handlePlaySong(album._id);
  }

  const filtered = albums.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchMood   = activeMood === "all" || a.mood === activeMood;
    return matchSearch && matchMood;
  });

  return (
    <div className="albums-page">

      <div className="albums-page__header">
        <div>
          <h2 className="albums-page__title">Albums</h2>
          <p className="albums-page__sub">{albums.length} songs in your library</p>
        </div>
        <input
          className="albums-page__search"
          type="text"
          placeholder="Search songs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="albums-filters">
        {MOOD_FILTERS.map((m) => (
          <button
            key={m}
            className={`filter-pill ${activeMood === m ? "active" : ""}`}
            style={activeMood === m && m !== "all" ? {
              background: MOOD_CONFIG[m]?.color,
              borderColor: "transparent",
              color: "#000",
            } : {}}
            onClick={() => setActiveMood(m)}
          >
            {m === "all" ? "All" : m}
          </button>
        ))}
      </div>

      {loading && (
        <div className="albums-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="album-card album-card--skeleton">
              <div className="skeleton album-card__img-skeleton" />
              <div style={{ padding: "12px 4px" }}>
                <div className="skeleton" style={{ width: "75%", height: 13, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: "45%", height: 11 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="albums-empty">
          <span>💿</span>
          <p>No albums found</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="albums-grid">
          {filtered.map((album) => {
            const moodInfo  = MOOD_CONFIG[album.mood] || MOOD_CONFIG.neutral;
            const isPlaying = playingId === album._id;
            const isHovered = hoveredId === album._id;

            return (
              <div
                key={album._id}
                className={`album-card ${isPlaying ? "album-card--playing" : ""}`}
                style={{ "--card-color": moodInfo.color, "--card-glow": moodInfo.glow }}
                onMouseEnter={() => setHoveredId(album._id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => playAlbum(album)}
              >
                <div className="album-card__img-wrap">
                  <img className="album-card__img" src={album.posterUrl} alt={album.title} />
                  <div className={`album-card__overlay ${isHovered || isPlaying ? "album-card__overlay--visible" : ""}`}>
                    <button className="album-card__play-btn">
                      {isPlaying ? "⏸" : "▶"}
                    </button>
                  </div>
                  {isPlaying && (
                    <div className="album-card__playing-badge">
                      <span className="playing-dot" />
                      <span className="playing-dot" />
                      <span className="playing-dot" />
                    </div>
                  )}
                </div>
                <div className="album-card__info">
                  <div className="album-card__title">
                    {album.title.replace(/&quot;/g, '"').replace(/&amp;/g, "&")}
                  </div>
                  <div className="album-card__mood-tag">{album.mood}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}