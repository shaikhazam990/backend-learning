import { useState, useEffect } from "react";
import { getAllSongs } from "../../home/service/song.api";
import { useSong } from "../hooks/useSong";
import "../style/ArtistsPage.scss";

const MOOD_CONFIG = {
  happy:     { color: "#F4C542", glow: "rgba(244,197,66,0.25)"  },
  sad:       { color: "#6C9FD4", glow: "rgba(108,159,212,0.25)" },
  angry:     { color: "#FF4E4E", glow: "rgba(255,78,78,0.25)"   },
  surprised: { color: "#B06EFF", glow: "rgba(176,110,255,0.25)" },
  neutral:   { color: "#A0A0B0", glow: "rgba(160,160,176,0.25)" },
};

export default function ArtistsPage() {
  const { handlePlaySong } = useSong();

  const [artists,        setArtists]        = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [playingId,      setPlayingId]      = useState(null);
  const [search,         setSearch]         = useState("");

  useEffect(() => {
    fetchAndGroupArtists();
  }, []);

  async function fetchAndGroupArtists() {
    setLoading(true);
    try {
      const data = await getAllSongs();
      const artistMap = {};

      data.songs.forEach((song) => {
        const name = song.artist || "Unknown Artist";
        if (!artistMap[name]) {
          artistMap[name] = { name, coverUrl: song.posterUrl, songs: [], moods: [] };
        }
        artistMap[name].songs.push(song);
        if (!artistMap[name].moods.includes(song.mood)) {
          artistMap[name].moods.push(song.mood);
        }
      });

      setArtists(Object.values(artistMap));
    } catch (err) {
      console.error("Failed to fetch artists:", err);
    } finally {
      setLoading(false);
    }
  }

  // Play the exact song clicked
  async function playSong(song) {
    setPlayingId(song._id);
    await handlePlaySong(song._id);
  }

  const filteredArtists = artists.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── Artist detail view ────────────────────────────────────────────────────
  if (selectedArtist) {
    return (
      <div className="artists-page">
        <button className="back-btn" onClick={() => setSelectedArtist(null)}>
          ← All Artists
        </button>

        <div
          className="artist-detail__hero"
          style={{
            "--hero-color": MOOD_CONFIG[selectedArtist.moods[0]]?.color || "#dd4200",
            "--hero-glow":  MOOD_CONFIG[selectedArtist.moods[0]]?.glow  || "rgba(221,66,0,0.25)",
          }}
        >
          <img className="artist-detail__avatar" src={selectedArtist.coverUrl} alt={selectedArtist.name} />
          <div className="artist-detail__info">
            <div className="artist-detail__label">Artist</div>
            <div className="artist-detail__name">{selectedArtist.name}</div>
            <div className="artist-detail__meta">
              {selectedArtist.songs.length} songs · {selectedArtist.moods.join(", ")}
            </div>
          </div>
        </div>

        <div className="artist-detail__songs">
          <div className="songs-col-header">
            <span>#</span>
            <span></span>
            <span>Title</span>
            <span>Mood</span>
          </div>
          <div className="songs-divider" />

          {selectedArtist.songs.map((song, index) => {
            const moodInfo  = MOOD_CONFIG[song.mood] || MOOD_CONFIG.neutral;
            const isPlaying = playingId === song._id;

            return (
              <div
                key={song._id}
                className={`song-row ${isPlaying ? "song-row--playing" : ""}`}
                style={{ "--row-color": moodInfo.color }}
                onClick={() => playSong(song)}
              >
                <span className="song-row__num">{isPlaying ? "▶" : index + 1}</span>
                <img className="song-row__poster" src={song.posterUrl} alt={song.title} />
                <div className="song-row__title">
                  {song.title.replace(/&quot;/g, '"').replace(/&amp;/g, "&")}
                </div>
                <div className="song-row__mood">{song.mood}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Artists grid view ─────────────────────────────────────────────────────
  return (
    <div className="artists-page">

      <div className="artists-page__header">
        <div>
          <h2 className="artists-page__title">Artists</h2>
          <p className="artists-page__sub">{artists.length} artists in your library</p>
        </div>
        <input
          className="artists-page__search"
          type="text"
          placeholder="Search artists..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && (
        <div className="artists-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="artist-card artist-card--skeleton">
              <div className="skeleton artist-card__avatar-skeleton" />
              <div className="skeleton" style={{ width: "60%", height: 13, marginTop: 12 }} />
              <div className="skeleton" style={{ width: "35%", height: 11, marginTop: 7 }} />
            </div>
          ))}
        </div>
      )}

      {!loading && filteredArtists.length === 0 && (
        <div className="artists-empty">
          <span>🎤</span>
          <p>No artists found</p>
        </div>
      )}

      {!loading && filteredArtists.length > 0 && (
        <div className="artists-grid">
          {filteredArtists.map((artist, i) => (
            <div
              key={i}
              className="artist-card"
              onClick={() => setSelectedArtist(artist)}
            >
              <div className="artist-card__avatar-wrap">
                <img className="artist-card__avatar" src={artist.coverUrl} alt={artist.name} />
                <div className="artist-card__overlay">
                  <span className="artist-card__play">▶</span>
                </div>
              </div>
              <div className="artist-card__name">{artist.name}</div>
              <div className="artist-card__count">{artist.songs.length} songs</div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}