import { useNavigate } from "react-router-dom";
import { T, ft, sn } from "../constants/theme";
import { PROFS } from "../constants/professions";
import { useAuth } from "../hooks/useAuth";
import { updateProfile } from "../services/auth";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const selectProfession = async (profId) => {
    await updateProfile({ profession: profId });
    await refreshUser();
    navigate("/dashboard");
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sn }}>
      <div style={{ maxWidth: 580, margin: "0 auto", padding: "72px 24px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.ac, marginBottom: 10 }}>
          Before we start
        </p>
        <h2 style={{ fontFamily: ft, fontSize: 32, color: T.text, fontWeight: 400, margin: "0 0 6px" }}>
          What's your field?
        </h2>
        <p style={{ fontSize: 14, color: T.tm, margin: "0 0 30px", lineHeight: 1.6 }}>
          Helps frame exercises around your work.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
          {PROFS.map(p => (
            <button
              key={p.id}
              onClick={() => selectProfession(p.id)}
              style={{
                background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8,
                padding: "16px 14px", cursor: "pointer", textAlign: "left",
                fontFamily: sn, transition: "all 0.15s", color: T.text,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.ac; e.currentTarget.style.background = T.bgEl; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.bgCard; }}
            >
              <span style={{ fontSize: 18, display: "block", marginBottom: 4, color: T.ac }}>{p.i}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{p.l}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
