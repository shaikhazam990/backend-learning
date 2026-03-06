import { useState, createContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // loading starts as TRUE — this is important!
  // Protected.jsx will show spinner until getMe() finishes
  // If this starts as false, Protected redirects to /login before getMe runs
  const [loading, setLoading] = useState(true);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};