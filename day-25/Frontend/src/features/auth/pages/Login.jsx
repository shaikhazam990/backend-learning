import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import FormGroup from "../components/FormGroup";
import "../style/login.scss";

const Login = () => {
  const { loading, handleLogin } = useAuth();
  const navigate = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await handleLogin({ email, password });
      navigate("/");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    }
  }

  return (
    <main className="login-page">
      <div className="form-container">

        {/* Logo + tagline */}
        <div className="logo">
          <span>mood</span>ify
        </div>
        <p className="tagline">Music that matches your mood 🎵</p>

        <h1>Welcome back</h1>

        {/* Error message shown if login fails */}
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

        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>

      </div>
    </main>
  );
};

export default Login;