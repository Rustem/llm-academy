import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { T, ft, sn } from "../constants/theme";
import { MODS } from "../constants/modules";
import { useAuth } from "../hooks/useAuth";
import Btn from "../components/Btn";
import AdPlaceholder from "../components/AdPlaceholder";

export default function LandingPage() {
  const [fi, setFi] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { requestAnimationFrame(() => setFi(true)); }, []);

  const mc = (mod) => T[mod.color];
  const go = () => navigate(user ? "/dashboard" : "/register");

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sn, opacity: fi ? 1 : 0, transition: "opacity 0.5s" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0" }}>
          <span style={{ fontFamily: ft, fontSize: 23, color: T.text }}>LLM Academy</span>
          <div style={{ display: "flex", gap: 8 }}>
            {!user && <Btn onClick={() => navigate("/login")} v="ghost">Log in</Btn>}
            <Btn onClick={go}>{user ? "Continue" : "Get started"}</Btn>
          </div>
        </div>
        <div style={{ padding: "72px 0 56px", maxWidth: 580 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.ac, marginBottom: 14 }}>
            For knowledge workers
          </p>
          <h1 style={{ fontFamily: ft, fontSize: "clamp(36px,5.5vw,52px)", fontWeight: 400, lineHeight: 1.12, color: T.text, margin: "0 0 18px", letterSpacing: "-0.02em" }}>
            Learn to work with AI<br />by actually working with AI.
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: T.tm, margin: "0 0 32px" }}>
            23 hands-on exercises that teach you to write prompts that get it right the first time. Real workplace scenarios. Instant AI feedback. No coding required.
          </p>
          <Btn onClick={go} style={{ padding: "13px 30px", fontSize: 14 }}>Begin exercises →</Btn>
        </div>

        <div style={{ borderTop: `1px solid ${T.border}`, padding: "44px 0" }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.td, marginBottom: 28 }}>
            The method
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 24 }}>
            {[
              { n: "01", t: "Read the scenario", d: "Real workplace situations — contracts, reports, hiring." },
              { n: "02", t: "Write your prompt", d: "Apply specificity, chain-of-thought, few-shot patterns." },
              { n: "03", t: "Test it live", d: "Your prompt runs against real AI. See the actual output." },
              { n: "04", t: "Get scored", d: "AI evaluates against criteria. Stars, feedback, tips." },
            ].map((s, i) => (
              <div key={i}>
                <span style={{ fontFamily: ft, fontSize: 28, color: T.ac }}>{s.n}</span>
                <h3 style={{ fontFamily: sn, fontSize: 14, fontWeight: 600, color: T.text, margin: "6px 0 4px" }}>{s.t}</h3>
                <p style={{ fontSize: 12, color: T.tm, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${T.border}`, padding: "44px 0 72px" }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.td, marginBottom: 20 }}>
            3 modules · 23 exercises
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {MODS.map(mod => {
              const c = mc(mod);
              return (
                <div key={mod.id} style={{ background: c.bg, borderRadius: 8, padding: 20, border: `1px solid ${c.border}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: c.text }}>
                    Module {mod.id}
                  </span>
                  <h3 style={{ fontFamily: ft, fontSize: 20, color: T.text, margin: "4px 0 2px", fontWeight: 400 }}>{mod.title}</h3>
                  <p style={{ fontSize: 12, color: T.tm, margin: 0 }}>{mod.sub}</p>
                </div>
              );
            })}
          </div>
        </div>

        <AdPlaceholder slot="landing-bottom" height={120} />

        <div style={{ borderTop: `1px solid ${T.border}`, padding: "24px 0", textAlign: "center" }}>
          <button
            onClick={() => navigate("/privacy")}
            style={{ background: "none", border: "none", color: T.tm, fontSize: 12, cursor: "pointer", textDecoration: "underline", fontFamily: sn }}
          >
            Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
}
