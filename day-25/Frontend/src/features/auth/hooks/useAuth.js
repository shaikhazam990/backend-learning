import { useContext, useEffect } from "react";
import { AuthContext }           from "../auth.context";
import { login, register, getMe, logout, guestLogin } from "../services/auth.api";

export const useAuth = () => {
  const { user, setUser, loading, setLoading } = useContext(AuthContext);

  // App load pe session check
  useEffect(() => {
    async function checkSession() {
      try {
        const data = await getMe();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false); // ← hamesha false karo
      }
    }
    checkSession();
  }, []);

  async function handleRegister({ username, email, password }) {
    setLoading(true);
    try {
      const data = await register({ username, email, password });
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin({ email, username, password }) {
    setLoading(true);
    try {
      const data = await login({ email, username, password });
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }

  async function handleGuestLogin() {
    setLoading(true);
    try {
      const data = await guestLogin();
      setUser(data.user);      // ← pehle user set karo
    } finally {
      setLoading(false);       // ← phir loading false karo
    }
  }

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  return {
    user,
    loading,
    handleRegister,
    handleLogin,
    handleGuestLogin,
    handleLogout,
  };
};