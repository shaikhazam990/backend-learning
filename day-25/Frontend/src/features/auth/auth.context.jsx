import { useState, createContext, useEffect } from "react";
import { getMe, guestLogin } from "./services/auth.api"

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      // 4 sec mein backend respond nahi kiya → demo user
      setUser({
        _id: "demo",
        username: "Guest",
        email: "guest@demo.com",
        isGuest: true,
      });
      setLoading(false);
    }, 4000);

    getMe()
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        // getMe fail → auto guest login
        return guestLogin()
          .then((data) => setUser(data.user))
          .catch(() => {
            setUser({
              _id: "demo",
              username: "Guest",
              isGuest: true,
            });
          });
      })
      .finally(() => {
        clearTimeout(fallbackTimer);
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};