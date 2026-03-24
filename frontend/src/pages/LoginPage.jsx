import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { T, ft, sn } from "../constants/theme";
import { useAuth } from "../hooks/useAuth";
import Btn from "../components/Btn";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.profession ? "/dashboard" : "/onboarding");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", fontFamily: sn, fontSize: 14, color: T.text,
    background: T.bgIn, border: `1px solid ${T.border}`, borderRadius: 8,
    padding: "12px 14px", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sn }}>
      <div style={{ maxWidth: 400, margin: "0 auto", padding: "72px 24px" }}>
        <h2 style={{ fontFamily: ft, fontSize: 32, color: T.text, fontWeight: 400, margin: "0 0 6px", textAlign: "center" }}>
          Welcome back
        </h2>
        <p style={{ fontSize: 14, color: T.tm, margin: "0 0 30px", textAlign: "center" }}>
          Log in to continue your exercises
        </p>

        {error && (
          <div style={{ background: "rgba(255,69,58,0.1)", border: "1px solid rgba(255,69,58,0.3)", borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: "#ff453a", margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: T.tm, display: "block", marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: T.tm, display: "block", marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
          </div>
          <Btn disabled={loading} style={{ width: "100%", padding: "12px 20px" }}>
            {loading ? "Logging in..." : "Log in"}
          </Btn>
        </form>

        <p style={{ fontSize: 13, color: T.tm, textAlign: "center", marginTop: 24 }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: T.ac, textDecoration: "none" }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
