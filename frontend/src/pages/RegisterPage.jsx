import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { T, ft, sn } from "../constants/theme";
import { useAuth } from "../hooks/useAuth";
import Btn from "../components/Btn";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password);
      navigate("/onboarding");
    } catch (err) {
      setError(err.message || "Registration failed");
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
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.ac, marginBottom: 10, textAlign: "center" }}>
          Get started
        </p>
        <h2 style={{ fontFamily: ft, fontSize: 32, color: T.text, fontWeight: 400, margin: "0 0 6px", textAlign: "center" }}>
          Create your account
        </h2>
        <p style={{ fontSize: 14, color: T.tm, margin: "0 0 30px", textAlign: "center" }}>
          Start learning prompt engineering today
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
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
          </div>
          <Btn disabled={loading} style={{ width: "100%", padding: "12px 20px" }}>
            {loading ? "Creating account..." : "Create account"}
          </Btn>
        </form>

        <p style={{ fontSize: 13, color: T.tm, textAlign: "center", marginTop: 24 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: T.ac, textDecoration: "none" }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
