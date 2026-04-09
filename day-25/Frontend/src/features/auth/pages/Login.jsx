import { useState }            from "react";
import { Link, useNavigate }   from "react-router";
import { useAuth }             from "../hooks/useAuth";
import FormGroup               from "../components/FormGroup";
import "../style/login.scss";

const Login = () => {
  const { loading, handleLogin, handleGuestLogin } = useAuth();
  const navigate = useNavigate();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [error,        setError]        = useState("");
  const [guestLoading, setGuestLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await handleLogin({ email, password });
      navigate("/");
    } catch {
      setError("Invalid email or password. Please try again.");
    }
  }

  async function onGuestLogin() {
    setGuestLoading(true);
    setError("");
    try {
      await handleGuestLogin();
      navigate("/");
    } catch {
      setError("Guest login failed. Please try again.");
    } finally {
      setGuestLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="form-container">

        <div className="logo"><span>mood</span>ify</div>
        <p className="tagline">Music that matches your mood 🎵</p>

        <h1>Welcome back</h1>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <FormGroup
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormGroup
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>or</span>
        </div>

        {/* Guest Login */}
        <button
          className="guest-btn"
          onClick={onGuestLogin}
          disabled={guestLoading}
        >
          {guestLoading ? "Loading..." : "👤 Continue as Guest"}
        </button>
        <p className="guest-note">No account needed — explore instantly</p>

        <p>Don't have an account? <Link to="/register">Register here</Link></p>

      </div>
    </main>
  );
};

export default Login;