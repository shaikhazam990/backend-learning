import { createContext, useState } from "react";

export const SongContext = createContext();

export const SongContextProvider = ({ children }) => {
  const [song, setSong] = useState({
    url: "https://ik.imagekit.io/gdmcmlxtw/cohort-2/moodify/songs/Paan_Dukaniya__From__quot_Bholaa_quot____DownloadMing.WS__TrSXxFov8.mp3",
    posterUrl:
      "https://ik.imagekit.io/gdmcmlxtw/cohort-2/moodify/posters/Paan_Dukaniya__From__quot_Bholaa_quot____DownloadMing.WS__6ZclvpKNa.jpeg",
    title: "Paan Dukaniya (From &quot;Bholaa&quot;) [DownloadMing.WS]",
    mood: "sad",
  })

    const [loading, setLoading] = useState(false)

    return (
        <SongContext.Provider value={{song,setSong, loading, setLoading}}>
            {children}
        </SongContext.Provider>
    )
}
