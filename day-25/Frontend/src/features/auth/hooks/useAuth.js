import { useContext, useEffect } from "react";
import { AuthContext }           from "../auth.context";
import { login, register, getMe, logout, guestLogin } from "../services/auth.api";

export const useAuth = () => {
  const { user, setUser, loading, setLoading } = useContext(AuthContext);

  useEffect(() => {
    async function checkSession() {
      try {
        const data = await getMe();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
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

  async function handleGuestLogin() {
    setLoading(true);
    const data = await guestLogin();
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
    handleGuestLogin,
    handleGetMe,
    handleLogout,
  };
};