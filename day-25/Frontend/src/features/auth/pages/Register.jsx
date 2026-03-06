import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import FormGroup from "../components/FormGroup";
import "../style/register.scss";

const Register = () => {
  const { loading, handleRegister } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      await handleRegister({ username, email, password });
      navigate("/");
    } catch (err) {
      setError("Registration failed. This email might already be in use.");
    }
  }

  return (
    <main className="register-page">
      <div className="form-container">

        {/* Logo + tagline */}
        <div className="logo">
          <span>mood</span>ify
        </div>
        <p className="tagline">Music that matches your mood 🎵</p>

        <h1>Create account</h1>

        {/* Error message shown if registration fails */}
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <FormGroup
            label="Name"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <FormGroup
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormGroup
            label="Password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>

      </div>
    </main>
  );
};

export default Register;