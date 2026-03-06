import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, getMe, logout } from "../services/auth.api";

export const useAuth = () => {
  const { user, setUser, loading, setLoading } = useContext(AuthContext);

  // Runs once when app loads — checks if user session exists via cookie
  // No matter what happens (success, error, timeout) loading MUST become false
  // Otherwise Protected.jsx shows blank screen forever on refresh
  useEffect(() => {
    async function checkSession() {
      try {
        const data = await getMe();
        setUser(data.user);
      } catch {
        // Not logged in, session expired, backend down, or timeout — all fine
        setUser(null);
      } finally {
        // This line is the most important — always runs no matter what
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  async function handleRegister({ username, email, password }) {
    setLoading(true);
    const data = await register({ username, email, password });
    setUser(data.user);
    setLoading(false);
  }

  async function handleLogin({ email, username, password }) {
    setLoading(true);
    const data = await login({ email, username, password });
    setUser(data.user);
    setLoading(false);
  }

  async function handleGetMe() {
    try {
      setLoading(true);
      const data = await getMe();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    await logout();
    setUser(null);
    setLoading(false);
  }

  return {
    user,
    loading,
    handleRegister,
    handleLogin,
    handleGetMe,
    handleLogout,
  };
};