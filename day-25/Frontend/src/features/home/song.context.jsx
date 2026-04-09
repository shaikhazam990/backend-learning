import { createContext, useState } from "react";

export const SongContext = createContext();

export const SongContextProvider = ({ children }) => {
  // Start with null — no dummy song
  // Player will show nothing until user plays a song
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <SongContext.Provider value={{ song, setSong, loading, setLoading }}>
      {children}
    </SongContext.Provider>
  );
};