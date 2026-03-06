import { useState, useRef } from "react";
import "../style/UploadPage.scss";
import axios from "axios";

const MOODS = ["happy", "sad", "angry", "surprised", "neutral"];

const MOOD_CONFIG = {
  happy:     { color: "#F4C542", emoji: "😄" },
  sad:       { color: "#6C9FD4", emoji: "😢" },
  angry:     { color: "#FF4E4E", emoji: "😠" },
  surprised: { color: "#B06EFF", emoji: "😲" },
  neutral:   { color: "#A0A0B0", emoji: "😐" },
};

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export default function UploadPage() {
  const fileInputRef = useRef(null);

  const [file,         setFile]         = useState(null);   // selected mp3 file
  const [mood,         setMood]         = useState("");      // selected mood
  const [uploading,    setUploading]    = useState(false);   // upload in progress
  const [progress,     setProgress]     = useState(0);       // upload % progress
  const [successMsg,   setSuccessMsg]   = useState("");      // success message
  const [errorMsg,     setErrorMsg]     = useState("");      // error message
  const [isDragging,   setIsDragging]   = useState(false);  // drag over state

  // ── File selection ────────────────────────────────────────────────────────

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (selected) pickFile(selected);
  }

  function pickFile(selected) {
    // Only allow mp3 files
    if (!selected.name.endsWith(".mp3")) {
      setErrorMsg("Only .mp3 files are allowed.");
      return;
    }
    setFile(selected);
    setErrorMsg("");
    setSuccessMsg("");
  }

  // ── Drag and drop handlers ────────────────────────────────────────────────

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) pickFile(dropped);
  }

  // ── Upload ────────────────────────────────────────────────────────────────

  async function handleUpload() {
    if (!file) {
      setErrorMsg("Please select a song first.");
      return;
    }
    if (!mood) {
      setErrorMsg("Please select a mood for this song.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("song", file);
      formData.append("mood", mood);

      await api.post("/api/songs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        // Track upload progress
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
        },
      });

      setSuccessMsg(`"${file.name}" uploaded successfully as ${mood}! 🎉`);
      setFile(null);
      setMood("");
      setProgress(0);

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg("Upload failed. Make sure the mp3 has proper ID3 tags (title, cover art).");
    } finally {
      setUploading(false);
    }
  }

  const selectedMoodConfig = mood ? MOOD_CONFIG[mood] : null;

  return (
    <div className="upload-page">

      {/* ── Header ── */}
      <div className="upload-page__header">
        <h2 className="upload-page__title">Upload Song</h2>
        <p className="upload-page__sub">
          Add songs to your library — title and cover art are read from the mp3 file automatically
        </p>
      </div>

      <div className="upload-card">

        {/* ── Drag & Drop zone ── */}
        <div
          className={`drop-zone ${isDragging ? "drop-zone--active" : ""} ${file ? "drop-zone--has-file" : ""}`}
          style={selectedMoodConfig ? { "--zone-color": selectedMoodConfig.color } : {}}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {file ? (
            // File selected state
            <div className="drop-zone__file">
              <div className="drop-zone__file-icon">🎵</div>
              <div className="drop-zone__file-name">{file.name}</div>
              <div className="drop-zone__file-size">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
              <button
                className="drop-zone__remove"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                ✕ Remove
              </button>
            </div>
          ) : (
            // Empty state
            <div className="drop-zone__empty">
              <div className="drop-zone__icon">📂</div>
              <div className="drop-zone__text">
                Drag & drop your mp3 here
              </div>
              <div className="drop-zone__sub">or click to browse</div>
            </div>
          )}
        </div>

        {/* ── Mood selector ── */}
        <div className="mood-selector">
          <p className="mood-selector__label">Select Mood</p>
          <div className="mood-selector__grid">
            {MOODS.map((m) => (
              <button
                key={m}
                className={`mood-btn ${mood === m ? "mood-btn--active" : ""}`}
                style={{ "--btn-color": MOOD_CONFIG[m].color }}
                onClick={() => setMood(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* ── Progress bar ── */}
        {uploading && (
          <div className="upload-progress">
            <div className="upload-progress__bar">
              <div
                className="upload-progress__fill"
                style={{
                  width: `${progress}%`,
                  background: selectedMoodConfig?.color || "#dd4200",
                }}
              />
            </div>
            <div className="upload-progress__text">{progress}% uploading...</div>
          </div>
        )}

        {/* ── Success message ── */}
        {successMsg && (
          <div className="upload-success">{successMsg}</div>
        )}

        {/* ── Error message ── */}
        {errorMsg && (
          <div className="upload-error">{errorMsg}</div>
        )}

        {/* ── Upload button ── */}
        <button
          className="upload-btn"
          style={selectedMoodConfig ? { background: selectedMoodConfig.color } : {}}
          onClick={handleUpload}
          disabled={uploading || !file || !mood}
        >
          {uploading ? `Uploading... ${progress}%` : "Upload Song"}
        </button>

        {/* ── Info note ── */}
        <p className="upload-note">
          Make sure your mp3 has ID3 tags — title and cover art are read automatically from the file.
          You can add tags using apps like <strong>MP3Tag</strong> (free).
        </p>

      </div>
    </div>
  );
}