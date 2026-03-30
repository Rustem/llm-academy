import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { T, ft, sn } from "../constants/theme";
import { COURSES } from "../constants/courses";
import { apiFetch } from "../services/api";
import NavBar from "../components/NavBar";

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    apiFetch(`/profiles/${username}`)
      .then(setProfile)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sn }}><div style={{ maxWidth: 620, margin: "0 auto", padding: "0 24px" }}><NavBar /><p style={{ color: T.tm }}>{t("common.loading")}</p></div></div>;
  if (error || !profile) return <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sn }}><div style={{ maxWidth: 620, margin: "0 auto", padding: "0 24px" }}><NavBar /><p style={{ color: T.tm }}>{t("profile.notFound")}</p></div></div>;

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sn }}>
      <div data-container style={{ maxWidth: 620, margin: "0 auto", padding: "0 24px" }}>
        <NavBar />

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", background: T.acg2,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px", fontSize: 24, color: T.ac,
          }}>
            {profile.username[0].toUpperCase()}
          </div>
          <h2 style={{ fontFamily: ft, fontSize: 28, color: T.text, fontWeight: 400, margin: "0 0 4px" }}>
            {profile.username}
          </h2>
          {profile.profession && (
            <p style={{ fontSize: 12, color: T.td, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>
              {profile.profession}
            </p>
          )}
          <span style={{
            fontFamily: sn, fontSize: 12, fontWeight: 600, color: T.ac,
            background: T.acg2, padding: "4px 12px", borderRadius: 4,
          }}>
            {profile.level}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 32 }}>
          {[
            { l: t("common.xp"), v: profile.total_xp, c: T.ac },
            { l: t("profile.exercisesDone"), v: profile.exercises_completed },
            { l: t("profile.courses"), v: Object.keys(profile.courses).length },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <p style={{ fontFamily: ft, fontSize: 28, color: s.c || T.text, margin: "0 0 2px" }}>{s.v}</p>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.td }}>{s.l}</span>
            </div>
          ))}
        </div>

        {Object.keys(profile.courses).length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.td, marginBottom: 12 }}>
              {t("profile.courseProgress")}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(profile.courses).map(([courseId, stats]) => {
                const course = COURSES.find(c => c.id === courseId);
                const clr = course ? T[course.color] : T.coral;
                return (
                  <div key={courseId} style={{
                    background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8,
                    padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {course && <span style={{ fontSize: 16, color: clr.text }}>{course.icon}</span>}
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{course?.title || courseId}</span>
                    </div>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: T.tm }}>{stats.exercises} {t("leaderboard.exercises")}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: clr.text }}>{stats.xp} {t("common.xp")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {profile.member_since && (
          <p style={{ fontSize: 11, color: T.td, textAlign: "center", marginTop: 24 }}>
            {t("profile.memberSince")} {new Date(profile.member_since).toLocaleDateString()}
          </p>
        )}

        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}
