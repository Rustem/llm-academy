import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { T, ft, sn } from "../constants/theme";
import { COURSES } from "../constants/courses";
import { useAuth } from "../hooks/useAuth";
import NavBar from "../components/NavBar";

export default function CoursesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const open = (course) => {
    if (course.requiresAuth && !user) {
      navigate("/login", { state: { from: `/course/${course.id}` } });
      return;
    }
    navigate(`/course/${course.id}`);
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sn }}>
      <div data-container style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
        <NavBar />

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.ac, marginBottom: 8 }}>
          {t("courses.chooseYourPath")}
        </p>
        <h2 style={{ fontFamily: ft, fontSize: 28, color: T.text, fontWeight: 400, margin: "0 0 6px" }}>
          {t("courses.title")}
        </h2>
        <p style={{ fontSize: 14, color: T.tm, margin: "0 0 32px", lineHeight: 1.6 }}>
          {t("courses.subtitle")}
        </p>

        <div data-layout="courses-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {COURSES.map(c => {
            const clr = T[c.color];
            return (
              <button
                key={c.id}
                onClick={() => open(c)}
                style={{
                  background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12,
                  padding: "24px 22px", cursor: "pointer", textAlign: "left",
                  fontFamily: sn, transition: "all 0.15s", color: T.text,
                  boxShadow: T.shadow, position: "relative", overflow: "hidden",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = clr.text; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22, color: clr.text }}>{c.icon}</span>
                  <span style={{ fontFamily: ft, fontSize: 18, fontWeight: 400 }}>{c.title}</span>
                </div>
                <p style={{ fontSize: 12, color: clr.text, fontWeight: 600, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {c.sub}
                </p>
                <p style={{ fontSize: 13, color: T.tm, margin: 0, lineHeight: 1.6 }}>
                  {c.desc}
                </p>
                {!c.requiresAuth && (
                  <span style={{
                    position: "absolute", top: 14, right: 14,
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                    background: clr.bg, color: clr.text, padding: "3px 8px", borderRadius: 4,
                  }}>
                    {t("common.free")}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 10 }}>
          {[
            { to: "/leaderboard", label: t("leaderboard.title") },
          ].map(link => (
            <button key={link.to}
              onClick={() => navigate(link.to)}
              style={{
                background: "none", border: `1px solid ${T.border}`, borderRadius: 8,
                padding: "10px 20px", fontFamily: sn, fontSize: 13, fontWeight: 600,
                color: T.ac, cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.ac; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}
            >
              {link.label} →
            </button>
          ))}
        </div>

        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}
