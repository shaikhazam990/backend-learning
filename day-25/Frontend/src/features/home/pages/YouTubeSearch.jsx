import { useState, useRef } from "react";
import "../style/YouTubeSearch.scss";

export default function YouTubeSearch() {
  const [query,      setQuery]      = useState("");
  const [videos,     setVideos]     = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [activeId,   setActiveId]   = useState(null); // currently playing video
  const inputRef = useRef(null);

  // Quick mood search chips
  const QUICK_SEARCHES = [
    { label: "Happy",     q: "happy mood songs" },
    { label: "Sad",       q: "sad songs hindi" },
    { label: "Angry",     q: "angry rap songs" },
    { label: "Surprised", q: "surprising upbeat songs" },
    { label: "Chill",     q: "chill lofi songs" },
    { label: "Rock",      q: "rock songs hits" },
    { label: "Party",     q: "party dance songs" },
    { label: "Night",     q: "late night songs" },
  ];

  async function searchVideos(searchQuery) {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setError("");
    setActiveId(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/youtube/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Search failed");

      setVideos(data.videos);
    } catch (err) {
      setError("Search failed. Check your internet or try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") searchVideos();
  }

  function handleQuickSearch(q) {
    setQuery(q);
    searchVideos(q);
  }

  function playVideo(videoId) {
    setActiveId(videoId);
    // Scroll to player
    setTimeout(() => {
      document.getElementById("yt-player")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  return (
    <div className="yt-page">

      {/* Header */}
      <div className="yt-header">
        <div className="yt-header__icon">▶</div>
        <div>
          <h2 className="yt-header__title">YouTube Music</h2>
          <p className="yt-header__sub">Search any song, artist, or mood</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="yt-search">
        <input
          ref={inputRef}
          className="yt-search__input"
          type="text"
          placeholder="Search songs, artists, moods..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="yt-search__btn"
          onClick={() => searchVideos()}
          disabled={loading}
        >
          {loading ? "..." : "Search"}
        </button>
      </div>

      {/* Quick Mood Chips */}
      <div className="yt-chips">
        {QUICK_SEARCHES.map((item) => (
          <button
            key={item.q}
            className="yt-chip"
            onClick={() => handleQuickSearch(item.q)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && <div className="yt-error">{error}</div>}

      {/* YouTube Embed Player - activeId hone pe dikhega */}
      {activeId && (
        <div className="yt-player-wrap" id="yt-player">
          <iframe
            className="yt-player__frame"
            src={`https://www.youtube.com/embed/${activeId}?autoplay=1`}
            title="YouTube Player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="yt-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="yt-card yt-card--skeleton">
              <div className="skeleton yt-card__thumb-skeleton" />
              <div className="yt-card__info">
                <div className="skeleton" style={{ height: 14, width: "80%", marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 12, width: "50%" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Grid */}
      {!loading && videos.length > 0 && (
        <>
          <p className="yt-results-count">{videos.length} results for "{query}"</p>
          <div className="yt-grid">
            {videos.map((video) => (
              <div
                key={video.videoId}
                className={`yt-card ${activeId === video.videoId ? "yt-card--active" : ""}`}
                onClick={() => playVideo(video.videoId)}
              >
                <div className="yt-card__thumb-wrap">
                  <img
                    className="yt-card__thumb"
                    src={video.thumbnail}
                    alt={video.title}
                  />
                  <div className="yt-card__play-overlay">
                    {activeId === video.videoId ? "▐▐" : "▶"}
                  </div>
                </div>
                <div className="yt-card__info">
                  <p className="yt-card__title">
                    {video.title.replace(/&quot;/g, '"').replace(/&amp;/g, "&")}
                  </p>
                  <p className="yt-card__channel">{video.channel}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && videos.length === 0 && !error && (
        <div className="yt-empty">
          <span>🎵</span>
          <p>Search karo apna favourite song</p>
          <small>Ya upar mood chips try karo</small>
        </div>
      )}

    </div>
  );
}