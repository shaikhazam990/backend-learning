import { getSong, getSongById } from "../service/song.api";
import { useContext } from "react";
import { SongContext } from "../song.context";

export const useSong = () => {
  const { song, setSong, loading, setLoading } = useContext(SongContext);

  // Play a random song by mood — used after face detection or mood switch
  async function handleGetSong({ mood }) {
    setLoading(true);
    const data = await getSong({ mood });
    setSong(data.song);
    setLoading(false);
  }

  // Play a specific song directly by its ID — used when user clicks a song row
  async function handlePlaySong(songId) {
    setLoading(true);
    const data = await getSongById(songId);
    setSong(data.song);
    setLoading(false);
  }

  return { song, loading, handleGetSong, handlePlaySong };
};