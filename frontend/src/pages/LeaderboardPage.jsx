import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { T, ft, sn } from "../constants/theme";
import { apiFetch } from "../services/api";
import NavBar from "../components/NavBar";

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    apiFetch("/leaderboard?limit=20")
      .then(setLeaders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sn }}>
      <div data-container style={{ maxWidth: 620, margin: "0 auto", padding: "0 24px" }}>
        <NavBar />

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.ac, marginBottom: 8 }}>
          {t("leaderboard.tagline")}
        </p>
        <h2 style={{ fontFamily: ft, fontSize: 28, color: T.text, fontWeight: 400, margin: "0 0 28px" }}>
          {t("leaderboard.title")}
        </h2>

        {loading ? (
          <p style={{ fontSize: 13, color: T.tm }}>{t("common.loading")}</p>
        ) : leaders.length === 0 ? (
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: 32, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: T.tm, margin: 0 }}>{t("leaderboard.empty")}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {leaders.map((u) => {
              const isTop3 = u.rank <= 3;
              const medal = u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : u.rank === 3 ? "🥉" : null;
              return (
                <div key={u.rank} style={{
                  background: isTop3 ? T.bgEl : T.bgCard,
                  border: `1px solid ${isTop3 ? T.bh : T.border}`,
                  borderRadius: 10, padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 14,
                  boxShadow: isTop3 ? T.shadow : "none",
                }}>
                  <span style={{ fontFamily: ft, fontSize: 20, color: isTop3 ? T.ac : T.td, minWidth: 32, textAlign: "center" }}>
                    {medal || u.rank}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        onClick={() => navigate(`/profile/${u.username}`)}
                        style={{ fontSize: 14, fontWeight: 600, color: T.text, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}
                      >{u.username}</span>
                      {u.profession && (
                        <span style={{ fontSize: 10, color: T.td, textTransform: "uppercase", letterSpacing: "0.04em" }}>{u.profession}</span>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: T.tm }}>{u.level} · {u.exercises_completed} {t("leaderboard.exercises")}</span>
                  </div>
                  <span style={{ fontFamily: ft, fontSize: 18, color: T.ac, fontWeight: 400 }}>
                    {u.total_xp} <span style={{ fontSize: 11, color: T.tm }}>{t("common.xp")}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}
